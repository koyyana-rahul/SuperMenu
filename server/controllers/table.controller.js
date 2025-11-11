import tableModel from "../models/table.model.js";
import userModel from "../models/user.model.js";
import crypto from "crypto";
import qrcode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import config from "../config/config.js";

// @desc    Create a table
// @route   POST /api/tables
// @access  Private (Manager)
export const createTable = async (request, response) => {
  try {
    const { name } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can create tables.",
        error: true,
        success: false,
      });
    }

    const table = await tableModel.create({
      name,
      restaurantId: manager.restaurantId,
    });

    return response.status(201).json({
      message: "Table created successfully",
      error: false,
      success: true,
      data: table,
    });
  } catch (err) {
    if (err.code === 11000) {
      return response.status(400).json({
        message: "A table with this name already exists in your restaurant.",
      });
    }
    request.log.error(err, "Error in createTable");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Generate and attach a QR code for a table
// @route   POST /api/tables/:id/generate-qr
// @access  Private (Manager)
export const generateTableQR = async (request, response) => {
  try {
    const { id: tableId } = request.params;
    const managerId = request.userId;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can generate QR codes.",
        error: true,
        success: false,
      });
    }

    // 2. Find the table and ensure it belongs to the manager's restaurant
    const table = await tableModel.findById(tableId);
    if (
      !table ||
      table.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Table not found in your restaurant." });
    }

    // 3. Construct the URL to be encoded in the QR code
    const urlToEncode = `${config.frontendUrl}/order/${table.restaurantId}/${table._id}`;

    // 4. Generate the QR code as a Data URL
    const qrCodeDataUrl = await qrcode.toDataURL(urlToEncode);

    // 5. Upload the QR code image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
      folder: "supermenu_qrcodes",
      public_id: `table_${table._id}`,
      overwrite: true,
    });

    // 6. Save the secure URL to the table document
    table.qrCodeUrl = uploadResponse.secure_url;
    await table.save();

    // 7. Return the URL to the manager
    return response.status(200).json({
      message: "QR Code generated and attached successfully.",
      error: false,
      success: true,
      data: {
        tableId: table._id,
        qrCodeUrl: table.qrCodeUrl,
      },
    });
  } catch (err) {
    request.log.error(err, "Error in generateTableQR");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all tables for a restaurant
// @route   GET /api/tables
// @access  Private (Manager or Waiter)
export const getTables = async (request, response) => {
  try {
    const userId = request.userId;

    const user = await userModel.findById(userId);
    if (
      !user ||
      !["MANAGER", "WAITER"].includes(user.role) ||
      !user.restaurantId
    ) {
      return response.status(403).json({
        message: "Only assigned Managers or Waiters can view tables.",
        error: true,
        success: false,
      });
    }

    const tables = await tableModel
      .find({
        restaurantId: user.restaurantId,
      })
      .sort({ name: 1 });

    return response.status(200).json({
      message: "Tables fetched successfully",
      error: false,
      success: true,
      data: tables,
    });
  } catch (err) {
    request.log.error(err, "Error in getTables");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Open a table and generate a PIN
// @route   POST /api/tables/:id/open
// @access  Private (Waiter)
export const openTable = async (request, response) => {
  try {
    const { id: tableId } = request.params;
    const waiterId = request.userId;

    // 1. Verify the user is a Waiter
    const waiter = await userModel.findById(waiterId);
    if (!waiter || waiter.role !== "WAITER" || !waiter.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Waiter can open a table.",
        error: true,
        success: false,
      });
    }

    // 2. Find the table and ensure it belongs to the waiter's restaurant
    const table = await tableModel.findById(tableId);
    if (
      !table ||
      table.restaurantId.toString() !== waiter.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Table not found in your restaurant." });
    }

    // 3. Check if the table is available
    if (table.status !== "AVAILABLE") {
      return response
        .status(400)
        .json({ message: `Table is currently ${table.status}.` });
    }

    // 4. Generate a secure, random 4-digit PIN
    const pin = crypto.randomInt(1000, 9999).toString();
    const pinExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000); // PIN is valid for 4 hours

    // 5. Update the table
    table.status = "IN_USE";
    table.currentWaiterId = waiterId;
    table.currentPin = pin;
    table.currentPinExpires = pinExpiry;
    await table.save();

    // 6. Return the PIN to the waiter
    return response.status(200).json({
      message: `Table ${table.name} opened successfully.`,
      error: false,
      success: true,
      data: {
        tableId: table._id,
        tableName: table.name,
        tablePin: pin,
      },
    });
  } catch (err) {
    request.log.error(err, "Error in openTable");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a table's details
// @route   PUT /api/tables/:id
// @access  Private (Manager)
export const updateTable = async (request, response) => {
  try {
    const { id: tableId } = request.params;
    const { name } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can update tables.",
        error: true,
        success: false,
      });
    }

    const table = await tableModel.findById(tableId);
    if (
      !table ||
      table.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Table not found in your restaurant." });
    }

    if (name) {
      table.name = name;
    }

    await table.save();

    return response.status(200).json({
      message: "Table updated successfully.",
      data: table,
    });
  } catch (err) {
    if (err.code === 11000) {
      return response
        .status(400)
        .json({ message: "A table with this name already exists." });
    }
    request.log.error(err, "Error in updateTable");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Archive a table (Soft Delete)
// @route   DELETE /api/tables/:id
// @access  Private (Manager)
export const archiveTable = async (request, response) => {
  try {
    const { id: tableId } = request.params;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can archive tables.",
        error: true,
        success: false,
      });
    }

    const table = await tableModel.findById(tableId);
    if (
      !table ||
      table.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Table not found in your restaurant." });
    }

    if (table.status === "IN_USE") {
      return response
        .status(400)
        .json({ message: "Cannot archive a table that is currently in use." });
    }

    table.isArchived = true;
    await table.save();

    return response
      .status(200)
      .json({ message: "Table archived successfully." });
  } catch (err) {
    request.log.error(err, "Error in archiveTable");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
