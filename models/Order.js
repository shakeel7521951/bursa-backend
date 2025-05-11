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
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    distance: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "Pending",
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