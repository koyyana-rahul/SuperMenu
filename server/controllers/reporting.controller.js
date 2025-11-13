import orderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";
import restaurantModel from "../models/restaurant.model.js";
import mongoose from "mongoose";

// @desc    Get a sales report for a manager's restaurant
// @route   GET /api/reports/sales-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private (Manager)
export const getSalesReportForManager = async (request, response) => {
  try {
    const managerId = request.userId;
    const { startDate, endDate } = request.query;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view reports." });
    }

    if (!startDate || !endDate) {
      return response
        .status(400)
        .json({ message: "Please provide both a startDate and an endDate." });
    }

    // 2. Create the aggregation pipeline
    const report = await orderModel.aggregate([
      // Stage 1: Filter for PAID orders within the date range and restaurant
      {
        $match: {
          restaurantId: manager.restaurantId,
          orderStatus: "PAID",
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      // Stage 2: Group all matching documents to calculate summary stats
      {
        $group: {
          _id: null, // Group all documents into a single result
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          paymentMethods: { $addToSet: "$paymentMethod" }, // Get unique payment methods used
        },
      },
      // Stage 3: Shape the output
      {
        $project: {
          _id: 0, // Exclude the default _id field
          totalSales: 1,
          totalOrders: 1,
          averageOrderValue: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalSales", "$totalOrders"] },
            ],
          },
          paymentMethods: 1,
        },
      },
    ]);

    // If no orders are found, the report will be empty. Return a default structure.
    const summary = report[0] || {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      paymentMethods: [],
    };

    return response.status(200).json({ data: summary });
  } catch (err) {
    request.log.error(err, "Error in getSalesReportForManager");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get a sales report for a specific branch
// @route   GET /api/reports/branch-sales/:restaurantId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private (Brand Admin)
export const getSalesReportForBranch = async (request, response) => {
  try {
    const adminId = request.userId;
    const { restaurantId } = request.params;
    const { startDate, endDate } = request.query;

    // 1. Verify the user is a Brand Admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN" || !admin.brandId) {
      return response
        .status(403)
        .json({ message: "Only a Brand Admin can view this report." });
    }

    // 2. Verify the requested restaurant belongs to the admin's brand
    const restaurant = await restaurantModel.findById(restaurantId);
    if (
      !restaurant ||
      restaurant.brandId.toString() !== admin.brandId.toString()
    ) {
      return response
        .status(404)
        .json({ message: "Restaurant not found in your brand." });
    }

    if (!startDate || !endDate) {
      return response
        .status(400)
        .json({ message: "Please provide both a startDate and an endDate." });
    }

    // 3. Create the aggregation pipeline (same logic as for manager)
    const report = await orderModel.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderStatus: "PAID",
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          paymentMethods: { $addToSet: "$paymentMethod" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalOrders: 1,
          averageOrderValue: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalSales", "$totalOrders"] },
            ],
          },
          paymentMethods: 1,
        },
      },
    ]);

    const summary = report[0] || {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      paymentMethods: [],
    };

    return response.status(200).json({ data: summary });
  } catch (err) {
    request.log.error(err, "Error in getSalesReportForBranch");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get a sales report for a brand admin across all restaurants
// @route   GET /api/reports/brand-sales-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private (Brand Admin)
export const getSalesReportForBrandAdmin = async (request, response) => {
  try {
    const adminId = request.userId;
    const { startDate, endDate } = request.query;

    // 1. Verify the user is a Brand Admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN" || !admin.brandId) {
      return response
        .status(403)
        .json({ message: "Only a Brand Admin can view this report." });
    }

    if (!startDate || !endDate) {
      return response
        .status(400)
        .json({ message: "Please provide both a startDate and an endDate." });
    }

    // 2. Create the aggregation pipeline
    const report = await orderModel.aggregate([
      // Stage 1: Find all restaurants belonging to the brand
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurantDetails",
        },
      },
      { $unwind: "$restaurantDetails" },
      // Stage 2: Filter for PAID orders within the date range and for the correct brand
      {
        $match: {
          "restaurantDetails.brandId": admin.brandId,
          orderStatus: "PAID",
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      // Stage 3: Group by restaurant to get per-restaurant stats, then group again for grand total
      {
        $facet: {
          // Branch for per-restaurant summary
          salesByRestaurant: [
            {
              $group: {
                _id: "$restaurantId",
                name: { $first: "$restaurantDetails.name" },
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
            { $sort: { totalSales: -1 } },
          ],
          // Branch for grand total summary
          grandTotal: [
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
            { $project: { _id: 0 } },
          ],
        },
      },
    ]);

    const summary = {
      salesByRestaurant: report[0]?.salesByRestaurant || [],
      grandTotal: report[0]?.grandTotal[0] || { totalSales: 0, totalOrders: 0 },
    };

    return response.status(200).json({ data: summary });
  } catch (err) {
    request.log.error(err, "Error in getSalesReportForBrandAdmin");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get dashboard statistics for a brand admin
// @route   GET /api/reports/brand-dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private (Brand Admin)
export const getBrandDashboardStats = async (request, response) => {
  try {
    const adminId = request.userId;
    const { startDate, endDate } = request.query;

    // 1. Verify the user is a Brand Admin
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "BRAND_ADMIN" || !admin.brandId) {
      return response
        .status(403)
        .json({ message: "Only a Brand Admin can view this dashboard." });
    }

    if (!startDate || !endDate) {
      return response
        .status(400)
        .json({ message: "Please provide both a startDate and an endDate." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Main aggregation pipeline
    const report = await orderModel.aggregate([
      // Stage 1: Filter all orders for the brand within the date range
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurantDetails",
        },
      },
      { $unwind: "$restaurantDetails" },
      {
        $match: {
          "restaurantDetails.brandId": admin.brandId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      // Stage 2: Use $facet to run multiple independent aggregations
      {
        $facet: {
          // --- Sales Summary ---
          salesSummary: [
            { $match: { orderStatus: "PAID" } },
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
            { $project: { _id: 0 } },
          ],
          // --- "Flaws" and Operational Insights ---
          operationalInsights: [
            {
              $group: {
                _id: null,
                totalSuspiciousOrders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$orderStatus", "PENDING_APPROVAL"] },
                      1,
                      0,
                    ],
                  },
                },
                totalCancelledOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0],
                  },
                },
              },
            },
            { $project: { _id: 0 } },
          ],
          // --- Top Selling Items ---
          topSellingItems: [
            { $match: { orderStatus: "PAID" } },
            { $unwind: "$items" },
            { $match: { "items.itemStatus": { $ne: "CANCELLED" } } },
            {
              $group: {
                _id: "$items.name",
                totalQuantitySold: { $sum: "$items.quantity" },
              },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const dashboardData = report[0];

    // 3. Format the response
    const responseData = {
      salesSummary: dashboardData?.salesSummary[0] || {
        totalSales: 0,
        totalOrders: 0,
      },
      operationalInsights: dashboardData?.operationalInsights[0] || {
        totalSuspiciousOrders: 0,
        totalCancelledOrders: 0,
      },
      topSellingItems: dashboardData?.topSellingItems || [],
    };

    return response.status(200).json({ data: responseData });
  } catch (err) {
    request.log.error(err, "Error in getBrandDashboardStats");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get dashboard statistics for a manager's restaurant
// @route   GET /api/reports/manager-dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private (Manager)
export const getManagerDashboardStats = async (request, response) => {
  try {
    const managerId = request.userId;
    const { startDate, endDate } = request.query;

    // 1. Verify the user is a Manager
    const manager = await userModel.findById(managerId);
    if (!manager || manager.role !== "MANAGER" || !manager.restaurantId) {
      return response
        .status(403)
        .json({ message: "Only an assigned Manager can view this dashboard." });
    }

    if (!startDate || !endDate) {
      return response
        .status(400)
        .json({ message: "Please provide both a startDate and an endDate." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Main aggregation pipeline
    const [dashboardData] = await orderModel.aggregate([
      // Stage 1: Filter all orders for the manager's restaurant within the date range
      {
        $match: {
          restaurantId: manager.restaurantId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      // Stage 2: Use $facet to run multiple independent aggregations
      {
        $facet: {
          // --- Sales Summary ---
          salesSummary: [
            { $match: { orderStatus: "PAID" } },
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
            { $project: { _id: 0 } },
          ],
          // --- "Flaws" and Operational Insights ---
          operationalInsights: [
            {
              $group: {
                _id: null,
                totalSuspiciousOrders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$orderStatus", "PENDING_APPROVAL"] },
                      1,
                      0,
                    ],
                  },
                },
                totalCancelledOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0],
                  },
                },
              },
            },
            { $project: { _id: 0 } },
          ],
          // --- Top Selling Items ---
          topSellingItems: [
            { $match: { orderStatus: "PAID" } },
            { $unwind: "$items" },
            { $match: { "items.itemStatus": { $ne: "CANCELLED" } } },
            {
              $group: {
                _id: "$items.name",
                totalQuantitySold: { $sum: "$items.quantity" },
              },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    // 3. Format the response
    const responseData = {
      salesSummary: dashboardData?.salesSummary[0] || {
        totalSales: 0,
        totalOrders: 0,
      },
      operationalInsights: dashboardData?.operationalInsights[0] || {
        totalSuspiciousOrders: 0,
        totalCancelledOrders: 0,
      },
      topSellingItems: dashboardData?.topSellingItems || [],
    };

    return response.status(200).json({ data: responseData });
  } catch (err) {
    request.log.error(err, "Error in getManagerDashboardStats");
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
