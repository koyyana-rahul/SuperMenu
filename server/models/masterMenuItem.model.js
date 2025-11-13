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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuCategory",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuSubcategory",
      default: null, // Subcategory is optional
    },
    image: { type: String, default: "" },
    dietaryInfo: { type: [String], default: [] },
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
