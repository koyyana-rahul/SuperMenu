import { Router } from "express";
import { createMenuSubcategory } from "../controllers/menuSubcategory.controller.js";
import auth from "../middleware/auth.js";

const menuSubcategoryRouter = Router();

menuSubcategoryRouter.use(auth);

menuSubcategoryRouter.route("/").post(createMenuSubcategory);

export default menuSubcategoryRouter;