import express from 'express';
import { createRequestBooking, getAcceptedTransporterRequests, markRequestFulfilled } from '../controller/requestBookingController.js';
const router = express.Router();
import auth from "../middlewares/AuthMiddleWare.js";

router.post('/create-request-booking/:requestId',auth,createRequestBooking);
router.get("/transporter-accepted-requests", auth, getAcceptedTransporterRequests);
router.patch("/mark-fulfilled/:requestId", auth, markRequestFulfilled);

export default router;