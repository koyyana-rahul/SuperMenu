import masterMenuItemModel from "../models/masterMenuItem.model.js";
import userModel from "../models/user.model.js";

// @desc    Create a master menu item
// @route   POST /api/master-menu
// @access  Private (Brand Admin)
export const createMasterItem = async (request, response) => {
  try {
    const { name, description, basePrice, isVeg } = request.body;
    const adminId = request.userId;

    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can create master menu items.",
        error: true,
        success: false,
      });
    }

    const itemData = {
      name,
      description,
      basePrice,
      isVeg,
      brandId: admin.brandId,
    };

    if (request.file) {
      itemData.image = request.file.path;
    }

    const masterItem = await masterMenuItemModel.create(itemData);

    return response.status(201).json({
      message: "Master menu item created successfully",
      error: false,
      success: true,
      data: masterItem,
    });
  } catch (err) {
    request.log.error(err, "Error in createMasterItem");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all master menu items for a brand
// @route   GET /api/master-menu
// @access  Private (Brand Admin)
export const getMasterItems = async (request, response) => {
  try {
    const adminId = request.userId;

    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN") {
      return response.status(403).json({
        message: "Only Brand Admin can view master menu items.",
        error: true,
        success: false,
      });
    }

    const masterItems = await masterMenuItemModel.find({
      brandId: admin.brandId,
    });

    return response.status(200).json({
      message: "Master menu items fetched successfully",
      error: false,
      success: true,
      data: masterItems,
    });
  } catch (err) {
    request.log.error(err, "Error in getMasterItems");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a master menu item
// @route   PUT /api/master-menu/:id
// @access  Private (Brand Admin)
export const updateMasterItem = async (request, response) => {
  try {
    const adminId = request.userId;
    const itemId = request.params.id;

    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    const item = await masterMenuItemModel.findById(itemId);
    if (!item || item.brandId.toString() !== admin.brandId.toString()) {
      return response
        .status(404)
        .json({ message: "Menu item not found or not part of your brand." });
    }

    const updateData = request.body;

    if (request.file) {
      updateData.image = request.file.path;
    }

    const updatedItem = await masterMenuItemModel.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      message: "Master menu item updated successfully",
      error: false,
      success: true,
      data: updatedItem,
    });
  } catch (err) {
    request.log.error(err, "Error in updateMasterItem");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
