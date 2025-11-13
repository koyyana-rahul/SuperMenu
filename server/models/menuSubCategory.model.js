import mongoose from "mongoose";

const menuSubcategorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const menuSubcategoryModel = mongoose.model(
  "menuSubcategory",
  menuSubcategorySchema
);

export default menuSubcategoryModel;