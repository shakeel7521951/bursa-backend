import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/useRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import blogRoutes from './routes/blogRoutes.js';
import transportRequest from './routes/transportRequestRoutes.js';
import requestBooking from './routes/requestBookingRoutes.js';

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected"))
  .catch((error) => console.error("Error in connecting database:", error));

app.use("/api/v1", userRoutes);
app.use("/api/v1", serviceRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", blogRoutes);
app.use("/api/v1", transportRequest);
app.use("/api/v1", requestBooking);

app.listen(port, () => {
  console.log(`Server is running on Port no ${port}`);
});