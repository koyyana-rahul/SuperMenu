import menuCategoryModel from "../models/menuCategory.model.js";
import userModel from "../models/user.model.js";
import menuSubcategoryModel from "../models/menuSubCategory.model.js";
import branchMenuItemModel from "../models/branchMenuItem.model.js";

// @desc    Create a menu category
// @route   POST /api/menu-categories
// @access  Private (Manager)
export const createMenuCategory = async (request, response) => {
  try {
    const { name, description, sortOrder } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can create menu categories.",
        error: true,
        success: false,
      });
    }

    const categoryData = {
      name,
      description,
      sortOrder,
      restaurantId: manager.restaurantId,
    };

    if (request.file) {
      categoryData.image = request.file.path;
    }

    const category = await menuCategoryModel.create(categoryData);

    return response.status(201).json({
      message: "Menu category created successfully",
      error: false,
      success: true,
      data: category,
    });
  } catch (err) {
    request.log.error(err, "Error in createMenuCategory");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all menu categories for a restaurant
// @route   GET /api/menu-categories
// @access  Private (Manager)
export const getMenuCategories = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can view menu categories.",
        error: true,
        success: false,
      });
    }

    const categories = await menuCategoryModel
      .find({
        restaurantId: manager.restaurantId,
      })
      .sort({ sortOrder: 1, name: 1 });

    return response.status(200).json({
      message: "Menu categories fetched successfully",
      error: false,
      success: true,
      data: categories,
    });
  } catch (err) {
    request.log.error(err, "Error in getMenuCategories");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a menu category
// @route   PUT /api/menu-categories/:id
// @access  Private (Manager)
export const updateMenuCategory = async (request, response) => {
  try {
    const { id: categoryId } = request.params;
    const { name, description, sortOrder } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can update categories.",
        error: true,
        success: false,
      });
    }

    const category = await menuCategoryModel.findById(categoryId);
    if (
      !category ||
      category.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Category not found in your restaurant." });
    }

    const updateData = { name, description, sortOrder };
    if (request.file) {
      updateData.image = request.file.path;
    }

    const updatedCategory = await menuCategoryModel.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (err) {
    request.log.error(err, "Error in updateMenuCategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Archive a menu category (Soft Delete)
// @route   DELETE /api/menu-categories/:id
// @access  Private (Manager)
export const archiveMenuCategory = async (request, response) => {
  try {
    const { id: categoryId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can archive categories.",
        error: true,
        success: false,
      });
    }

    const category = await menuCategoryModel.findById(categoryId);
    if (
      !category ||
      category.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Category not found in your restaurant." });
    }

    // Production-ready check: Is this category linked to any active items or subcategories?
    const linkedItem = await branchMenuItemModel.findOne({
      categoryId: categoryId,
      isArchived: false,
    });
    const linkedSubcategory = await menuSubcategoryModel.findOne({
      categoryId: categoryId,
    }); // Assuming subcategories don't have isArchived yet

    if (linkedItem || linkedSubcategory) {
      return response
        .status(400)
        .json({
          message:
            "Cannot archive category as it is still in use by menu items or subcategories.",
        });
    }

    category.isArchived = true;
    await category.save();

    return response
      .status(200)
      .json({ message: "Category archived successfully." });
  } catch (err) {
    request.log.error(err, "Error in archiveMenuCategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
