import menuSubcategoryModel from "../models/menuSubcategory.model.js";
import userModel from "../models/user.model.js";

export const createMenuSubcategory = async (request, response) => {
  try {
    const { name, categoryId } = request.body;
    const brandAdminId = request.userId;

    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    if (!name || !categoryId) {
      return response
        .status(400)
        .json({ message: "Subcategory name and categoryId are required." });
    }

    const newSubcategory = await menuSubcategoryModel.create({
      brandId: brandAdmin.brandId,
      categoryId,
      name,
    });

    return response.status(201).json({
      message: "Menu subcategory created successfully",
      success: true,
      data: newSubcategory,
    });
  } catch (err) {
    request.log.error(err, "Error in createMenuSubcategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// NOTE: In a full implementation, you would also have controllers for
// updateMenuSubcategory, archiveMenuSubcategory, etc.

export default {
  createMenuSubcategory,
};