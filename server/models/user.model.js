import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "provide name"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Necessary because email is not always required
      lowercase: true,
      trim: true,
      required: function () {
        return this.role === "BRAND_ADMIN" || this.role === "MANAGER";
      },
    },
    password: {
      type: String,
      select: false, //hidden unless you explicitly request this field
    },
    staffPin: {
      type: String,
      select: false,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["BRAND_ADMIN", "MANAGER", "CHEF", "WAITER"],
      required: true,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
      required: function () {
        return this.role !== "BRAND_ADMIN";
      },
    },
    restaurantId: {
      type: mongoose.Schema.ObjectId,
      ref: "restaurant",
      index: true,
    },
    kitchenStationId: {
      type: mongoose.Schema.ObjectId,
      ref: "kitchenStation",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: { type: String, default: "" },
    mobile: { type: String, trim: true },
    refresh_token: { type: String, select: false },
    verify_email: { type: Boolean, default: false },
    last_login_date: { type: Date },
    forgot_password_otp: { type: String, select: false },
    forgot_password_expiry: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index(
  { restaurantId: 1, staffPin: 1 },
  { unique: true, sparse: true }
);

userSchema.plugin(mongoosePaginate);

const userModel = mongoose.model("user", userSchema);

export default userModel;
