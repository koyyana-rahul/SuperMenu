import restaurantModel from "../models/restaurant.model.js";
import userModel from "../models/user.model.js";

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (Brand Admin)
export const createRestaurant = async (request, response) => {
  try {
    const { name, address, phone } = request.body;
    const adminId = request.userId;

    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can create restaurants.",
        error: true,
        success: false,
      });
    }

    const restaurant = await restaurantModel.create({
      name,
      address,
      phone,
      brandId: admin.brandId,
    });

    return response.status(201).json({
      message: "Restaurant created successfully",
      error: false,
      success: true,
      data: restaurant,
    });
  } catch (err) {
    request.log.error(err, "Error in createRestaurant");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all restaurants for a brand
// @route   GET /api/restaurants
// @access  Private (Brand Admin)
export const getRestaurantsByBrand = async (request, response) => {
  try {
    const adminId = request.userId;

    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can view all restaurants.",
        error: true,
        success: false,
      });
    }

    const restaurants = await restaurantModel.find({ brandId: admin.brandId });

    return response.status(200).json({
      message: "Restaurants fetched successfully",
      error: false,
      success: true,
      data: restaurants,
    });
  } catch (err) {
    request.log.error(err, "Error in getRestaurantsByBrand");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get a single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Private (Brand Admin or assigned Manager)
export const getRestaurantById = async (request, response) => {
  try {
    const restaurant = await restaurantModel.findById(request.params.id);

    if (!restaurant) {
      return response.status(404).json({ message: "Restaurant not found" });
    }

    // Logic to ensure only the correct admin/manager can see it
    const user = await userModel.findById(request.userId);
    if (
      (user.role === "BRAND_ADMIN" &&
        user.brandId.toString() !== restaurant.brandId.toString()) ||
      (user.role === "MANAGER" &&
        user.restaurantId.toString() !== restaurant._id.toString())
    ) {
      return response
        .status(403)
        .json({ message: "Not authorized to view this restaurant" });
    }

    return response.status(200).json({
      message: "Restaurant fetched successfully",
      error: false,
      success: true,
      data: restaurant,
    });
  } catch (err) {
    request.log.error(err, "Error in getRestaurantById");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Brand Admin)
export const updateRestaurant = async (request, response) => {
  try {
    const restaurant = await restaurantModel.findById(request.params.id);

    if (!restaurant) {
      return response.status(404).json({ message: "Restaurant not found" });
    }

    const admin = await userModel.findById(request.userId);
    if (
      !admin ||
      admin.role !== "BRAND_ADMIN" ||
      admin.brandId.toString() !== restaurant.brandId.toString()
    ) {
      return response
        .status(403)
        .json({ message: "Not authorized to update this restaurant" });
    }

    const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      message: "Restaurant updated successfully",
      error: false,
      success: true,
      data: updatedRestaurant,
    });
  } catch (err) {
    request.log.error(err, "Error in updateRestaurant");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Archive a restaurant (Soft Delete)
// @route   DELETE /api/restaurants/:id
// @access  Private (Brand Admin)
export const archiveRestaurant = async (request, response) => {
  try {
    const restaurant = await restaurantModel.findById(request.params.id);

    if (!restaurant) {
      return response.status(404).json({ message: "Restaurant not found" });
    }

    // Note: You would also deactivate associated managers and staff here.
    // await userModel.updateMany({ restaurantId: restaurant._id }, { isActive: false });

    const admin = await userModel.findById(request.userId);
    if (
      !admin ||
      admin.role !== "BRAND_ADMIN" ||
      admin.brandId.toString() !== restaurant.brandId.toString()
    ) {
      return response
        .status(403)
        .json({ message: "Not authorized to archive this restaurant" });
    }

    restaurant.isArchived = true;
    await restaurant.save();

    return response.status(200).json({
      message: "Restaurant deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    request.log.error(err, "Error in archiveRestaurant");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a restaurant's settings
// @route   PATCH /api/restaurants/settings
// @access  Private (Manager)
export const updateRestaurantSettings = async (request, response) => {
  try {
    const managerId = request.userId;
    const { maxItemQuantity, maxOrderValue, allowInAppPayment, razorpayKeyId } =
      request.body;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can update restaurant settings.",
        error: true,
        success: false,
      });
    }

    const restaurant = await restaurantModel.findById(manager.restaurantId);
    if (!restaurant) {
      return response.status(404).json({ message: "Restaurant not found." });
    }

    // Update settings selectively
    if (maxItemQuantity) restaurant.settings.maxItemQuantity = maxItemQuantity;
    if (maxOrderValue) restaurant.settings.maxOrderValue = maxOrderValue;
    if (typeof allowInAppPayment === "boolean")
      restaurant.settings.allowInAppPayment = allowInAppPayment;
    if (razorpayKeyId) restaurant.settings.razorpayKeyId = razorpayKeyId;

    await restaurant.save();

    return response.status(200).json({
      message: "Restaurant settings updated successfully.",
      data: restaurant.settings,
    });
  } catch (err) {
    request.log.error(err, "Error in updateRestaurantSettings");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
