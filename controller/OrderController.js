import sendOrderConfirmationEmail from "../functions/customerEmailTemplate.js";
import sendAdminOrderNotification from "../functions/AdminEmailTemplate.js";
import sendOrderFulfillmentEmail from "../functions/FullFilledEmail.js";
import Order from "../models/Order.js";
import Service from "../models/Service.js";
import sendTransporterNotification from "../functions/sendTransporterNotification.js";
import sendOrderStatusEmail from "../functions/FullFilledEmail.js";

export const createOrder = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const customerId = req.user?.id;

    // Authentication check
    if (!customerId) {
      return res.status(401).json({ message: "Utilizatorul nu este autentificat" });
    }

    // Get service and validate
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Serviciul nu a fost găsit" });
    }

    const {
      seatsBooked,
      luggageQuantity,
      quantity, // For parcels
      weight, // For parcels
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
      notes,
    } = req.body;

    // Validate based on service category
    let validationError;
    switch (service.serviceCategory) {
      case "passenger":
        if (!seatsBooked || seatsBooked < 1) {
          validationError = "Numărul de locuri rezervate trebuie să fie cel puțin 1";
        } else if (service.availableSeats < seatsBooked) {
          validationError = "Nu sunt suficiente locuri disponibile";
        }
        break;

      case "parcel":
        if (!quantity || quantity < 1) {
          validationError = "Cantitatea de colete trebuie să fie cel puțin 1";
        } else if (weight > service.parcelLoadCapacity) {
          validationError = `Greutatea depășește capacitatea maximă de ${service.parcelLoadCapacity}kg`;
        }
        break;

      case "car_towing":
        if (!vehicleDetails) {
          validationError = "Detaliile vehiculului sunt necesare";
        }
        break;

      case "vehicle_trailer":
        if (!vehicleType) {
          validationError = "Tipul vehiculului este necesar";
        }
        break;

      case "furniture":
        if (!itemCount || itemCount < 1) {
          validationError = "Numărul de obiecte trebuie să fie cel puțin 1";
        }
        break;

      case "animal":
        if (!animalCount || animalCount < 1) {
          validationError = "Numărul de animale trebuie să fie cel puțin 1";
        } else if (!animalType) {
          validationError = "Tipul de animal este necesar";
        }
        break;

      default:
        validationError = "Categorie de serviciu nesuportată";
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
      paymentStatus: "unpaid",
      orderStatus: "pending",
    };

    // Add category-specific fields
    switch (service.serviceCategory) {
      case "passenger":
        orderData.seatsBooked = seatsBooked;
        orderData.luggageQuantity = luggageQuantity || 0;
        break;
      case "parcel":
        orderData.parcelQuantity = quantity;
        orderData.parcelWeight = weight || 0;
        break;
      case "car_towing":
        orderData.vehicleDetails = vehicleDetails;
        orderData.towingRequirements = towingRequirements || "";
        break;
      case "vehicle_trailer":
        orderData.vehicleType = vehicleType;
        orderData.trailerRequirements = trailerRequirements || "";
        break;
      case "furniture":
        orderData.furnitureItemCount = itemCount;
        orderData.furnitureDimensions = dimensions || "";
        orderData.fragileItems = fragileItems || false;
        break;
      case "animal":
        orderData.animalCount = animalCount;
        orderData.animalType = animalType;
        orderData.specialNeeds = specialNeeds || "";
        orderData.cageRequired = cageRequired || false;
        break;
    }

    // Create and save order
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Update service availability if applicable
    if (service.serviceCategory === "passenger") {
      service.availableSeats -= seatsBooked;
      await service.save();
    } else if (service.serviceCategory === "parcel") {
      service.parcelLoadCapacity -= weight;
      await service.save();
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate(
        "serviceId",
        "serviceName serviceCategory price destinationFrom destinationTo travelDate pickupOption"
      )
      .populate("customerId", "name email");

    // Send notifications
    const adminEmail = process.env.ADMIN_EMAIL;
    const serviceWithTransporter = await Service.findById(serviceId).populate(
      "transporter"
    );
    const transporterEmail = serviceWithTransporter?.transporter?.email;
    const customerName = req.user?.name;
    const customerEmail = req.user?.email;

    await sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      populatedOrder
    );
    await sendAdminOrderNotification(adminEmail, customerName, populatedOrder);
    if (transporterEmail) {
      await sendTransporterNotification(transporterEmail, populatedOrder);
    }

    return res.status(201).json({
      success: true,
      message: "Comanda a fost creată cu succes!",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Eroare internă a serverului",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate(
        "serviceId",
        "serviceName servicePic destinationFrom destinationTo travelDate departureTime pricePerSeat "
      );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Nu s-au găsit comenzi!" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Eroare internă a serverului. Vă rugăm să încercați din nou mai târziu!",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({ message: "ID-ul comenzii și noul statut sunt obligatorii." });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "rejected",
      "fulfilled"
    ];

    if (!allowedStatuses.includes(newStatus.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status. Allowed statuses: Pending, Confirmed, Completed, Cancelled, Rejected, Fulfilled.",
      });
    }

    const order = await Order.findById(orderId).populate("customerId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Comanda nu a fost găsită!" });
    }

    // Send email for any status update
    if (order.customerId?.email) {
      await sendOrderStatusEmail(order.customerId.email, order.customerId.name, order, newStatus);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: newStatus },
      { new: true, runValidators: true }
    ).populate("customerId", "name email");

    return res.status(200).json({
      message: "Starea comenzii a fost actualizată cu succes!",
      updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal Server Error.", error: error.message });
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
        .json({ success: false, message: "Nu au fost găsite comenzi." });
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
        .json({ success: false, message: "Nu au fost găsite comenzi." });
    }

    res.status(200).json({
      success: true,
      message: "Comanda a fost actualizată cu succes!",
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
      return res.status(404).json({ message: "Nu au fost găsite comenzi." });
    }

    // Admin logic
    if (req.user.role === "Admin") {
      if (order.orderStatus === "Pending") {
        // Admin cancels pending orders
        order.orderStatus = "Cancelled";
        await order.save();
        return res.status(200).json({ message: "Comandă anulată de administrator" });
      } else {
        // Admin deletes non-pending orders
        await Order.findByIdAndDelete(orderId);
        return res.status(200).json({ message: "Comandă ștearsă de administrator" });
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
          .json({ message: "Comandă anulată cu succes!" });
      } else {
        // User cannot cancel or delete non-pending orders
        // Instead, mark the order as deleted by the user
        order.deletedBy = "user";
        await order.save();
        return res.status(200).json({ message: "Comanda a fost ștearsă cu succes!" });
      }
    }

    // Unauthorized action
    return res.status(403).json({ message: "Acțiune neautorizată" });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
