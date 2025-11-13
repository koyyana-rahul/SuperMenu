import { Router } from "express";
import {
  createMenuCategory,
  getMenuCategories,
} from "../controllers/menuCategory.controller.js";
import auth from "../middleware/auth.js";

const menuCategoryRouter = Router();

menuCategoryRouter.use(auth);

menuCategoryRouter.route("/").post(createMenuCategory).get(getMenuCategories);

// Add routes for /:id (PUT, DELETE) here

export default menuCategoryRouter;