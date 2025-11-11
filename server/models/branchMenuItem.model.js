import mongoose from "mongoose";

const modifierOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const modifierGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["SINGLE_SELECT", "MULTI_SELECT"],
      default: "SINGLE_SELECT",
    },
    options: [modifierOptionSchema],
  },
  { _id: false }
);

const branchMenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    masterItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "masterMenuItem",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuCategory",
      required: true,
      index: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuSubcategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isVeg: { type: Boolean, default: true },
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    kitchenStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kitchenStation",
      required: true,
    },
    modifiers: [modifierGroupSchema],
  },
  { timestamps: true }
);

const branchMenuItemModel = mongoose.model(
  "branchMenuItem",
  branchMenuItemSchema
);

export default branchMenuItemModel;
