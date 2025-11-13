import masterMenuItemModel from "../models/masterMenuItem.model.js";
import userModel from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Create a new master menu item
// @route   POST /api/master-menu
// @access  Private (BrandAdmin)
export const createMasterItem = async (request, response) => {
  try {
    const {
      name,
      description,
      basePrice,
      dietaryInfo,
      categoryId,
      subcategoryId,
    } = request.body;
    const brandAdminId = request.userId;

    // 1. Validate Brand Admin
    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    // 2. Check for required fields
    if (!name || !description || !basePrice || !categoryId) {
      return response.status(400).json({
        message: "Name, description, basePrice, and categoryId are required.",
      });
    }

    let imageUrl = "";
    // 3. Handle image upload if a file is present
    if (request.file) {
      try {
        // The request.file.path is provided by multer
        const cloudinaryResponse = await uploadToCloudinary(request.file.path);
        imageUrl = cloudinaryResponse.url;
      } catch (uploadError) {
        request.log.error(uploadError, "Cloudinary upload failed");
        // It's important to return here so we don't proceed with a failed upload
        return response.status(500).json({
          message: "Failed to upload image. Please check server logs.",
          error: true,
          success: false,
        });
      }
    }

    // 4. Create the new item in the database
    const newItem = await masterMenuItemModel.create({
      brandId: brandAdmin.brandId,
      name,
      description,
      categoryId,
      subcategoryId: subcategoryId || null,
      basePrice: Number(basePrice), // Convert string to number
      image: imageUrl, // Use the URL from Cloudinary or empty string
      dietaryInfo: dietaryInfo || [],
    });

    return response.status(201).json({
      message: "Master menu item created successfully",
      error: false,
      success: true,
      data: newItem,
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

// @desc    Update a master menu item
// @route   PUT /api/master-menu/:id
// @access  Private (BrandAdmin)
export const updateMasterItem = async (request, response) => {
  try {
    const {
      name,
      description,
      basePrice,
      dietaryInfo,
      categoryId,
      subcategoryId,
    } = request.body;
    const { id: itemId } = request.params;
    const brandAdminId = request.userId;

    // 1. Validate Brand Admin
    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    // 2. Find the item to update
    const itemToUpdate = await masterMenuItemModel.findOne({
      _id: itemId,
      brandId: brandAdmin.brandId,
    });

    if (!itemToUpdate) {
      return response.status(404).json({ message: "Menu item not found." });
    }

    // 3. Handle image upload if a file is present
    let imageUrl = itemToUpdate.image;
    if (request.file) {
      try {
        const cloudinaryResponse = await uploadToCloudinary(request.file.path);
        imageUrl = cloudinaryResponse.url;
      } catch (uploadError) {
        request.log.error(
          uploadError,
          "Cloudinary upload failed during update"
        );
        return response.status(500).json({
          message: "Failed to upload new image. Please check server logs.",
          error: true,
          success: false,
        });
      }
    }

    // 4. Update the item fields
    itemToUpdate.name = name || itemToUpdate.name;
    itemToUpdate.description = description || itemToUpdate.description;
    itemToUpdate.basePrice = Number(basePrice) || itemToUpdate.basePrice; // Convert string to number
    itemToUpdate.categoryId = categoryId;
    itemToUpdate.subcategoryId = subcategoryId || null;
    itemToUpdate.image = imageUrl;
    itemToUpdate.dietaryInfo = dietaryInfo || [];

    const updatedItem = await itemToUpdate.save();

    return response.status(200).json({
      message: "Master menu item updated successfully",
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

// @desc    Get all master menu items for a brand
// @route   GET /api/master-menu
// @access  Private (BrandAdmin)
export const getMasterItems = async (request, response) => {
  try {
    const brandAdminId = request.userId;

    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    const items = await masterMenuItemModel
      .find({ brandId: brandAdmin.brandId, isArchived: false })
      .sort({ createdAt: -1 });

    return response.status(200).json({
      message: "Master menu fetched successfully",
      error: false,
      success: true,
      data: items,
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

// You would also have updateMasterMenuItem, archiveMasterMenuItem etc. here

export default {
  createMasterItem,
  updateMasterItem,
  getMasterItems,
};
