import { getObservations, getVehicleCountForEachRoad, getAverageSpeedForEachRoad } from "../controllers/observations.controller.js";

const observationResolvers = {
  Query: {
    observations: getObservations,
    vehicleCountForEachRoad: getVehicleCountForEachRoad,
    averageSpeedForEachRoad: getAverageSpeedForEachRoad,
  },
};

export { observationResolvers };
