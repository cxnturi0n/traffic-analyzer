import { getAggregateRoadNumVehicles, getAggregateRoadAvgSpeeds } from "../controllers/observations.controller.js";
import { getRoadGeometries, getRoadsCount } from "../controllers/roads.controller.js";

const observationResolvers = {
  Query: {
    aggregateRoadNumVehicles: getAggregateRoadNumVehicles,
    aggregateRoadAvgSpeeds: getAggregateRoadAvgSpeeds,
    roadGeometries: getRoadGeometries,
    roadsCount: getRoadsCount
  },
};

export { observationResolvers };
