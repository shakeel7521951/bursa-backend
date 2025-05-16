import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    luggageQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    invoiceUrl: {
      type: String, // Optional - useful if integrating with payment systems like Stripe
    },
    deletedBy: {
      type: String,
      enum: ["user", "admin"],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
