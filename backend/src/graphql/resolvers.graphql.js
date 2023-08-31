import { getObservations, getVehicleCountForEachRoad, getAverageSpeedForEachRoad } from "../controllers/observations.controller.js";

const observationResolvers = {
  Query: {
    observations: getObservations,
    vehicleCountForEachRoad: getVehicleCountForEachRoad,
    averageSpeedForEachRoad: getAverageSpeedForEachRoad,
    // roads: getRoads,
    // roadsCount: getRoadsCount
  },
};

export { observationResolvers };
