import { Router } from "express";
import {
  getSalesReportForManager,
  getSalesReportForBrandAdmin,
  getBrandDashboardStats,
  getManagerDashboardStats,
  getSalesReportForBranch,
} from "../controllers/reporting.controller.js";
import auth from "../middleware/auth.js";

const reportingRouter = Router();

reportingRouter.use(auth);

reportingRouter.get("/sales-summary", getSalesReportForManager);
reportingRouter.get("/brand-sales-summary", getSalesReportForBrandAdmin);
reportingRouter.get("/brand-dashboard", getBrandDashboardStats);
reportingRouter.get("/manager-dashboard", getManagerDashboardStats);
reportingRouter.get("/branch-sales/:restaurantId", getSalesReportForBranch);

export default reportingRouter;
