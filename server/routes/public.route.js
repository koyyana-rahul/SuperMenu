import { Router } from "express";
import {
  getFullMenu,
  getOrderStatus,
} from "../controllers/public.controller.js";

const publicRouter = Router();

// This is a public route, no auth middleware needed
publicRouter.get("/menu/:restaurantId", getFullMenu);
publicRouter.post("/order-status", getOrderStatus);

export default publicRouter;
