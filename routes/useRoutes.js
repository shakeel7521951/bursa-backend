import express from "express";
import {
  allUsers,
  appLogin,
  appVerifyUser,
  forgotPasswordOTP,
  login,
  logout,
  myProfile,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserRole,
  verifyOTP,
  verifyUser,
} from "../controller/userController.js";
import auth from "../middlewares/AuthMiddleWare.js";
const router = express.Router();
import upload from "../middlewares/multerConfig.js";

router.post("/login", login); //for web
router.post("/app-login", appLogin); //for app
router.post("/sign-up", register);
router.post("/verify-user", verifyUser); // for web
router.post("/app-verify-user", appVerifyUser); // for app
router.post("/logout", auth, logout);
router.get("/my-profile", auth, myProfile);
router.put("/update-password", auth, updatePassword);
router.get("/all-users", auth, allUsers);
router.put("/update-user-role", auth, updateUserRole);
router.post("/forgot-password-otp", forgotPasswordOTP);
router.post("/verify-otp", verifyOTP);
router.put("/reset-password", resetPassword);
router.put("/update-profile", auth, updateProfile);

export default router;
