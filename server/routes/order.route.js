import { Router } from "express";
import {
  placeOrder,
  getPendingItemsForStation,
  claimOrderItem,
  markItemAsReady,
  getReadyItems,
  markItemAsServed,
  cancelOrderItem,
  getSuspiciousOrders,
  approveSuspiciousOrder,
  rejectSuspiciousOrder,
  getOpenOrders,
  closeOrder,
} from "../controllers/order.controller.js";
import auth from "../middleware/auth.js";

const orderRouter = Router();

// This is a public route, but secured by the table PIN inside the controller
orderRouter.route("/").post(placeOrder);

// This is a private route for kitchen staff
orderRouter.route("/kitchen/pending").get(auth, getPendingItemsForStation);

orderRouter.route("/items/:itemId/claim").patch(auth, claimOrderItem);

orderRouter.route("/items/:itemId/ready").patch(auth, markItemAsReady);

orderRouter.route("/waiter/ready").get(auth, getReadyItems);

orderRouter.route("/items/:itemId/served").patch(auth, markItemAsServed);

orderRouter.route("/:orderId/close").post(auth, closeOrder);

orderRouter.route("/items/:itemId/cancel").patch(auth, cancelOrderItem);

// Routes for manager to handle suspicious orders
orderRouter.route("/suspicious").get(auth, getSuspiciousOrders);
orderRouter.route("/:orderId/approve").patch(auth, approveSuspiciousOrder);
orderRouter.route("/:orderId/reject").patch(auth, rejectSuspiciousOrder);

// Route for manager to get all open orders
orderRouter.route("/open").get(auth, getOpenOrders);

export default orderRouter;
