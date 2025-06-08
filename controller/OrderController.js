import sendOrderConfirmationEmail from "../functions/customerEmailTemplate.js";
import sendAdminOrderNotification from "../functions/AdminEmailTemplate.js";
import sendOrderFulfillmentEmail from "../functions/FullFilledEmail.js";
import Order from "../models/Order.js";
import Service from "../models/Service.js";

export const createOrder = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const customerId = req.user?.id;
    
    // Authentication check
    if (!customerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get service and validate
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const { 
      seatsBooked, 
      luggageQuantity,
      quantity, // For parcels
      weight,   // For parcels
      vehicleDetails, // For car towing
      towingRequirements,
      vehicleType, // For vehicle trailer
      trailerRequirements,
      itemCount, // For furniture
      dimensions,
      fragileItems,
      animalCount, // For animals
      animalType,
      specialNeeds,
      cageRequired,
      totalPrice,
      notes
    } = req.body;

    // Validate based on service category
    let validationError;
    switch(service.serviceCategory) {
      case 'passenger':
        if (!seatsBooked || seatsBooked < 1) {
          validationError = "Seats booked must be at least 1";
        } else if (service.availableSeats < seatsBooked) {
          validationError = "Not enough available seats";
        }
        break;

      case 'parcel':
        if (!quantity || quantity < 1) {
          validationError = "Parcel quantity must be at least 1";
        } else if (weight > service.parcelLoadCapacity) {
          validationError = `Weight exceeds maximum capacity of ${service.parcelLoadCapacity}kg`;
        }
        break;

      case 'car_towing':
        if (!vehicleDetails) {
          validationError = "Vehicle details are required";
        }
        break;

      case 'vehicle_trailer':
        if (!vehicleType) {
          validationError = "Vehicle type is required";
        }
        break;

      case 'furniture':
        if (!itemCount || itemCount < 1) {
          validationError = "Item count must be at least 1";
        }
        break;

      case 'animal':
        if (!animalCount || animalCount < 1) {
          validationError = "Animal count must be at least 1";
        } else if (!animalType) {
          validationError = "Animal type is required";
        }
        break;

      default:
        validationError = "Unsupported service category";
    }

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Create order data structure
    const orderData = {
      customerId,
      serviceId,
      serviceCategory: service.serviceCategory,
      totalPrice,
      notes,
      paymentStatus: 'unpaid',
      orderStatus: 'pending'
    };

    // Add category-specific fields
    switch(service.serviceCategory) {
      case 'passenger':
        orderData.seatsBooked = seatsBooked;
        orderData.luggageQuantity = luggageQuantity || 0;
        break;
      case 'parcel':
        orderData.parcelQuantity = quantity;
        orderData.parcelWeight = weight || 0;
        break;
      case 'car_towing':
        orderData.vehicleDetails = vehicleDetails;
        orderData.towingRequirements = towingRequirements || '';
        break;
      case 'vehicle_trailer':
        orderData.vehicleType = vehicleType;
        orderData.trailerRequirements = trailerRequirements || '';
        break;
      case 'furniture':
        orderData.furnitureItemCount = itemCount;
        orderData.furnitureDimensions = dimensions || '';
        orderData.fragileItems = fragileItems || false;
        break;
      case 'animal':
        orderData.animalCount = animalCount;
        orderData.animalType = animalType;
        orderData.specialNeeds = specialNeeds || '';
        orderData.cageRequired = cageRequired || false;
        break;
    }

    // Create and save order
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Update service availability if applicable
    if (service.serviceCategory === 'passenger') {
      service.availableSeats -= seatsBooked;
      await service.save();
    } else if (service.serviceCategory === 'parcel') {
      // Update parcel capacity if needed
      service.parcelLoadCapacity -= weight;
      await service.save();
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("serviceId", "serviceName serviceCategory price")
      .populate("customerId", "name email");

    // Send notifications
    const adminEmail = process.env.ADMIN_EMAIL;
    const transporterEmail = service.transporter?.email;
    const customerName = req.user?.name;
    const customerEmail = req.user?.email;

    await sendOrderConfirmationEmail(customerEmail, customerName, populatedOrder);
    await sendAdminOrderNotification(adminEmail, customerName, populatedOrder);
    
    if (transporterEmail) {
      await sendTransporterNotification(transporterEmail, populatedOrder);
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully!",
      order: populatedOrder,
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate("serviceId", "serviceName servicePic destinationFrom destinationTo travelDate departureTime pricePerSeat ");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found!" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res
        .status(400)
        .json({ message: "Order ID and new status are required." });
    }

    const allowedStatuses = ["Pending", "Fulfilled", "Rejected", "Deleted"];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed statuses: Pending, Fulfilled, Rejected.",
      });
    }

    const order = await Order.findById(orderId).populate(
      "customerId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }


    if (newStatus === "Fulfilled" && order.customerId?.email) {
      await sendOrderFulfillmentEmail(
        order.customerId.email,
        order.customerId.name,
        order
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: newStatus },
      { new: true, runValidators: true }
    ).populate("customerId", "name email");


    return res.status(200).json({
      message: "Order status updated successfully!",
      updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};


export const myOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const myOrders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .populate("customerId", "name email")
      .populate("serviceId", "serviceName serviceCategory servicePic");

    if (!myOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found." });
    }

    res.status(200).json({ success: true, orders: myOrders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderData = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, orderData, {
      new: true,
    });

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Admin logic
    if (req.user.role === "Admin") {
      if (order.orderStatus === "Pending") {
        // Admin cancels pending orders
        order.orderStatus = "Cancelled";
        await order.save();
        return res.status(200).json({ message: "Order Cancelled By Admin" });
      } else {
        // Admin deletes non-pending orders
        await Order.findByIdAndDelete(orderId);
        return res.status(200).json({ message: "Order Deleted By Admin" });
      }
    }

    // User logic
    if (req.user.role === "User") {
      if (order.orderStatus === "Pending") {
        // User cancels pending orders
        order.orderStatus = "Cancelled";
        await order.save();
        return res
          .status(200)
          .json({ message: "Order cancelled Successfully!" });
      } else {
        // User cannot cancel or delete non-pending orders
        // Instead, mark the order as deleted by the user
        order.deletedBy = "user";
        await order.save();
        return res.status(200).json({ message: "Order Deleted Successfully!" });
      }
    }

    // Unauthorized action
    return res.status(403).json({ message: "Unauthorized action" });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
