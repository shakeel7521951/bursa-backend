import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    transporter:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    serviceCategory: {
      type: String,
      required: true,
      trim: true,
    },
    price:{
      type:Number,
      required:true
    },
    passengers:{
      type:Number,
      required:true
    },
    doors:{
      type:Number,
      required:true
    },
    servicePic:{
      type:String,
      required:true
    }
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
