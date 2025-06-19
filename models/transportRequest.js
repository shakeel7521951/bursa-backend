import mongoose from "mongoose";

const transportRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  departure: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  passengers: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: String,
    required: true,
    enum: ["Standard", "Express", "Pet Transport", "Oversized", "Luxury"],
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "cancelled","fulfilled"],
    default: "pending",
  },
});

const TransportRequest = mongoose.model(
  "TransportRequest",
  transportRequestSchema
);

export default TransportRequest;
