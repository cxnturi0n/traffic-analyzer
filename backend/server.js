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

var server = express();

server.use(bodyParser.json());
server.use(cors({
  origin: env.ALLOW_ORIGIN_HEADER_REACT_WEBAPP, // Set the allowed origin to React Webapp origin
  credentials: true, // Gitpod requires credentials for private ports
}));

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
  console.log("Traffic analyzer express server listening on port", env.SERVER_PORT);
});
