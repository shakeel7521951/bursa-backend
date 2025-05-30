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
      enum: ["people", "parcels", "vehicles"],
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
    routeCities: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length >= 5;
        },
        message: "At least 5 route cities are required.",
      },
    },
    travelDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true, // Estimated arrival date in Italy
    },
    availabilityDays: {
      romania: {
        type: [String], // e.g., ["Monday", "Friday"]
        required: true,
      },
      italy: {
        type: [String],
        required: true,
      },
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 0, // Should be 0 if not transporting people
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    parcelLoadCapacity: {
      type: Number, // e.g., in kg
      min: 0,
      default: 0,
    },
    pickupOption: {
      type: String,
      enum: ["yes", "no"],
      required: true,
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
