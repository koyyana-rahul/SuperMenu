import mongoose from "mongoose";
import branchMenuItemModel from "../models/branchMenuItem.model.js";
import orderModel from "../models/order.model.js";
import tableModel from "../models/table.model.js";

// @desc    Get the full, nested menu for a specific restaurant
// @route   GET /api/public/menu/:restaurantId
// @access  Public
export const getFullMenu = async (request, response) => {
  try {
    const { restaurantId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return response.status(400).json({ message: "Invalid Restaurant ID" });
    }

    const fullMenu = await branchMenuItemModel.aggregate([
      // Step 1: Get all available menu items for the restaurant
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          isAvailable: true,
        },
      },
      // Step 2: Group items by their subcategory
      {
        $group: {
          _id: "$subcategoryId",
          items: { $push: "$$ROOT" },
        },
      },
      // Step 3: Lookup subcategory details
      {
        $lookup: {
          from: "menusubcategories",
          localField: "_id",
          foreignField: "_id",
          as: "subcategoryDetails",
        },
      },
      { $unwind: "$subcategoryDetails" },
      // Step 4: Group subcategories by their parent category
      {
        $group: {
          _id: "$subcategoryDetails.categoryId",
          subcategories: {
            $push: {
              _id: "$subcategoryDetails._id",
              name: "$subcategoryDetails.name",
              sortOrder: "$subcategoryDetails.sortOrder",
              items: "$items",
            },
          },
        },
      },
      // Step 5: Lookup category details
      {
        $lookup: {
          from: "menucategories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      // Step 6: Shape the final output
      {
        $project: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          sortOrder: "$categoryDetails.sortOrder",
          subcategories: "$subcategories",
        },
      },
      // Step 7: Sort final categories
      { $sort: { sortOrder: 1, name: 1 } },
    ]);

    return response.status(200).json({ data: fullMenu });
  } catch (err) {
    request.log.error(err, "Error in getFullMenu");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get the current order status for a table
// @route   POST /api/public/order-status
// @access  Public (secured by table PIN)
export const getOrderStatus = async (request, response) => {
  try {
    const { tableId, pin } = request.body;

    if (!tableId || !pin) {
      return response
        .status(400)
        .json({ message: "Table ID and PIN are required." });
    }

    // Edge Case: Handle invalid Table ID format
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return response.status(400).json({ message: "Invalid Table ID format." });
    }

    // 1. Find the table and validate the PIN
    const table = await tableModel
      .findById(tableId)
      .select("+currentPin +currentPinExpires");

    if (!table) {
      return response.status(404).json({ message: "Table not found." });
    }

    if (table.status !== "IN_USE" || table.currentPin !== pin) {
      return response
        .status(403)
        .json({ message: "Invalid PIN for this table." });
    }

    if (new Date() > table.currentPinExpires) {
      return response.status(403).json({
        message: "Table PIN has expired. Please ask the waiter for a new one.",
      });
    }

    // 2. Find the currently open order for this table
    const order = await orderModel.findOne({
      tableId: table._id,
      orderStatus: { $in: ["OPEN", "PENDING_APPROVAL"] },
    });

    if (!order) {
      return response
        .status(200)
        .json({ data: null, message: "No open order for this table." });
    }

    return response.status(200).json({ data: order });
  } catch (err) {
    request.log.error(err, "Error in getOrderStatus");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
