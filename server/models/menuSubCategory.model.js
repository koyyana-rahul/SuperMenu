import mongoose from "mongoose";

const menuSubcategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
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
    description: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const menuSubcategoryModel = mongoose.model(
  "menuSubcategory",
  menuSubcategorySchema
);

export default menuSubcategoryModel;
