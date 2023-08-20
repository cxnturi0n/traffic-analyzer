import express from "express";
import * as roadsController from "../controllers/roads.controller.js";
import { validateQueryParameters } from "../middlewares/validate.middleware.js";
import { observationsRouter } from "./observations.routes.js";

const roadsRouter = express.Router();

roadsRouter.get("/", roadsController.get);

roadsRouter.use("/observations", observationsRouter)

export { roadsRouter };