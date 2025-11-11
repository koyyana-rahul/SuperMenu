import { Router } from "express";
import {
  createTable,
  getTables,
  openTable,
  updateTable,
  archiveTable,
  generateTableQR,
} from "../controllers/table.controller.js";
import auth from "../middleware/auth.js";

const tableRouter = Router();

// All routes are protected and require a logged-in user
tableRouter.use(auth);

tableRouter.route("/").post(createTable).get(getTables);

tableRouter.route("/:id").put(updateTable).delete(archiveTable);

tableRouter.route("/:id/open").post(openTable);
tableRouter.route("/:id/generate-qr").post(generateTableQR);

export default tableRouter;
