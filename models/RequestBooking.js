import mongoose from 'mongoose';

const requestBookingSchema = new mongoose.Schema({
    transporterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TransportRequest",
        required:true
    }
})

const RequestBooking = mongoose.model('RequestBooking',requestBookingSchema);
export default RequestBooking;