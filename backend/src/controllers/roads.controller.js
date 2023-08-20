import { getPool } from "../databases/postgres.database.js";

import { RoadsService } from "../services/roads.service.js";

async function get(req, res, next) {
  try {
    const pool = getPool();
    const roadsService = new RoadsService(pool);
    res.json(await roadsService.get(req));
  } catch (err) {
    next(err);
  }
}

export { get };
