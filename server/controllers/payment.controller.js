import Razorpay from "razorpay";
import orderModel from "../models/order.model.js";
import tableModel from "../models/table.model.js";
import restaurantModel from "../models/restaurant.model.js";
import crypto from "crypto";

// @desc    Initiate a payment for an order
// @route   POST /api/payments/initiate
// @access  Public (secured by table PIN)
export const createPaymentOrder = async (request, response) => {
  try {
    const { tableId, pin } = request.body;

    if (!tableId || !pin) {
      return response
        .status(400)
        .json({ message: "Table ID and PIN are required." });
    }

    // 1. Find the table and validate the PIN
    const table = await tableModel.findById(tableId).select("+currentPin");
    if (!table || table.status !== "IN_USE" || table.currentPin !== pin) {
      return response
        .status(403)
        .json({ message: "Invalid PIN for this table." });
    }

    // 2. Find the open order for this table
    const order = await orderModel.findOne({
      tableId: table._id,
      orderStatus: "OPEN",
    });

    if (!order || order.totalAmount <= 0) {
      return response.status(404).json({
        message: "No open order or billable amount found for this table.",
      });
    }

    // 3. Get the restaurant's payment settings
    const restaurant = await restaurantModel
      .findById(order.restaurantId)
      .select("+settings.razorpayKeySecret");
    if (
      !restaurant.settings.allowInAppPayment ||
      !restaurant.settings.razorpayKeyId ||
      !restaurant.settings.razorpayKeySecret
    ) {
      return response
        .status(400)
        .json({ message: "This restaurant does not accept online payments." });
    }

    // 4. Create a Razorpay instance
    const razorpay = new Razorpay({
      key_id: restaurant.settings.razorpayKeyId,
      key_secret: restaurant.settings.razorpayKeySecret,
    });

    // 5. Create a payment order with Razorpay
    const options = {
      amount: order.totalAmount * 100, // Amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: order._id.toString(), // Use our order ID as the receipt
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 6. Save the Razorpay order ID to our order document
    order.paymentDetails = {
      gateway: "Razorpay",
      orderId: razorpayOrder.id,
    };
    await order.save();

    // 7. Return the necessary details to the client
    return response.status(200).json({
      message: "Payment order created successfully.",
      data: {
        razorpayKeyId: restaurant.settings.razorpayKeyId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        restaurantName: restaurant.name,
      },
    });
  } catch (err) {
    request.log.error(err, "Error in createPaymentOrder");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Verify a Razorpay payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = async (request, response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      request.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response
        .status(400)
        .json({ message: "Payment verification details are required." });
    }

    // 1. Find the order using the razorpay_order_id
    const order = await orderModel.findOne({
      "paymentDetails.orderId": razorpay_order_id,
    });

    if (!order) {
      return response.status(404).json({ message: "Order not found." });
    }

    // 2. Get the restaurant's secret key for verification
    const restaurant = await restaurantModel
      .findById(order.restaurantId)
      .select("+settings.razorpayKeySecret");
    if (!restaurant || !restaurant.settings.razorpayKeySecret) {
      return response
        .status(500)
        .json({ message: "Payment gateway not configured correctly." });
    }

    // 3. Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", restaurant.settings.razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return response
        .status(400)
        .json({ message: "Invalid payment signature." });
    }

    // 4. If signature is valid, update the order and table (same logic as closeOrder)
    order.orderStatus = "PAID";
    order.paymentMethod = "UPI_IN_APP"; // Or a more specific method if available
    // You can add more payment details from Razorpay if needed
    // order.paymentDetails.paymentId = razorpay_payment_id;
    await order.save();

    // 5. Update the table to make it available again
    const table = await tableModel.findById(order.tableId);
    if (table) {
      table.status = "AVAILABLE";
      table.currentWaiterId = null;
      table.currentPin = null;
      table.currentPinExpires = null;
      await table.save();
    }

    // 6. Emit a WebSocket event to update dashboards
    request.io.emit(`order_closed::${order.restaurantId}`, {
      orderId: order._id,
    });

    return response.status(200).json({
      message: "Payment successful and order closed.",
      data: {
        orderId: order._id,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (err) {
    request.log.error(err, "Error in verifyPayment");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
