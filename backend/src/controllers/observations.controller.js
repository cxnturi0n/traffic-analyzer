import { ObservationsService } from "../services/observations.service.js";
import { getDriver } from "../databases/neo4j.database.js";


async function getObservations(parent, { where, options }, context, info) {
  const neo4jDriver = getDriver();
  const observationsService = new ObservationsService(neo4jDriver);
  return observationsService.getObservations(where, options, info);
}

async function getVehicleCountForEachRoad(parent, { where, options }) {
  const neo4jDriver = getDriver();
  const observationsService = new ObservationsService(neo4jDriver);
  return observationsService.getVehicleCountForEachRoad(where, options);
}

async function getAverageSpeedForEachRoad(_, { where, options }) {
  const neo4jDriver = getDriver();
  const observationsService = new ObservationsService(neo4jDriver);
  return observationsService.getAverageSpeedForEachRoad(where, options);
}

export { getObservations, getVehicleCountForEachRoad, getAverageSpeedForEachRoad };
