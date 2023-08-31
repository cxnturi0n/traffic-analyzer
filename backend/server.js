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

var app = express();

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

app.use(cors())
app.use(bodyParser.json())

app.use(env.API_PREFIX+"/roads", getRoads) // Roads Rest endpoint
app.use(env.API_PREFIX+"/observations", expressMiddleware(server)); // Observations GraphQL endpoint

await new Promise((resolve) => httpServer.listen({ port: env.SERVER_PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:8087 🚀`);
