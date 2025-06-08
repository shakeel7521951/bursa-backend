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
      enum: [
        "passenger", 
        "parcel", 
        "car_towing", 
        "vehicle_trailer", 
        "furniture", 
        "animal"
      ],
      trim: true
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
          return val.length > 0;
        },
        message: "At least 1 route city is required.",
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
      required: true,
    },
    availabilityDays: {
      romania: {
        type: [String],
        required: true,
        validate: {
          validator: function (val) {
            return val.length > 0;
          },
          message: "At least 1 availability day for Romania is required.",
        },
      },
      italy: {
        type: [String],
        required: true,
        validate: {
          validator: function (val) {
            return val.length > 0;
          },
          message: "At least 1 availability day for Italy is required.",
        },
      },
    },
    // Passenger Transport fields
    totalSeats: {
      type: Number,
      min: 0,
      default: 0,
    },
    availableSeats: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Parcel Transport fields
    parcelLoadCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Car Towing fields
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "truck", "van", ""],
      default: "",
    },
    // Vehicle Transport on Trailer fields
    trailerType: {
      type: String,
      enum: ["flatbed", "enclosed", "lowboy", ""],
      default: "",
    },
    // Furniture Transport fields
    furnitureDetails: {
      type: String,
      default: "",
    },
    // Animal Transport fields
    animalType: {
      type: String,
      enum: ["dog", "cat", "bird", "livestock", "other", ""],
      default: "",
    },
    pickupOption: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    price: {
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

// Add index for better query performance
serviceSchema.index({ serviceCategory: 1 });
serviceSchema.index({ destinationFrom: 1, destinationTo: 1 });
serviceSchema.index({ travelDate: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;