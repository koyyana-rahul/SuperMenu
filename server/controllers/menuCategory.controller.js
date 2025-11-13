import menuCategoryModel from "../models/menuCategory.model.js";
import userModel from "../models/user.model.js";

export const createMenuCategory = async (request, response) => {
  try {
    const { name } = request.body;
    const brandAdminId = request.userId;

    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    if (!name) {
      return response
        .status(400)
        .json({ message: "Category name is required." });
    }

    const newCategory = await menuCategoryModel.create({
      brandId: brandAdmin.brandId,
      name,
    });

    return response.status(201).json({
      message: "Menu category created successfully",
      success: true,
      data: newCategory,
    });
  } catch (err) {
    request.log.error(err, "Error in createMenuCategory");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMenuCategories = async (request, response) => {
  try {
    const brandAdminId = request.userId;

    const brandAdmin = await userModel.findById(brandAdminId);
    if (!brandAdmin || brandAdmin.role !== "BRAND_ADMIN") {
      return response.status(403).json({ message: "Not authorized." });
    }

    const categories = await menuCategoryModel
      .aggregate([
        { $match: { brandId: brandAdmin.brandId, isArchived: false } },
        {
          $lookup: {
            from: "menusubcategories",
            localField: "_id",
            foreignField: "categoryId",
            as: "subcategories",
            pipeline: [{ $match: { isArchived: false } }],
          },
        },
        { $sort: { name: 1 } },
      ])
      .exec();

    return response.status(200).json({
      message: "Menu categories fetched successfully",
      success: true,
      data: categories,
    });
  } catch (err) {
    request.log.error(err, "Error in getMenuCategories");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// NOTE: In a full implementation, you would also have controllers for
// updateMenuCategory, archiveMenuCategory, createMenuSubcategory, etc.
// For brevity, I am focusing on the creation and read paths.

export default {
  createMenuCategory,
  getMenuCategories,
};