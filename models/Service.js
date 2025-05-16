import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
      enum: ["Bus", "Shared Ride", "Rental", "Cargo"],
      trim: true,
    },
    destinationFrom: {
      type: String,
      required: true,
      trim: true,
    },
    destinationTo: {
      type: String,
      required: true,
      trim: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0,
    },
    servicePic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
