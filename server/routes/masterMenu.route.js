import { Router } from "express";
import {
  createMasterItem,
  getMasterItems,
  updateMasterItem,
} from "../controllers/masterMenu.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const masterMenuRouter = Router();

// All routes are protected and require a logged-in user
masterMenuRouter.use(auth);

masterMenuRouter
  .route("/")
  .post(upload.single("image"), createMasterItem)
  .get(getMasterItems);
masterMenuRouter.route("/:id").put(upload.single("image"), updateMasterItem);

export default masterMenuRouter;
