import { Neo4jGraphQL } from "@neo4j/graphql";
import express from "express";
import * as neo4j from "./src/databases/neo4j.database.js";
import bodyParser from "body-parser";
import * as env from "./properties.js";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { observationResolvers } from "./src/graphql/resolvers.graphql.js";
import { observationTypedefs } from "./src/graphql/typedefs.graphql.js";
import * as postgres from "./src/databases/postgres.database.js";

var app = express();

const driver = neo4j.initDriver(env.NEO4J_URI, env.NEO4J_USERNAME, env.NEO4J_PASSWORD);

postgres.initPool(
  env.POSTGRES_HOST,
  env.POSTGRES_PORT,
  env.POSTGRES_DATABASE,
  env.POSTGRES_USER,
  env.POSTGRES_PASSWORD
);

const neoSchema = new Neo4jGraphQL({
  driver: driver,
  typeDefs: observationTypedefs,
  resolvers: observationResolvers,
});

const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: await neoSchema.getSchema(),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(env.API_PREFIX, cors(), bodyParser.json(), expressMiddleware(server));

await new Promise((resolve) => httpServer.listen({ port: 8087 }, resolve));

console.log(`🚀 Server ready at http://localhost:8087 🚀`);
