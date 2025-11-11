import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "CLEANING"],
      default: "AVAILABLE",
      index: true,
    },
    currentWaiterId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    currentPin: { type: String, select: false, default: null },
    currentPinExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, name: 1 });

const tableModel = mongoose.model("table", tableSchema);

export default tableModel;
