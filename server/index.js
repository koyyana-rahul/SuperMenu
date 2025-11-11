import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import pinoHttp from "pino-http";
import config from "./config/config.js";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import kitchenStationRouter from "./routes/kitchenStation.route.js";
import masterMenuRouter from "./routes/masterMenu.route.js";
import branchMenuRouter from "./routes/branchMenu.route.js";
import menuCategoryRouter from "./routes/menuCategory.route.js";
import menuSubcategoryRouter from "./routes/menuSubCategory.route.js";
import publicRouter from "./routes/public.route.js";
import tableRouter from "./routes/table.route.js";
import orderRouter from "./routes/order.route.js";
import reportingRouter from "./routes/reporting.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make the `io` instance available to all routes via the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected with socket ID:", socket.id);
  // Example: Joining a room for a specific restaurant's kitchen
  // socket.join(`kitchen_${restaurantId}`);
});

// Production-grade logger
app.use(pinoHttp());

app.use(cookieParser());

app.use(express.json());

// More secure helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    credentials: true,
    origin: config.frontendUrl,
  })
);

app.use("/api/auth", userRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/kitchen-stations", kitchenStationRouter);
app.use("/api/master-menu", masterMenuRouter);
app.use("/api/branch-menu", branchMenuRouter);
app.use("/api/menu-categories", menuCategoryRouter);
app.use("/api/menu-subcategories", menuSubcategoryRouter);
app.use("/api/public", publicRouter);
app.use("/api/tables", tableRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reports", reportingRouter);
app.use("/api/payments", paymentRouter);

// Global error handler
app.use((err, req, res, next) => {
  req.log.error(err); // Using pino logger to log the error
  res.status(500).json({
    message: "An internal server error occurred.",
    error: true,
    success: false,
  });
});

connectDB().then(() => {
  httpServer.listen(config.port, () => {
    console.log("Server listening on PORT:: ", config.port);
  });
});
