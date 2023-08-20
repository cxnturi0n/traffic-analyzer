import errorMiddleware from "./src/middlewares/error.middleware.js";
import { validateQueryParameters } from "./src/middlewares/validate.middleware.js";
import express from "express";
import * as neo4j from "./src/databases/neo4j.database.js";
import * as postgres from "./src/databases/postgres.database.js";
import bodyParser from "body-parser";
import { serverRouter } from "./src/routes/server.routes.js";
import * as env from "./properties.js";
import cors from "cors"
import helmet from "helmet"

import { rateLimit } from "express-rate-limit";

//Add express api limiter

var server = express();

server.use(bodyParser.json());
server.use(cors())

server.use(env.API_PREFIX, serverRouter);
server.use(helmet());
server.use(rateLimit({ //max 20 requests per minute
  windowMs: 1 * 60 * 1000, 
  max: 20,
}))
server.use(validateQueryParameters)
server.use(errorMiddleware);

neo4j.initDriver(env.NEO4J_URI, env.NEO4J_USERNAME, env.NEO4J_PASSWORD);

postgres.initPool(
  env.POSTGRES_HOST,
  env.POSTGRES_PORT,
  env.POSTGRES_DATABASE,
  env.POSTGRES_USER,
  env.POSTGRES_PASSWORD
);

server.listen(env.SERVER_PORT, function () {
  console.log("Example app listening at http://%s", env.SERVER_PORT);
});
