import { Router } from "express";
import {
  createMenuCategory,
  getMenuCategories,
  updateMenuCategory,
  archiveMenuCategory,
} from "../controllers/menuCategory.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const menuCategoryRouter = Router();

// All routes are protected and require a logged-in user
menuCategoryRouter.use(auth);

menuCategoryRouter
  .route("/")
  .post(upload.single("image"), createMenuCategory)
  .get(getMenuCategories);

menuCategoryRouter
  .route("/:id")
  .put(upload.single("image"), updateMenuCategory)
  .delete(archiveMenuCategory);

export default menuCategoryRouter;
