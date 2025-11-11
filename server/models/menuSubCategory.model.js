import mongoose from "mongoose";

const menuSubcategorySchema = new mongoose.Schema({}, { timestamps: true });

const menuSubcategoryModel = mongoose.model(
  "menuSubcategory",
  menuSubcategorySchema
);

export default menuSubcategoryModel;
