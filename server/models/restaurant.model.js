import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
    isArchived: {
      type: Boolean,
      default: false,
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

// Ensure that for a given brand, restaurant names are unique.
restaurantSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
// Ensure that for a given brand, restaurant phone numbers are unique, but only if a phone number is provided.
restaurantSchema.index(
  { brandId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $ne: "" } } }
);
restaurantSchema.plugin(mongoosePaginate);

const restaurantModel = mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;
