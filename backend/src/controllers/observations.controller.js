import { getDriver } from "../databases/neo4j.database.js";

import ObservationsService from "../services/observations.service.js";

async function getNumVehicles(req, res, next) {
  try {
    const driver = getDriver();
    const observationsService = new ObservationsService(driver);
    res.json(await observationsService.getNumVehicles(req));
  } catch (err) {
    next(err);
  }
}

async function getAvgSpeeds(req, res, next) {
  try {
    const driver = getDriver();
    const observationsService = new ObservationsService(driver);
    res.json(await observationsService.getAvgSpeeds(req));
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const driver = getDriver();
    const observationsService = new ObservationsService(driver);
    res.json(await observationsService.get(req));
  } catch (err) {
    next(err);
  }
}

export { getNumVehicles, getAvgSpeeds, get };
