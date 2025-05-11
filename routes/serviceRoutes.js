import express from "express";
import auth from "../middlewares/AuthMiddleWare.js";
import { createService, deleteService, getAllServices, getIndividualServices, updateService } from "../controller/serviceController.js";
import upload from "../middlewares/multerConfig.js";
const router = express.Router();


router.post('/create-service',upload.single('servicePic') , auth,createService);
router.get('/get-all-services',getAllServices);
router.get('/get-individual-services',auth,getIndividualServices);
router.delete('/delete-service/:id',auth,deleteService);
router.put("/update-service/:serviceId", upload.single("servicePic"), updateService);

export default router;