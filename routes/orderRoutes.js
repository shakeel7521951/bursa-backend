import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  myOrders,
  updateOrder,
  updateOrderStatus,
} from "../controller/OrderController.js";
import auth from "../middlewares/AuthMiddleWare.js";
const router = express.Router();

router.post("/create-order/:serviceId", auth, createOrder);
router.get("/all-orders", auth, getAllOrders);
router.put("/update-order-status/:orderId", auth, updateOrderStatus);
router.get("/my-orders", auth, myOrders);
router.put("/update-order/:orderId", auth, updateOrder);
router.delete("/delete-order/:orderId", auth, deleteOrder);

export default router;
