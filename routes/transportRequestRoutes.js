import express from 'express';
import { createTransportRequest, deleteTransportRequest, getAllTransportRequests, getUserTransportRequests, updateTransportRequest } from '../controller/TransporterRequest.js';
const router = express.Router();
import auth from "../middlewares/AuthMiddleWare.js";

router.post('/transport-request',auth,createTransportRequest);
router.get("/get-all-requests", auth, getAllTransportRequests);
router.get("/get-user-requests", auth, getUserTransportRequests);
router.put("/update-request/:id", auth, updateTransportRequest);
router.delete("/delete-request/:id", auth, deleteTransportRequest);

export default router;