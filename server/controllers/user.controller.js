import brandModel from "../models/brand.model.js";
import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generatedAccessToken } from "../utils/generatedAccessToken.js";
import { genertedRefreshToken } from "../utils/generatedRefreshToken.js";

export const registerBrandAdmin = async (request, response) => {
  try {
    const { name, email, password, brandName } = request.body;

    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      return response.status(400).json({
        message: "user already exists",
        error: true,
        success: false,
      });
    }

    const existingBrand = await brandModel.findOne({ name: brandName });
    if (existingBrand) {
      return response.status(400).json({
        message: "Brand already exists",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);

    const hashPassword = await bcryptjs.hash(password, salt);

    const brandAdmin = await userModel.create({
      name,
      email,
      password: hashPassword,
      role: "BRAND_ADMIN",
      isActive: true,
    });

    const brand = await brandModel.create({
      name: brandName,
      owner: brandAdmin._id,
    });

    brandAdmin.brandId = brand._id;

    await brandAdmin.save();

    return response.status(201).json({
      data: {
        brandAdmin,
        brand,
      },
      message: "Brand and Admin created",
      error: false,
      success: true,
    });
  } catch (err) {
    return response.status(500).json({
      message: err || err.message,
      error: true,
      success: false,
    });
  }
};

export const loginUser = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    // Find user by email (any role)
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return response.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.isActive === false) {
      return response.status(400).json({
        message: "Contact to Admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    await userModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: refreshToken,
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          brandId: user.brandId,
          last_login_date: new Date(),
        },
      },
    });
  } catch (err) {
    return response.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

// export const loginBrandAdmin = async (request, response) => {
//   try {
//     const { email, password } = request.body;

//     if (!email || !password) {
//       return response.status(400).json({
//         message: "Provide email and password",
//         error: true,
//         success: false,
//       });
//     }

//     const user = await userModel
//       .findOne({ email, role: "BRAND_ADMIN" })
//       .select("+password");

//     if (!user) {
//       return response.status(400).json({
//         message: "User not registered",
//         error: true,
//         success: false,
//       });
//     }

//     if (user.isActive === false) {
//       return response.status(400).json({
//         message: "Contact to Admin",
//         error: true,
//         success: false,
//       });
//     }

//     const checkPassword = await bcryptjs.compare(password, user.password);
//     if (!checkPassword) {
//       return response.status(400).json({
//         message: "check your password",
//         error: true,
//         success: false,
//       });
//     }

//     const accesstoken = await generatedAccessToken(user._id);
//     const refreshToken = await genertedRefreshToken(user._id);

//     await userModel.findByIdAndUpdate(user._id, {
//       last_login_date: new Date(),
//       refresh_token: refreshToken,
//     });

//     const cookiesOption = {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None",
//     };

//     response.cookie("accessToken", accesstoken, cookiesOption);
//     response.cookie("refreshToken", refreshToken, cookiesOption);

//     return response.json({
//       message: "Login successfully",
//       error: false,
//       success: true,
//       data: {
//         accesstoken,
//         refreshToken,
//         user: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           brandId: user.brandId,
//           last_login_date: new Date(),
//         },
//       },
//     });
//   } catch (err) {
//     return response.status(500).json({
//       message: err.message || err,
//       error: true,
//       success: false,
//     });
//   }
// };

export async function logoutController(request, response) {
  try {
    const userid = request.userId; // from auth middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    await userModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    return response.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const createManager = async (request, response) => {
  try {
    const { name, email, password } = request.body;
    const adminId = request.userId;

    // Find the Brand Admin
    const adminUser = await userModel.findById(adminId);
    if (!adminUser || adminUser.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can create managers",
        error: true,
        success: false,
      });
    }

    // Check if manager already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return response.status(400).json({
        message: "Manager already exists",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // Create Manager
    const manager = await userModel.create({
      name,
      email,
      password: hashPassword,
      role: "MANAGER",
      brandId: adminUser.brandId,
      isActive: true,
    });

    return response.status(201).json({
      message: "Manager created successfully",
      error: false,
      success: true,
      data: manager,
    });
  } catch (err) {
    return response.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export const getProfile = async (request, response) => {
  try {
    const user = await userModel
      .findById(request.userId)
      .select("-password -refresh_token");
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }
    return response.json({
      message: "Profile fetched",
      error: false,
      success: true,
      data: user,
    });
  } catch (err) {
    return response.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export const updateProfile = async (request, response) => {
  try {
    const { name, avatar, mobile } = request.body;
    const user = await userModel
      .findByIdAndUpdate(
        request.userId,
        { name, avatar, mobile },
        { new: true, runValidators: true }
      )
      .select("-password -refresh_token");
    return response.json({
      message: "Profile updated",
      error: false,
      success: true,
      data: user,
    });
  } catch (err) {
    return response.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};
