import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "CLEANING"],
      default: "AVAILABLE",
      index: true,
    },
    currentWaiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    currentPin: { type: String, select: false, default: null },
    currentPinExpires: { type: Date, select: false, default: null },
    qrCodeUrl: { type: String, default: "" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

const tableModel = mongoose.model("table", tableSchema);

export default tableModel;
