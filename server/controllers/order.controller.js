import orderModel from "../models/order.model.js";
import tableModel from "../models/table.model.js";
import branchMenuItemModel from "../models/branchMenuItem.model.js";
import mongoose from "mongoose";
import restaurantModel from "../models/restaurant.model.js";
import userModel from "../models/user.model.js";

// @desc    Place a new order for a table
// @route   POST /api/orders
// @access  Public (secured by table PIN)
export const placeOrder = async (request, response) => {
  try {
    const { tableId, pin, items } = request.body;

    if (
      !tableId ||
      !pin ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return response.status(400).json({
        message: "Table ID, PIN, and at least one item are required.",
      });
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

    // 2. Find or create an open order for this table
    let order = await orderModel.findOne({
      tableId: table._id,
      orderStatus: "OPEN",
    });

    if (!order) {
      order = new orderModel({
        restaurantId: table.restaurantId,
        tableId: table._id,
        tableName: table.name,
        items: [],
        orderStatus: "OPEN",
      });
    }

    // 3. Process and validate each item in the order
    const orderItems = [];
    let isSuspicious = false;
    let currentOrderValue = order.totalAmount;

    for (const item of items) {
      // Edge Case: Handle invalid item IDs sent by the client
      if (!mongoose.Types.ObjectId.isValid(item.branchMenuItemId)) {
        return response.status(400).json({ message: `Invalid menu item ID provided.` });
      }

      const branchMenuItem = await branchMenuItemModel.findById(
        item.branchMenuItemId
      );

      // Ensure the menu item exists, is part of the correct restaurant, and is available
      if (
        !branchMenuItem ||
        branchMenuItem.restaurantId.toString() !==
          table.restaurantId.toString() ||
        !branchMenuItem.isAvailable
      ) {
        return response.status(400).json({
          message: `Menu item "${
            item.name || "unknown"
          }" is not valid or available.`,
        });
      }

      // FIREWALL CHECK 1: Check individual item quantity
      if (item.quantity > restaurant.settings.maxItemQuantity) {
        isSuspicious = true;
      }

      const itemValue = branchMenuItem.price * item.quantity;
      currentOrderValue += itemValue;

      // --- MODIFIER VALIDATION LOGIC ---
      const validatedModifiers = [];
      if (item.selectedModifiers && Array.isArray(item.selectedModifiers)) {
        for (const selectedMod of item.selectedModifiers) {
          // Find the modifier group on the menu item
          const group = branchMenuItem.modifiers.find(m => m.title === selectedMod.title);
          if (!group) continue; // Ignore if group doesn't exist

          // Find the specific option within that group
          const option = group.options.find(o => o.name === selectedMod.optionName);
          if (!option) continue; // Ignore if option doesn't exist

          // Add the validated modifier to the list
          validatedModifiers.push({
            title: group.title,
            optionName: option.name,
            price: option.price, // Use price from DB, not client
          });
        }
      }
      // --- END MODIFIER VALIDATION ---

      orderItems.push({
        branchMenuItemId: branchMenuItem._id,
        name: branchMenuItem.name,
        price: branchMenuItem.price, // Use the price from the database, not the client
        quantity: item.quantity,
        selectedModifiers: validatedModifiers,
        itemStatus: "PENDING", // Default status for a new item
      });
    }

    // FIREWALL CHECK 2: Check total order value
    if (currentOrderValue > restaurant.settings.maxOrderValue) {
      isSuspicious = true;
    }

    // 4. Add the new items to the order and save
    order.items.push(...orderItems);

    // If flagged, set status to PENDING_APPROVAL, otherwise proceed as normal
    if (isSuspicious) {
      order.orderStatus = "PENDING_APPROVAL";
      // Emit a WebSocket event to alert the manager's dashboard
      request.io.emit(`suspicious_order::${table.restaurantId}`, {
        orderId: order._id,
      });
    }

    await order.save();
    
    // If not suspicious, emit a WebSocket event to alert the kitchen
    if (!isSuspicious) {
      request.io.emit(`new_order_items::${table.restaurantId}`, { orderId: order._id, items: orderItems, tableName: table.name });
    }

    return response.status(201).json({
      message: "Order placed successfully.",
      error: false,
      success: true,
      data: {
        orderId: order._id,
        totalItems: order.items.length,
        status: order.orderStatus, // Let the client know if it's pending approval
      },
    });
  } catch (err) {
    request.log.error(err, "Error in placeOrder");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all pending order items for a chef's assigned station
// @route   GET /api/orders/kitchen/pending
// @access  Private (Chef)
export const getPendingItemsForStation = async (request, response) => {
  try {
    const chefId = request.userId;

    // 1. Verify the user is a Chef and is assigned to a station
    const chef = await userModel.findById(chefId);
    if (!chef || chef.role !== "CHEF" || !chef.kitchenStationId) {
      return response.status(403).json({
        message: "Only a Chef assigned to a kitchen station can view items.",
        error: true,
        success: false,
      });
    }

    // 2. Use an aggregation pipeline to find all pending items for this station
    const pendingItems = await orderModel.aggregate([
      // Find open orders in the chef's restaurant
      {
        $match: {
          restaurantId: chef.restaurantId,
          orderStatus: "OPEN",
        },
      },
      // Deconstruct the items array
      { $unwind: "$items" },
      // Filter for items that are PENDING
      { $match: { "items.itemStatus": "PENDING" } },
      // Lookup the branch menu item to get its kitchen station
      {
        $lookup: {
          from: "branchmenuitems",
          localField: "items.branchMenuItemId",
          foreignField: "_id",
          as: "menuItemDetails",
        },
      },
      { $unwind: "$menuItemDetails" },
      // Filter for items that belong to the chef's station
      {
        $match: {
          "menuItemDetails.kitchenStationId": chef.kitchenStationId,
        },
      },
      // Group the items back into a clean list
      {
        $project: {
          _id: "$items._id",
          orderId: "$_id",
          tableName: "$tableName",
          itemName: "$items.name",
          quantity: "$items.quantity",
          createdAt: "$items.createdAt",
        },
      },
      { $sort: { createdAt: 1 } }, // Oldest items first
    ]);

    return response.status(200).json({ data: pendingItems });
  } catch (err) {
    request.log.error(err, "Error in getPendingItemsForStation");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all orders pending approval
// @route   GET /api/orders/suspicious
// @access  Private (Manager)
export const getSuspiciousOrders = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view these orders." });
    }

    const orders = await orderModel.find({
      restaurantId: manager.restaurantId,
      orderStatus: "PENDING_APPROVAL",
    });

    return response.status(200).json({ data: orders });
  } catch (err) {
    request.log.error(err, "Error in getSuspiciousOrders");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Manager approves a suspicious order
// @route   PATCH /api/orders/:orderId/approve
// @access  Private (Manager)
export const approveSuspiciousOrder = async (request, response) => {
  try {
    const { orderId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can approve orders." });
    }

    const order = await orderModel.findById(orderId);
    if (
      !order ||
      order.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response.status(404).json({ message: "Order not found." });
    }

    if (order.orderStatus !== "PENDING_APPROVAL") {
      return response
        .status(400)
        .json({ message: "This order is not pending approval." });
    }

    // Change status back to OPEN so it can proceed
    order.orderStatus = "OPEN";
    await order.save();

    // Emit WebSocket event to alert the kitchen about the newly approved items
    request.io.emit(`new_order_items::${order.restaurantId}`, {
      orderId: order._id,
      items: order.items.filter((item) => item.itemStatus === "PENDING"), // Only send pending items
      tableName: order.tableName,
    });

    return response
      .status(200)
      .json({ message: "Order approved and sent to kitchen." });
  } catch (err) {
    request.log.error(err, "Error in approveSuspiciousOrder");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Manager rejects a suspicious order
// @route   PATCH /api/orders/:orderId/reject
// @access  Private (Manager)
export const rejectSuspiciousOrder = async (request, response) => {
  try {
    const { orderId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can reject orders." });
    }

    const order = await orderModel.findById(orderId);
    if (
      !order ||
      order.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response.status(404).json({ message: "Order not found." });
    }

    if (order.orderStatus !== "PENDING_APPROVAL") {
      return response
        .status(400)
        .json({ message: "This order is not pending approval." });
    }

    // Change status to CANCELLED
    // Note: A more complex implementation might revert only the suspicious items
    // and set the order status back to OPEN if there were previous valid items.
    // For simplicity here, we cancel the entire order.
    order.orderStatus = "CANCELLED";
    await order.save();

    // Emit WebSocket event to alert the customer/waiter that the order was rejected
    request.io.emit(`order_update::${order.tableId}`, {
      status: "CANCELLED",
    });

    return response.status(200).json({ message: "Order has been rejected." });
  } catch (err) {
    request.log.error(err, "Error in rejectSuspiciousOrder");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Chef claims a pending order item
// @route   PATCH /api/orders/items/:itemId/claim
// @access  Private (Chef)
export const claimOrderItem = async (request, response) => {
  try {
    const { itemId } = request.params;
    const chefId = request.userId;

    // 1. Verify the user is a Chef
    const chef = await userModel.findById(chefId);
    if (!chef || chef.role !== "CHEF") {
      return response
        .status(403)
        .json({ message: "Only a Chef can claim an item." });
    }

    // 2. Find the order containing the item and ensure it's in the chef's restaurant
    const order = await orderModel.findOne({
      "items._id": itemId,
      restaurantId: chef.restaurantId,
    });

    if (!order) {
      return response
        .status(404)
        .json({ message: "Order item not found in your restaurant." });
    }

    // 3. Find the specific item and check its status
    const item = order.items.id(itemId);
    if (item.itemStatus !== "PENDING") {
      return response
        .status(400)
        .json({ message: `Item is already ${item.itemStatus}.` });
    }

    // 4. Update the item's status and assign the chef
    item.itemStatus = "PREPARING";
    item.chefId = chefId;
    await order.save();

    // Emit a WebSocket event to update any listening clients
    request.io.emit(`item_status_update::${order.restaurantId}`, {
      orderId: order._id,
      itemId: item._id,
      status: "PREPARING",
    });

    return response.status(200).json({
      message: "Item claimed successfully.",
      data: item,
    });
  } catch (err) {
    request.log.error(err, "Error in claimOrderItem");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Chef marks an item as ready
// @route   PATCH /api/orders/items/:itemId/ready
// @access  Private (Chef)
export const markItemAsReady = async (request, response) => {
  try {
    const { itemId } = request.params;
    const chefId = request.userId;

    // 1. Verify the user is a Chef
    const chef = await userModel.findById(chefId);
    if (!chef || chef.role !== "CHEF") {
      return response
        .status(403)
        .json({ message: "Only a Chef can mark an item as ready." });
    }

    // 2. Find the order containing the item
    const order = await orderModel.findOne({
      "items._id": itemId,
      restaurantId: chef.restaurantId,
    });

    if (!order) {
      return response
        .status(404)
        .json({ message: "Order item not found in your restaurant." });
    }

    // 3. Find the specific item and check its status
    const item = order.items.id(itemId);
    if (item.itemStatus !== "PREPARING") {
      return response
        .status(400)
        .json({ message: `Item must be in PREPARING status.` });
    }

    // 4. Optional but good for accountability: check if the same chef is marking it ready
    if (item.chefId.toString() !== chefId) {
      return response
        .status(403)
        .json({ message: `This item was claimed by another chef.` });
    }

    // 5. Update the item's status
    item.itemStatus = "READY";
    await order.save();

    // Emit a WebSocket event to alert waiters that an item is ready for pickup
    request.io.emit(`item_ready::${order.restaurantId}`, {
      orderId: order._id,
      itemId: item._id,
      tableName: order.tableName,
    });

    return response.status(200).json({ message: "Item marked as READY." });
  } catch (err) {
    request.log.error(err, "Error in markItemAsReady");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all items marked as READY for pickup
// @route   GET /api/orders/waiter/ready
// @access  Private (Waiter)
export const getReadyItems = async (request, response) => {
  try {
    const waiterId = request.userId;

    // 1. Verify the user is a Waiter
    const waiter = await userModel.findById(waiterId);
    if (!waiter || waiter.role !== "WAITER" || !waiter.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Waiter can view ready items." });
    }

    // 2. Use an aggregation pipeline to find all READY items in the restaurant
    const readyItems = await orderModel.aggregate([
      // Find open orders in the waiter's restaurant
      {
        $match: {
          restaurantId: waiter.restaurantId,
          orderStatus: "OPEN",
        },
      },
      // Deconstruct the items array
      { $unwind: "$items" },
      // Filter for items that are READY
      { $match: { "items.itemStatus": "READY" } },
      // Shape the output for the waiter's app
      {
        $project: {
          _id: "$items._id",
          orderId: "$_id",
          tableName: "$tableName",
          itemName: "$items.name",
          quantity: "$items.quantity",
          readyAt: "$items.updatedAt", // The time it was marked as ready
        },
      },
      // Sort by oldest first to prioritize items that have been waiting longer
      { $sort: { readyAt: 1 } },
    ]);

    return response.status(200).json({ data: readyItems });
  } catch (err) {
    request.log.error(err, "Error in getReadyItems");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Waiter marks an item as served
// @route   PATCH /api/orders/items/:itemId/served
// @access  Private (Waiter)
export const markItemAsServed = async (request, response) => {
  try {
    const { itemId } = request.params;
    const waiterId = request.userId;

    // 1. Verify the user is a Waiter
    const waiter = await userModel.findById(waiterId);
    if (!waiter || waiter.role !== "WAITER" || !waiter.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Waiter can serve an item." });
    }

    // 2. Find the order containing the item
    const order = await orderModel.findOne({
      "items._id": itemId,
      restaurantId: waiter.restaurantId,
    });

    if (!order) {
      return response
        .status(404)
        .json({ message: "Order item not found in your restaurant." });
    }

    // 3. Find the specific item and check its status
    const item = order.items.id(itemId);
    if (item.itemStatus !== "READY") {
      return response
        .status(400)
        .json({ message: `Item must be in READY status to be served.` });
    }

    // 4. Update the item's status and assign the waiter who served it
    item.itemStatus = "SERVED";
    item.waiterId = waiterId;
    await order.save();

    // Emit a WebSocket event to update the customer's live order view
    request.io.emit(`item_status_update::${order.restaurantId}`, {
      orderId: order._id,
      itemId: item._id,
      status: "SERVED",
    });

    return response.status(200).json({ message: "Item marked as SERVED." });
  } catch (err) {
    request.log.error(err, "Error in markItemAsServed");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Waiter closes an order and marks it as paid
// @route   POST /api/orders/:orderId/close
// @access  Private (Waiter)
export const closeOrder = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { paymentMethod } = request.body;
    const waiterId = request.userId;

    // 1. Verify the user is a Waiter
    const waiter = await userModel.findById(waiterId);
    if (!waiter || waiter.role !== "WAITER" || !waiter.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Waiter can close an order." });
    }

    // 2. Find the order and validate it
    const order = await orderModel.findById(orderId);
    if (
      !order ||
      order.restaurantId.toString() !== waiter.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Order not found in your restaurant." });
    }

    if (order.orderStatus !== "OPEN") {
      return response
        .status(400)
        .json({ message: `Order is already ${order.orderStatus}.` });
    }

    // 3. Edge Case: Ensure all items are served or cancelled before closing
    const areAllItemsFinished = order.items.every(
      (item) => item.itemStatus === "SERVED" || item.itemStatus === "CANCELLED"
    );
    if (!areAllItemsFinished) {
      return response.status(400).json({
        message:
          "Cannot close order, some items are still pending or being prepared.",
      });
    }

    // 4. Update the order
    order.orderStatus = "PAID";
    order.paymentMethod = paymentMethod;
    order.closedByWaiterId = waiterId;
    await order.save();

    // 5. Find the table and explicitly expire the PIN and reset status
    const table = await tableModel.findById(order.tableId);
    if (table) {
      table.status = "AVAILABLE";
      table.currentWaiterId = null;
      table.currentPin = null;
      table.currentPinExpires = null;
      await table.save();
    }

    // Emit a WebSocket event to update dashboards
    request.io.emit(`order_closed::${order.restaurantId}`, {
      orderId: order._id,
    });

    return response.status(200).json({
      message: "Order closed successfully.",
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (err) {
    request.log.error(err, "Error in closeOrder");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Manager cancels an order item
// @route   PATCH /api/orders/items/:itemId/cancel
// @access  Private (Manager)
export const cancelOrderItem = async (request, response) => {
  try {
    const { itemId } = request.params;
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can cancel an item." });
    }

    // 2. Find the order containing the item
    const order = await orderModel.findOne({
      "items._id": itemId,
      restaurantId: manager.restaurantId,
    });

    if (!order) {
      return response
        .status(404)
        .json({ message: "Order item not found in your restaurant." });
    }

    // 3. Find the specific item and check its status
    const item = order.items.id(itemId);
    if (item.itemStatus !== "PENDING") {
      return response.status(400).json({
        message: `Cannot cancel item, it is already ${item.itemStatus}.`,
      });
    }

    // 4. Update the item's status to CANCELLED
    item.itemStatus = "CANCELLED";
    await order.save(); // The pre-save hook on the order model will recalculate the total amount.

    // Emit a WebSocket event to remove the item from the kitchen display
    request.io.emit(`item_status_update::${order.restaurantId}`, {
      orderId: order._id,
      itemId: item._id,
      status: "CANCELLED",
    });

    return response
      .status(200)
      .json({ message: "Item cancelled successfully." });
  } catch (err) {
    request.log.error(err, "Error in cancelOrderItem");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all open orders for a manager's restaurant
// @route   GET /api/orders/open
// @access  Private (Manager)
export const getOpenOrders = async (request, response) => {
  try {
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view open orders." });
    }

    // 2. Find all orders that are not yet closed
    const openOrders = await orderModel
      .find({
        restaurantId: manager.restaurantId,
        orderStatus: { $in: ["OPEN", "PENDING_APPROVAL"] },
      })
      .sort({ createdAt: -1 }); // Show newest orders first

    return response.status(200).json({
      message: "Open orders fetched successfully.",
      error: false,
      success: true,
      data: openOrders,
    });
  } catch (err) {
    request.log.error(err, "Error in getOpenOrders");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
