import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const menuCategoryModel = mongoose.model(
  "menuCategory",
  menuCategorySchema
);

export default menuCategoryModel;