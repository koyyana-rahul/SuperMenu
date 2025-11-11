import mongoose from "mongoose";

const kitchenStationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

kitchenStationSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

const kitchenStationModel = mongoose.model(
  "kitchenStation",
  kitchenStationSchema
);

export default kitchenStationModel;
