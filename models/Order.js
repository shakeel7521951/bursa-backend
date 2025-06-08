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
    serviceCategory: {
      type: String,
      required: true,
      enum: ["passenger", "parcel", "car_towing", "vehicle_trailer", "furniture", "animal"]
    },

    // Passenger Transport Fields
    seatsBooked: {
      type: Number,
      min: 1,
      validate: {
        validator: function() {
          return this.serviceCategory === 'passenger' ? this.seatsBooked !== undefined : true;
        },
        message: "Seats booked is required for passenger transport"
      }
    },
    luggageQuantity: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function() {
          return this.serviceCategory === 'passenger' ? this.luggageQuantity !== undefined : true;
        }
      }
    },

    // Parcel Transport Fields
    parcelQuantity: {
      type: Number,
      min: 1,
      validate: {
        validator: function() {
          return this.serviceCategory === 'parcel' ? this.parcelQuantity !== undefined : true;
        },
        message: "Parcel quantity is required for parcel transport"
      }
    },
    parcelWeight: {
      type: Number,
      min: 0,
      validate: {
        validator: function() {
          return this.serviceCategory === 'parcel' ? this.parcelWeight !== undefined : true;
        }
      }
    },

    // Car Towing Fields
    vehicleDetails: {
      type: String,
      validate: {
        validator: function() {
          return this.serviceCategory === 'car_towing' ? this.vehicleDetails !== undefined : true;
        },
        message: "Vehicle details are required for car towing"
      }
    },
    towingRequirements: {
      type: String,
      validate: {
        validator: function() {
          return this.serviceCategory === 'car_towing' ? this.towingRequirements !== undefined : true;
        }
      }
    },

    // Vehicle Transport on Trailer Fields
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "truck", "van", ""],
      validate: {
        validator: function() {
          return this.serviceCategory === 'vehicle_trailer' ? this.vehicleType !== undefined : true;
        }
      }
    },
    trailerRequirements: {
      type: String,
      enum: ["flatbed", "enclosed", "lowboy", ""],
      validate: {
        validator: function() {
          return this.serviceCategory === 'vehicle_trailer' ? this.trailerRequirements !== undefined : true;
        }
      }
    },

    // Furniture Transport Fields
    furnitureItemCount: {
      type: Number,
      min: 1,
      validate: {
        validator: function() {
          return this.serviceCategory === 'furniture' ? this.furnitureItemCount !== undefined : true;
        },
        message: "Item count is required for furniture transport"
      }
    },
    furnitureDimensions: {
      type: String,
      validate: {
        validator: function() {
          return this.serviceCategory === 'furniture' ? this.furnitureDimensions !== undefined : true;
        }
      }
    },
    fragileItems: {
      type: Boolean,
      default: false,
      validate: {
        validator: function() {
          return this.serviceCategory === 'furniture' ? this.fragileItems !== undefined : true;
        }
      }
    },

    // Animal Transport Fields
    animalCount: {
      type: Number,
      min: 1,
      validate: {
        validator: function() {
          return this.serviceCategory === 'animal' ? this.animalCount !== undefined : true;
        },
        message: "Animal count is required for animal transport"
      }
    },
    animalType: {
      type: String,
      enum: ["dog", "cat", "bird", "livestock", "other", ""],
      validate: {
        validator: function() {
          return this.serviceCategory === 'animal' ? this.animalType !== undefined : true;
        }
      }
    },
    specialNeeds: {
      type: String,
      validate: {
        validator: function() {
          return this.serviceCategory === 'animal' ? this.specialNeeds !== undefined : true;
        }
      }
    },
    cageRequired: {
      type: Boolean,
      default: false,
      validate: {
        validator: function() {
          return this.serviceCategory === 'animal' ? this.cageRequired !== undefined : true;
        }
      }
    },

    // Common Order Fields
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid"
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", ""]
    },
    notes: {
      type: String,
      maxlength: 500
    },
    cancellationReason: {
      type: String,
      maxlength: 200
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: String,
      enum: ["customer", "transporter", "admin"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ serviceId: 1 });
orderSchema.index({ serviceCategory: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for formatted order status
orderSchema.virtual('statusFormatted').get(function() {
  return this.orderStatus.charAt(0).toUpperCase() + this.orderStatus.slice(1);
});

const Order = mongoose.model("Order", orderSchema);
export default Order;