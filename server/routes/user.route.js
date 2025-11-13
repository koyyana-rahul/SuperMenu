import { Router } from "express";
import {
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
  createManager,
  updateManager,
  toggleManagerStatus,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.js";
import { brandAdminMiddleware } from "../middleware/role.js";
import upload from "../middleware/multer.js";
import { validateRegistration } from "../middleware/validators.js";

const userRouter = Router();

userRouter.post("/register-brand", validateRegistration, registerBrandAdmin);
userRouter.post("/login", loginUser);
userRouter.post("/login-staff", loginStaff);

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/logout", authMiddleware, logoutController);
userRouter.post(
  "/create-manager",
  authMiddleware,
  brandAdminMiddleware,
  createManager
);
userRouter.post("/create-staff", authMiddleware, createStaff);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile
);
userRouter.get("/managers", authMiddleware, getManagersByBrand);
userRouter.get("/staff", authMiddleware, getStaffByRestaurant);
userRouter.get("/all-staff", authMiddleware, getAllStaffForBrand);
userRouter.put("/staff/:staffId", authMiddleware, updateStaff);
userRouter.patch("/staff/:staffId/status", authMiddleware, toggleStaffStatus);
userRouter.patch(
  "/staff/:staffId/assign-station",
  authMiddleware,
  assignChefToStation
);

userRouter
  .route("/manager/:managerId")
  .put(authMiddleware, brandAdminMiddleware, updateManager);
userRouter
  .route("/manager/:managerId/status")
  .patch(authMiddleware, brandAdminMiddleware, toggleManagerStatus);

export default userRouter;
