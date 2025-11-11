import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.ObjectId,
      ref: "restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const menuCategoryModel = mongoose.model(menuCategorySchema);

export default menuCategoryModel;
