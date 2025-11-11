import jwt from "jsonwebtoken";
import config from "../config/config.js";

const auth = async (request, response, next) => {
  try {
    const token =
      request.cookies.accessToken ||
      request.headers.authorization?.split(" ")[1];

    if (!token) {
      return response.status(401).json({
        message: "Provide token",
        error: true,
        success: false,
      });
    }

    // jwt.verify throws an error if the token is invalid, so we use a try...catch block.
    const decode = jwt.verify(token, config.accessToken.secret);

    request.userId = decode.userId;
    request.userRole = decode.role;

    next();
  } catch (error) {
    // Provide more specific error messages based on the type of JWT error.
    if (error.name === "TokenExpiredError") {
      return response
        .status(401)
        .json({
          message: "Token expired. Please log in again.",
          error: true,
          success: false,
        });
    }
    if (error.name === "JsonWebTokenError") {
      return response
        .status(401)
        .json({
          message: "Invalid token. Please log in again.",
          error: true,
          success: false,
        });
    }
    return response.status(401).json({
      message: "Unauthorized. Please log in.",
      error: true,
      success: false,
    });
  }
};

export default auth;
