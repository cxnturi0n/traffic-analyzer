import { Router } from "express";

import { roadsRouter } from "./roads.routes.js";

const serverRouter = new Router();

serverRouter.use("/roads", roadsRouter);

export { serverRouter };
