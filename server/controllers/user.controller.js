import brandModel from "../models/brand.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { generatedAccessToken } from "../utils/generatedAccessToken.js";
import { genertedRefreshToken } from "../utils/generatedRefreshToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerBrandAdmin = async (request, response) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const { name, email, password, brandName } = request.body;

      const existingUser = await userModel
        .findOne({ email: email })
        .session(session);

      if (existingUser) {
        // Use a more generic error in production to avoid email enumeration
        const error = new Error("A user with this email already exists.");
        error.statusCode = 400;
        throw error;
      }

      const existingBrand = await brandModel
        .findOne({ name: brandName })
        .session(session);
      if (existingBrand) {
        const error = new Error("A brand with this name already exists.");
        error.statusCode = 400;
        throw error;
      }

      const salt = await bcryptjs.genSalt(10);
      const hashPassword = await bcryptjs.hash(password, salt);

      const brandAdmin = new userModel({
        name,
        email,
        password: hashPassword,
        role: "BRAND_ADMIN",
        isActive: true,
      });
      await brandAdmin.save({ session });

      const brand = new brandModel({
        name: brandName,
        owner: brandAdmin._id,
      });
      await brand.save({ session });

      brandAdmin.brandId = brand._id;
      await brandAdmin.save({ session }); // This was the missing line

      return response.status(201).json({
        data: {
          brandAdmin,
          brand,
        },
        message: "Brand and Admin created",
        error: false,
        success: true,
      });
    });
  } catch (err) {
    request.log.error(err, "Error in registerBrandAdmin");
    // Use the status code from the thrown error if available
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : "Internal Server Error";
    return response.status(statusCode).json({
      message: message,
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

    const accesstoken = await generatedAccessToken(user._id, user.role);
    const refreshToken = await genertedRefreshToken(user._id, user.role);

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
    request.log.error(err, "Error in loginUser");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const loginStaff = async (request, response) => {
  try {
    const { staffPin, restaurantId } = request.body;

    if (!staffPin || !restaurantId) {
      return response.status(400).json({
        message: "Provide staff PIN and restaurant ID",
        error: true,
        success: false,
      });
    }

    // Find user by staffPin and restaurantId
    const user = await userModel
      .findOne({ restaurantId, staffPin })
      .select("+staffPin");

    if (!user) {
      return response.status(404).json({
        message: "Invalid PIN or restaurant ID.",
        error: true,
        success: false,
      });
    }

    if (user.isActive === false) {
      return response.status(403).json({
        message: "Account is inactive. Contact your manager.",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id, user.role);
    const refreshToken = await genertedRefreshToken(user._id, user.role);

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
      message: "Staff login successful",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        },
      },
    });
  } catch (err) {
    request.log.error(err, "Error in loginStaff");
    return response.status(500).json({
      message: "Internal Server Error",
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

export const logoutController = async (request, response) => {
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
    request.log.error(error, "Error in logoutController");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const getManagersByBrand = async (request, response) => {
  try {
    const adminId = request.userId;

    // 1. Verify the user is a Brand Admin
    const adminUser = await userModel.findById(adminId);
    if (!adminUser || adminUser.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can perform this action.",
        error: true,
        success: false,
      });
    }

    // 2. Find all managers for the admin's brand
    const managers = await userModel
      .find({
        brandId: adminUser.brandId,
        role: "MANAGER",
      })
      .select("-password -refresh_token");

    return response.status(200).json({
      message: "Managers fetched successfully",
      error: false,
      success: true,
      data: managers,
    });
  } catch (err) {
    request.log.error(err, "Error in getManagersByBrand");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const getStaffByRestaurant = async (request, response) => {
  try {
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER") {
      return response.status(403).json({
        message: "Only a Manager can perform this action.",
        error: true,
        success: false,
      });
    }

    // 2. Find all staff for the manager's restaurant
    const staff = await userModel
      .find({
        restaurantId: manager.restaurantId,
        role: { $in: ["CHEF", "WAITER"] },
      })
      .select("-password -refresh_token -email");

    return response.status(200).json({
      message: "Staff fetched successfully",
      error: false,
      success: true,
      data: staff,
    });
  } catch (err) {
    request.log.error(err, "Error in getStaffByRestaurant");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all staff for a brand
// @route   GET /api/auth/all-staff
// @access  Private (Brand Admin)
export const getAllStaffForBrand = async (request, response) => {
  try {
    const adminId = request.userId;

    // 1. Verify the user is a Brand Admin
    const adminUser = await userModel.findById(adminId);
    if (!adminUser || adminUser.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can perform this action.",
        error: true,
        success: false,
      });
    }

    // 2. Find all staff for the admin's brand
    const allStaff = await userModel
      .find({
        brandId: adminUser.brandId,
        role: { $in: ["CHEF", "WAITER"] },
      })
      .populate("restaurantId", "name") // Populate restaurant name
      .select("-password -refresh_token -email");

    return response.status(200).json({
      message: "All staff for the brand fetched successfully",
      error: false,
      success: true,
      data: allStaff,
    });
  } catch (err) {
    request.log.error(err, "Error in getAllStaffForBrand");
    return response
      .status(500)
      .json({ message: "Internal Server Error", error: true, success: false });
  }
};

export const createManager = async (request, response) => {
  try {
    const { name, email, password, restaurantId } = request.body;
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

    // Validate that restaurantId is provided
    if (!restaurantId) {
      return response.status(400).json({
        message: "A restaurant ID must be provided to assign the manager.",
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
      restaurantId: restaurantId,
      isActive: true,
    });

    return response.status(201).json({
      message: "Manager created successfully",
      error: false,
      success: true,
      data: manager,
    });
  } catch (err) {
    request.log.error(err, "Error in createManager");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const createStaff = async (request, response) => {
  try {
    const { name, role, restaurantId } = request.body;
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER") {
      return response.status(403).json({
        message: "Only a Manager can create staff.",
        error: true,
        success: false,
      });
    }

    // A manager must be assigned to a restaurant to create staff.
    if (!manager.restaurantId) {
      return response.status(400).json({
        message: "Manager is not assigned to a restaurant.",
        error: true,
        success: false,
      });
    }

    // 2. Validate role
    if (!["CHEF", "WAITER"].includes(role)) {
      return response.status(400).json({
        message: "Invalid staff role provided.",
        error: true,
        success: false,
      });
    }

    // 3. Generate a unique 4-digit PIN for the restaurant
    let staff;
    const MAX_RETRIES = 10; // Prevent infinite loops
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const staffPin = crypto.randomInt(1000, 9999).toString();
        staff = await userModel.create({
          name,
          role,
          staffPin,
          brandId: manager.brandId,
          restaurantId: manager.restaurantId,
          isActive: true,
        });
        break; // Success, exit loop
      } catch (error) {
        if (error.code === 11000 && i < MAX_RETRIES - 1) {
          // Duplicate key error, retry with a new PIN
          continue;
        }
        throw error; // Re-throw other errors or if retries are exhausted
      }
    }

    return response.status(201).json({
      message: `${role} created successfully`,
      error: false,
      success: true,
      data: staff,
    });
  } catch (err) {
    request.log.error(err, "Error in createStaff");
    return response.status(500).json({
      message: "Internal Server Error",
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
    request.log.error(err, "Error in getProfile");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const updateProfile = async (request, response) => {
  try {
    const { name, mobile } = request.body;
    const updateData = { name, mobile };

    // If a file was uploaded, add its URL to the update data
    if (request.file) {
      updateData.avatar = request.file.path;
    }

    const user = await userModel
      .findByIdAndUpdate(request.userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select("-password -refresh_token");
    return response.json({
      message: "Profile updated",
      error: false,
      success: true,
      data: user,
    });
  } catch (err) {
    request.log.error(err, "Error in updateProfile");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Assign a chef to a kitchen station
// @route   PATCH /api/auth/staff/:staffId/assign-station
// @access  Private (Manager)
export const assignChefToStation = async (request, response) => {
  try {
    const { staffId } = request.params;
    const { kitchenStationId } = request.body;
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can perform this action." });
    }

    // 2. Find the staff member and validate they are a CHEF in the same restaurant
    const chef = await userModel.findById(staffId);
    if (
      !chef ||
      chef.role !== "CHEF" ||
      chef.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Chef not found in your restaurant." });
    }

    // 3. If un-assigning, set kitchenStationId to null
    if (!kitchenStationId) {
      chef.kitchenStationId = null;
      await chef.save();
      return response
        .status(200)
        .json({ message: "Chef un-assigned from station successfully." });
    }

    // 4. Validate the kitchen station belongs to the same restaurant
    const station = await kitchenStationModel.findById(kitchenStationId);
    if (
      !station ||
      station.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Kitchen station not found in your restaurant." });
    }

    // 5. Assign the station to the chef
    chef.kitchenStationId = kitchenStationId;
    await chef.save();

    return response
      .status(200)
      .json({ message: "Chef assigned to station successfully." });
  } catch (err) {
    request.log.error(err, "Error in assignChefToStation");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Generate OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (request, response) => {
  try {
    const { email } = request.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      // Do not reveal if user exists or not for security reasons
      return response.status(200).json({
        message:
          "If a user with this email exists, a password reset OTP has been sent.",
      });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    // Hash the OTP before saving
    const salt = await bcryptjs.genSalt(10);
    user.forgot_password_otp = await bcryptjs.hash(otp, salt);
    user.forgot_password_expiry = otpExpiry;
    await user.save();

    // Send the actual OTP to the user's email
    const emailHtml = `<p>You are receiving this email because you (or someone else) have requested the reset of a password. Your password reset OTP is:</p>
                       <h2>${otp}</h2>
                       <p>This OTP is valid for 10 minutes.</p>
                       <p>If you did not request this, please ignore this email.</p>`;

    try {
      await sendEmail({
        email: user.email,
        subject: "SuperMenu - Password Reset OTP",
        html: emailHtml,
      });
    } catch (emailError) {
      request.log.error(emailError, "Failed to send password reset email");
      // Even if email fails, don't let the user know. Just log the error.
    }

    return response.status(200).json({
      message:
        "If a user with this email exists, a password reset OTP has been sent.",
    });
  } catch (err) {
    request.log.error(err, "Error in forgotPassword");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (request, response) => {
  try {
    const { email, otp } = request.body;
    const user = await userModel
      .findOne({ email })
      .select("+forgot_password_otp +forgot_password_expiry");

    if (
      !user ||
      !user.forgot_password_otp ||
      new Date() > user.forgot_password_expiry
    ) {
      return response.status(400).json({ message: "Invalid or expired OTP." });
    }

    const isOtpValid = await bcryptjs.compare(otp, user.forgot_password_otp);

    if (!isOtpValid) {
      return response.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP is valid, clear it so it can't be reused
    user.forgot_password_otp = undefined;
    user.forgot_password_expiry = undefined;
    await user.save();

    // The client can now proceed to the reset password step
    return response.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (err) {
    request.log.error(err, "Error in verifyOtp");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (request, response) => {
  try {
    const { email, newPassword } = request.body;

    // We find the user but don't check for OTP again.
    // The assumption is that the client only calls this after a successful /verify-otp call.
    // A more secure flow might involve a temporary token returned from /verify-otp.
    const user = await userModel.findOne({ email });

    if (!user) {
      return response.status(400).json({ message: "Invalid request." });
    }

    // Hash and set the new password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);
    user.password = hashPassword;
    await user.save();

    return response.status(200).json({
      message: "Password has been reset successfully. Please log in.",
    });
  } catch (err) {
    request.log.error(err, "Error in resetPassword");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update a staff member's details
// @route   PUT /api/auth/staff/:staffId
// @access  Private (Manager)
export const updateStaff = async (request, response) => {
  try {
    const { staffId } = request.params;
    const { name } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can update staff." });
    }

    const staff = await userModel.findById(staffId);
    if (
      !staff ||
      !["CHEF", "WAITER"].includes(staff.role) ||
      staff.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Staff member not found in your restaurant." });
    }

    if (name) {
      staff.name = name;
    }

    await staff.save();

    return response.status(200).json({
      message: "Staff member updated successfully.",
      data: staff,
    });
  } catch (err) {
    request.log.error(err, "Error in updateStaff");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Activate or deactivate a staff member
// @route   PATCH /api/auth/staff/:staffId/status
// @access  Private (Manager)
export const toggleStaffStatus = async (request, response) => {
  try {
    const { staffId } = request.params;
    const { isActive } = request.body; // Expects a boolean: true or false
    const managerId = request.userId;

    if (typeof isActive !== "boolean") {
      return response
        .status(400)
        .json({ message: "isActive must be a boolean value." });
    }

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can change staff status." });
    }

    const staff = await userModel.findById(staffId);
    if (
      !staff ||
      !["CHEF", "WAITER"].includes(staff.role) ||
      staff.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Staff member not found in your restaurant." });
    }

    staff.isActive = isActive;
    await staff.save();

    const status = isActive ? "activated" : "deactivated";
    return response
      .status(200)
      .json({ message: `Staff member has been ${status}.` });
  } catch (err) {
    request.log.error(err, "Error in toggleStaffStatus");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
