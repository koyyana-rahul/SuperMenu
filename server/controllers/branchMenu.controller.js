import branchMenuItemModel from "../models/branchMenuItem.model.js";
import masterMenuItemModel from "../models/masterMenuItem.model.js";
import kitchenStationModel from "../models/kitchen.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";

// @desc    Get the list of master menu items available for a manager's brand
// @route   GET /api/branch-menu/master-list
// @access  Private (Manager)
export const getMasterMenuForManager = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER") {
      return response.status(403).json({ message: "Not authorized." });
    }

    // Find all master items for the manager's brand that are not archived
    const masterItems = await masterMenuItemModel.find({
      brandId: manager.brandId,
      isArchived: false,
    });

    return response.status(200).json({
      message: "Master menu list fetched successfully",
      error: false,
      success: true,
      data: masterItems,
    });
  } catch (err) {
    request.log.error(err, "Error in getMasterMenuForManager");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all menu items for a branch
// @route   GET /api/branch-menu
// @access  Private (Manager)
export const getBranchMenuItems = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view menu items." });
    }

    const items = await branchMenuItemModel.find({
      restaurantId: manager.restaurantId,
      isArchived: false, // Only show active items
    });

    return response.status(200).json({ data: items });
  } catch (err) {
    request.log.error(err, "Error in getBranchMenuItems");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update a branch menu item (price, availability, etc.)
// @route   PUT /api/branch-menu/:itemId
// @access  Private (Manager)
export const updateBranchMenuItem = async (request, response) => {
  try {
    const { itemId } = request.params;
    const updateData = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can update menu items." });
    }

    const branchItem = await branchMenuItemModel.findById(itemId);
    if (
      !branchItem ||
      branchItem.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Menu item not found in your restaurant." });
    }

    const updatedItem = await branchMenuItemModel.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      message: "Menu item updated successfully.",
      data: updatedItem,
    });
  } catch (err) {
    request.log.error(err, "Error in updateBranchMenuItem");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Archive a branch menu item (Soft Delete)
// @route   DELETE /api/branch-menu/:itemId
// @access  Private (Manager)
export const archiveBranchMenuItem = async (request, response) => {
  try {
    const { itemId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can archive menu items." });
    }

    const branchItem = await branchMenuItemModel.findById(itemId);
    if (
      !branchItem ||
      branchItem.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Menu item not found in your restaurant." });
    }

    // Production-ready check: Is this item part of any currently open orders?
    const openOrderWithItem = await orderModel.findOne({
      restaurantId: manager.restaurantId,
      orderStatus: "OPEN",
      "items.branchMenuItemId": itemId,
    });

    if (openOrderWithItem) {
      return response
        .status(400)
        .json({
          message: "Cannot archive item as it is part of an active order.",
        });
    }

    branchItem.isArchived = true;
    await branchItem.save();

    return response
      .status(200)
      .json({ message: "Menu item archived successfully." });
  } catch (err) {
    request.log.error(err, "Error in archiveBranchMenuItem");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Add a master item to a branch's menu
// @route   POST /api/branch-menu
// @access  Private (Manager)
export const addBranchMenuItem = async (request, response) => {
  try {
    const { masterItemId, price, kitchenStationId, categoryId, subcategoryId } =
      request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can add menu items." });
    }

    // 1. Validate the master item
    const masterItem = await masterMenuItemModel.findById(masterItemId);
    if (
      !masterItem ||
      masterItem.brandId.toString() !== manager.brandId.toString()
    ) {
      return response.status(404).json({
        message: "Master menu item not found or not part of your brand.",
      });
    }

    // 2. Validate the kitchen station
    const kitchenStation = await kitchenStationModel.findById(kitchenStationId);
    if (
      !kitchenStation ||
      kitchenStation.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response.status(404).json({
        message: "Kitchen station not found or not part of your restaurant.",
      });
    }

    // 3. Check if this item already exists in the branch menu
    const existingBranchItem = await branchMenuItemModel.findOne({
      restaurantId: manager.restaurantId,
      masterItemId: masterItemId,
    });

    if (existingBranchItem) {
      return response
        .status(400)
        .json({ message: "This item has already been added to your menu." });
    }

    // 4. Create the new branch menu item
    const branchItem = await branchMenuItemModel.create({
      restaurantId: manager.restaurantId,
      masterItemId,
      categoryId, // Assuming these will be created in a future step
      subcategoryId, // Assuming these will be created in a future step
      kitchenStationId,
      price,
      // Copy details from the master item
      name: masterItem.name,
      description: masterItem.description,
      isVeg: masterItem.isVeg,
    });

    return response.status(201).json({
      message: "Item added to branch menu successfully",
      error: false,
      success: true,
      data: branchItem,
    });
  } catch (err) {
    request.log.error(err, "Error in addBranchMenuItem");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update modifiers for a branch menu item
// @route   PUT /api/branch-menu/:itemId/modifiers
// @access  Private (Manager)
export const updateBranchMenuItemModifiers = async (request, response) => {
  try {
    const { itemId } = request.params;
    const { modifiers } = request.body; // Expect an array of modifier groups
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can update menu items." });
    }

    const branchItem = await branchMenuItemModel.findById(itemId);

    if (
      !branchItem ||
      branchItem.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Menu item not found in your restaurant." });
    }

    branchItem.modifiers = modifiers;
    await branchItem.save();

    return response.status(200).json({
      message: "Modifiers updated successfully.",
      data: branchItem,
    });
  } catch (err) {
    request.log.error(err, "Error in updateBranchMenuItemModifiers");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get a single branch menu item by ID
// @route   GET /api/branch-menu/:itemId
// @access  Private (Manager)
export const getBranchMenuItemById = async (request, response) => {
  try {
    const { itemId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view menu items." });
    }

    const item = await branchMenuItemModel.findById(itemId);

    if (
      !item ||
      item.isArchived ||
      item.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Menu item not found in your restaurant." });
    }

    return response.status(200).json({ data: item });
  } catch (err) {
    request.log.error(err, "Error in getBranchMenuItemById");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
