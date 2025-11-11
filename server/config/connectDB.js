import mongoose from "mongoose";
import config from "./config.js";

if (!config.dbUrl) {
  throw new Error("please provide MONGODB_URI in .env file");
}

const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl);
    console.log("Database connected");
  } catch (err) {
    console.log("Database not connected");
    process.exit(1);
  }
};

export default connectDB;
