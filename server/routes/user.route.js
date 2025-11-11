import { Router } from "express";
import {
  createManager,
  createStaff,
  getProfile,
  getManagersByBrand,
  getStaffByRestaurant,
  getAllStaffForBrand,
  loginUser,
  loginStaff,
  logoutController,
  registerBrandAdmin,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateStaff,
  toggleStaffStatus,
  assignChefToStation,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { validateRegistration } from "../middleware/validators.js";

const userRouter = Router();

userRouter.post("/register-brand", validateRegistration, registerBrandAdmin);
userRouter.post("/login", loginUser);
userRouter.post("/login-staff", loginStaff);

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/logout", auth, logoutController);
userRouter.post("/create-manager", auth, createManager);
userRouter.post("/create-staff", auth, createStaff);
userRouter.get("/profile", auth, getProfile);
userRouter.put("/profile", auth, upload.single("avatar"), updateProfile);
userRouter.get("/managers", auth, getManagersByBrand);
userRouter.get("/staff", auth, getStaffByRestaurant);
userRouter.get("/all-staff", auth, getAllStaffForBrand);
userRouter.put("/staff/:staffId", auth, updateStaff);
userRouter.patch("/staff/:staffId/status", auth, toggleStaffStatus);
userRouter.patch("/staff/:staffId/assign-station", auth, assignChefToStation);

export default userRouter;
