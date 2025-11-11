import { Router } from "express";
import {
  createMenuSubcategory,
  getMenuSubcategories,
  updateMenuSubcategory,
  archiveMenuSubcategory,
} from "../controllers/menuSubCategory.controller.js";
import auth from "../middleware/auth.js";

const menuSubcategoryRouter = Router();

// All routes are protected and require a logged-in user
menuSubcategoryRouter.use(auth);

menuSubcategoryRouter
  .route("/")
  .post(createMenuSubcategory)
  .get(getMenuSubcategories);

menuSubcategoryRouter
  .route("/:id")
  .put(updateMenuSubcategory)
  .delete(archiveMenuSubcategory);

export default menuSubcategoryRouter;
