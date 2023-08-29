import { getPool } from "../databases/postgres.database.js";
import { RoadsService } from "../services/roads.service.js";

async function getRoadGeometries(_, { where }) {
  const postgisPool = getPool();
  const roadsService = new RoadsService(postgisPool);
  return roadsService.getRoadGeometries(where);
}

async function getRoadsCount(_, { where }) {
  const postgisPool = getPool();
  const roadsService = new RoadsService(postgisPool);
  return roadsService.getRoadsCount(where);
}


export { getRoadGeometries, getRoadsCount};
