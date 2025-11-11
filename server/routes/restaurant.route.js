import { Router } from "express";
import {
  createRestaurant,
  archiveRestaurant,
  getRestaurantById,
  getRestaurantsByBrand,
  updateRestaurantSettings,
  updateRestaurant,
} from "../controllers/restaurant.controller.js";
import auth from "../middleware/auth.js";

const restaurantRouter = Router();

// All routes in this file are protected
restaurantRouter.use(auth);

// Route for manager to update their own restaurant's settings
restaurantRouter.patch("/settings", updateRestaurantSettings);

restaurantRouter.route("/").post(createRestaurant).get(getRestaurantsByBrand);

restaurantRouter
  .route("/:id")
  .get(getRestaurantById)
  .put(updateRestaurant)
  .delete(archiveRestaurant);

export default restaurantRouter;
