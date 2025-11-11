import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    settings: {
      maxItemQuantity: {
        type: Number,
        default: 10,
      },
      maxOrderValue: {
        type: Number,
        default: 8000,
      },
      allowInAppPayment: {
        type: Boolean,
        default: false,
      },
      razorpayKeyId: {
        type: String,
        trim: true,
        default: null,
      },
      razorpayKeySecret: {
        type: String,
        select: false,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const restaurantModel = mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;
