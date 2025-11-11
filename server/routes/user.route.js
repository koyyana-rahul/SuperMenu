import { Router } from "express";
import {
  createManager,
  getProfile,
  loginUser,
  logoutController,
  registerBrandAdmin,
  updateProfile,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/register-brand", registerBrandAdmin);
userRouter.post("/login", loginUser);
userRouter.get("/logout", auth, logoutController);
userRouter.post("/create-manager", auth, createManager);
userRouter.get("/profile", auth, getProfile);
userRouter.put("/profile", auth, updateProfile);

export default userRouter;
