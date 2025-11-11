import menuSubcategoryModel from "../models/menuSubCategory.model.js";
import menuCategoryModel from "../models/menuCategory.model.js";
import userModel from "../models/user.model.js";
import branchMenuItemModel from "../models/branchMenuItem.model.js";

// @desc    Create a menu subcategory
// @route   POST /api/menu-subcategories
// @access  Private (Manager)
export const createMenuSubcategory = async (request, response) => {
  try {
    const { name, description, sortOrder, categoryId } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can create subcategories.",
        error: true,
        success: false,
      });
    }

    // Validate that the parent category belongs to the manager's restaurant
    const parentCategory = await menuCategoryModel.findById(categoryId);
    if (
      !parentCategory ||
      parentCategory.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response.status(404).json({
        message: "Parent category not found or not part of your restaurant.",
        error: true,
        success: false,
      });
    }

    const subcategory = await menuSubcategoryModel.create({
      name,
      description,
      sortOrder,
      categoryId,
      restaurantId: manager.restaurantId,
    });

    return response.status(201).json({
      message: "Menu subcategory created successfully",
      error: false,
      success: true,
      data: subcategory,
    });
  } catch (err) {
    request.log.error(err, "Error in createMenuSubcategory");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all menu subcategories for a restaurant
// @route   GET /api/menu-subcategories
// @access  Private (Manager)
export const getMenuSubcategories = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can view subcategories.",
        error: true,
        success: false,
      });
    }

    // Allow filtering by parent category ID
    const filter = { restaurantId: manager.restaurantId };
    if (request.query.categoryId) {
      filter.categoryId = request.query.categoryId;
    }

    const subcategories = await menuSubcategoryModel
      .find(filter)
      .sort({ sortOrder: 1, name: 1 });

    return response.status(200).json({
      message: "Menu subcategories fetched successfully",
      error: false,
      success: true,
      data: subcategories,
    });
  } catch (err) {
    request.log.error(err, "Error in getMenuSubcategories");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a menu subcategory
// @route   PUT /api/menu-subcategories/:id
// @access  Private (Manager)
export const updateMenuSubcategory = async (request, response) => {
  try {
    const { id: subcategoryId } = request.params;
    const { name, description, sortOrder } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can update subcategories.",
        error: true,
        success: false,
      });
    }

    const subcategory = await menuSubcategoryModel.findById(subcategoryId);
    if (
      !subcategory ||
      subcategory.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Subcategory not found in your restaurant." });
    }

    const updatedSubcategory = await menuSubcategoryModel.findByIdAndUpdate(
      subcategoryId,
      { name, description, sortOrder },
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      message: "Subcategory updated successfully.",
      data: updatedSubcategory,
    });
  } catch (err) {
    request.log.error(err, "Error in updateMenuSubcategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Archive a menu subcategory (Soft Delete)
// @route   DELETE /api/menu-subcategories/:id
// @access  Private (Manager)
export const archiveMenuSubcategory = async (request, response) => {
  try {
    const { id: subcategoryId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can archive subcategories.",
        error: true,
        success: false,
      });
    }

    const subcategory = await menuSubcategoryModel.findById(subcategoryId);
    if (
      !subcategory ||
      subcategory.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Subcategory not found in your restaurant." });
    }

    // Production-ready check: Is this subcategory linked to any active items?
    const linkedItem = await branchMenuItemModel.findOne({
      subcategoryId: subcategoryId,
      isArchived: false,
    });
    if (linkedItem) {
      return response
        .status(400)
        .json({
          message:
            "Cannot archive subcategory as it is still in use by menu items.",
        });
    }

    subcategory.isArchived = true;
    await subcategory.save();

    return response
      .status(200)
      .json({ message: "Subcategory archived successfully." });
  } catch (err) {
    request.log.error(err, "Error in archiveMenuSubcategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
