import dotenv from "dotenv";
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8080,
  dbUrl: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL,
  accessToken: {
    secret: process.env.SECRET_KEY_ACCESS_TOKEN,
    expiresIn: "15m",
  },
  refreshToken: {
    secret: process.env.SECRET_KEY_REFRESH_TOKEN,
    expiresIn: "7d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
};

export default config;
