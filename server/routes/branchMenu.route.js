import { Router } from "express";
import {
  addBranchMenuItem,
  getMasterMenuForManager,
  getBranchMenuItems,
  getBranchMenuItemById,
  updateBranchMenuItem,
  archiveBranchMenuItem,
  updateBranchMenuItemModifiers,
} from "../controllers/branchMenu.controller.js";
import auth from "../middleware/auth.js";

const branchMenuRouter = Router();

// All routes are protected and require a logged-in user
branchMenuRouter.use(auth);

// Get the master list for the manager to choose from
branchMenuRouter.route("/master-list").get(getMasterMenuForManager);

// Create a new branch menu item or get all items for the branch
branchMenuRouter.route("/").post(addBranchMenuItem).get(getBranchMenuItems);

// Routes for a specific branch menu item
branchMenuRouter
  .route("/:itemId")
  .get(getBranchMenuItemById)
  .put(updateBranchMenuItem)
  .delete(archiveBranchMenuItem);

// Route to specifically update modifiers on an item
branchMenuRouter
  .route("/:itemId/modifiers")
  .patch(updateBranchMenuItemModifiers);

export default branchMenuRouter;
