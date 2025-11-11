import { Router } from "express";
import {
  createKitchenStation,
  deleteKitchenStation,
  getKitchenStations,
  updateKitchenStation,
} from "../controllers/kitchenStation.controller.js";
import auth from "../middleware/auth.js";

const kitchenStationRouter = Router();

// All routes are protected and require a logged-in user
kitchenStationRouter.use(auth);

kitchenStationRouter
  .route("/")
  .post(createKitchenStation)
  .get(getKitchenStations);
kitchenStationRouter
  .route("/:id")
  .put(updateKitchenStation)
  .delete(deleteKitchenStation);

export default kitchenStationRouter;
