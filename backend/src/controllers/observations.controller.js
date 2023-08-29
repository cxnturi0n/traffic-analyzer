import { ObservationsService } from "../services/observations.service.js";
import { getDriver } from "../databases/neo4j.database.js";

async function getAggregateRoadNumVehicles(_, { where, options }) {
  const neo4jDriver = getDriver();
  const observationsService = new ObservationsService(neo4jDriver);
  return observationsService.getAggregateRoadNumVehicles(where, options);
}

async function getAggregateRoadAvgSpeeds(_, { where, options }) {
  const neo4jDriver = getDriver();
  const observationsService = new ObservationsService(neo4jDriver);
  return observationsService.getAggregateRoadAvgSpeeds(where, options);
}

export { getAggregateRoadNumVehicles, getAggregateRoadAvgSpeeds };
