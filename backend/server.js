import express from "express";
import * as neo4j from "./src/databases/neo4j.database.js";
import bodyParser from "body-parser";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { observationResolvers } from "./src/graphql/resolvers.graphql.js";
import { observationTypedefs } from "./src/graphql/typedefs.graphql.js";
import * as postgres from "./src/databases/postgres.database.js";
import { getRoads } from "./src/controllers/roads.controller.js";
import * as env from "./properties.js";
import { validateQueryParameters } from "./src/middlewares/validateQueryParams.middleware.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";

var app = express();

const corsConfig = {
  origin: env.ALLOW_ORIGIN_HEADER_REACT_WEBAPP,
  credentials: true,
};

neo4j.initDriver(env.NEO4J_URI, env.NEO4J_USERNAME, env.NEO4J_PASSWORD);

postgres.initPool(
  env.POSTGRES_HOST,
  env.POSTGRES_PORT,
  env.POSTGRES_DATABASE,
  env.POSTGRES_USER,
  env.POSTGRES_PASSWORD
);

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: observationTypedefs,
  resolvers: observationResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  env.API_PREFIX + "/roads", // Roads Rest endpoint
  cors(corsConfig),
  bodyParser.json(),
  validateQueryParameters,
  errorMiddleware,
  getRoads
);

app.use(
  env.API_PREFIX + "/observations", // Observations GraphQL endpoint
  cors(corsConfig),
  bodyParser.json(),
  expressMiddleware(server)
);

await new Promise((resolve) =>
  httpServer.listen({ port: env.SERVER_PORT }, resolve)
);

console.log(`🚀 Server ready 🚀`);
