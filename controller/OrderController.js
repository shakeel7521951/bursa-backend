import sendOrderConfirmationEmail from "../functions/customerEmailTemplate.js";
import sendAdminOrderNotification from "../functions/AdminEmailTemplate.js";
import sendOrderFulfillmentEmail from "../functions/FullFilledEmail.js";
import Order from "../models/Order.js";
import Service from "../models/Service.js";

export const createOrder = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(404).json({ message: "User not found!" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not available" });
    }

    const { data } = req.body;
    const { from, to, distance, date, time } = data;
    const { price } = req.body;

    const pickupDateTime = new Date(`${date}T${time}:00Z`);
    const pickupDateOnly = new Date(date);

    const newOrder = new Order({
      customerId,
      serviceId,
      pickupLocation: from,
      dropoffLocation: to,
      distance: distance || 0,
      price,
      pickupTime: pickupDateTime,
      pickupDate: pickupDateOnly,
    });

    await newOrder.save();

    const populatedOrder = await Order.findById(newOrder._id).populate(
      "serviceId",
      "serviceName serviceCategory"
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    const customerName = req.user?.name;
    const customerEmail = req.user?.email;

    await sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      populatedOrder
    );
    await sendAdminOrderNotification(adminEmail, customerName, populatedOrder);

    return res.status(201).json({
      message: "Order created successfully!",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate("serviceId", "serviceName serviceCategory servicePic");

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
