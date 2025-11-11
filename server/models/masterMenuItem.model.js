import mongoose from "mongoose";

const masterMenuItemSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    basePrice: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const masterMenuItemModel = mongoose.model(
  "masterMenuItem",
  masterMenuItemSchema
);

export default masterMenuItemModel;
