import userModel from "../models/user.model.js";

export const brandAdminMiddleware = async (request, response, next) => {
  try {
    const user = await userModel.findById(request.userId);

    if (user && user.role === "BRAND_ADMIN") {
      next();
    } else {
      return response.status(403).json({
        message: "Forbidden: You do not have the required permissions.",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
