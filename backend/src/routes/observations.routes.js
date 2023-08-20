import express from "express";
import * as observationsController from "../controllers/observations.controller.js";
import { validateQueryParameters } from "../middlewares/validate.middleware.js";

const observationsRouter = express.Router();

observationsRouter.get(
  "/",
  observationsController.get
);

observationsRouter.get(
  "/num-vehicles",
  observationsController.getNumVehicles
);

observationsRouter.get(
  "/avg-speeds",
  observationsController.getAvgSpeeds
);

export { observationsRouter };
