import kitchenStationModel from "../models/kitchen.model.js";
import branchMenuItemModel from "../models/branchMenuItem.model.js";
import userModel from "../models/user.model.js";

// @desc    Create a kitchen station
// @route   POST /api/kitchen-stations
// @access  Private (Manager)
export const createKitchenStation = async (request, response) => {
  try {
    const { name } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can create kitchen stations.",
        error: true,
        success: false,
      });
    }

    const station = await kitchenStationModel.create({
      name,
      restaurantId: manager.restaurantId,
    });

    return response.status(201).json({
      message: "Kitchen station created successfully",
      error: false,
      success: true,
      data: station,
    });
  } catch (err) {
    if (err.code === 11000) {
      return response.status(400).json({
        message: "A station with this name already exists in your restaurant.",
      });
    }
    request.log.error(err, "Error in createKitchenStation");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Get all kitchen stations for a restaurant
// @route   GET /api/kitchen-stations
// @access  Private (Manager)
export const getKitchenStations = async (request, response) => {
  try {
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can view kitchen stations.",
        error: true,
        success: false,
      });
    }

    const stations = await kitchenStationModel.find({
      restaurantId: manager.restaurantId,
    });

    return response.status(200).json({
      message: "Kitchen stations fetched successfully",
      error: false,
      success: true,
      data: stations,
    });
  } catch (err) {
    request.log.error(err, "Error in getKitchenStations");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// @desc    Update a kitchen station
// @route   PUT /api/kitchen-stations/:id
// @access  Private (Manager)
export const updateKitchenStation = async (request, response) => {
  try {
    const { id: stationId } = request.params;
    const { name } = request.body;
    const managerId = request.userId;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can update kitchen stations.",
        error: true,
        success: false,
      });
    }

    const station = await kitchenStationModel.findById(stationId);
    if (
      !station ||
      station.restaurantId.toString() !== manager.restaurantId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Kitchen station not found in your restaurant." });
    }

    if (name) {
      station.name = name;
    }

    await station.save();

    return response.status(200).json({
      message: "Kitchen station updated successfully.",
      data: station,
    });
  } catch (err) {
    if (err.code === 11000) {
      return response
        .status(400)
        .json({ message: "A station with this name already exists." });
    }
    request.log.error(err, "Error in updateKitchenStation");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Archive a kitchen station (Soft Delete)
// @route   DELETE /api/kitchen-stations/:id
// @access  Private (Manager)
export const deleteKitchenStation = async (request, response) => {
  try {
    const managerId = request.userId;
    const stationId = request.params.id;

    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response.status(403).json({
        message: "Only an assigned Manager can delete kitchen stations.",
        error: true,
        success: false,
      });
    }

    const station = await kitchenStationModel.findById(stationId);

    if (!station) {
      return response
        .status(404)
        .json({ message: "Kitchen station not found" });
    }

    // Ensure the manager is deleting a station from their own restaurant
    if (station.restaurantId.toString() !== manager.restaurantId.toString()) {
      return response
        .status(403)
        .json({ message: "Not authorized to delete this station" });
    }

    // Production-ready check: Is this station linked to any active menu items?
    const linkedItem = await branchMenuItemModel.findOne({
      kitchenStationId: stationId,
      isArchived: false,
    });

    if (linkedItem) {
      return response.status(400).json({
        message:
          "Cannot delete station as it is currently assigned to one or more menu items.",
      });
    }

    station.isArchived = true;
    await station.save();

    return response.status(200).json({
      message: "Kitchen station deleted successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    request.log.error(err, "Error in deleteKitchenStation");
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
