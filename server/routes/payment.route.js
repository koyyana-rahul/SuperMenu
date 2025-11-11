import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/initiate", createPaymentOrder);
paymentRouter.post("/verify", verifyPayment);

export default paymentRouter;
