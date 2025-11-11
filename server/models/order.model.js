import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    branchMenuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branchMenuItem",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedModifiers: [{ title: String, optionName: String, price: Number }],
    itemStatus: {
      type: String,
      enum: ["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      index: true,
      default: null,
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "table",
      required: true,
      index: true,
    },
    tableName: { type: String, required: true },
    items: [orderItemSchema],
    orderStatus: {
      type: String,
      enum: ["OPEN", "PENDING_APPROVAL", "PAID", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
    totalAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI_IN_APP", "SPLIT"],
      default: null,
    },
    closedByWaiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.totalAmount = this.items.reduce((acc, item) => {
      if (item.itemStatus === "CANCELLED") return acc;
      const modTotal = item.selectedModifiers.reduce(
        (mAcc, m) => mAcc + (m.price || 0),
        0
      );
      return acc + (item.price + modTotal) * item.quantity;
    }, 0);
  }
  next();
});

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
