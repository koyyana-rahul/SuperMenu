import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
dotenv.config();

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(morgan("combined"));

app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use("/api/auth", userRouter);

const PORT = 8080 || process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server listening on PORT:: ", PORT);
  });
});
