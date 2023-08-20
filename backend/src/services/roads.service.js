import { getPool } from "../databases/postgres.database.js";

class RoadsService {
  pool;

  constructor(pool) {
    this.pool = pool;
  }

  async get(req) {
    const region = req.query.region.toLowerCase();
    const justCount = req.query.count;
    const roadIds = req.query.roadIds;
    let ret = "";
    console.log(justCount);
    if (justCount && justCount != "true") {
      let roadPolygons = "";
      if (roadIds && JSON.parse(roadIds).length > 0) {
        const postgisGetSpecificRoadsPolygonsQuery = {
          // Craft postgres query to get the roads present in the roadIds array.
          text: getSpecificRoadsPolygonsQuery(region),
          values: [JSON.parse(roadIds)], // Road ids will be read from postgres from placeholders to avoid SQL injections
        };
        roadPolygons = await getPool().query(
          postgisGetSpecificRoadsPolygonsQuery
        );
      } else {
        roadPolygons = await getPool().query(getRoadsPolygonsQuery(region));
      }
      ret = getPolygonCoords(roadPolygons.rows);
    } else {
      const roadCount = await getPool().query(
        getRoadCount(region.toLowerCase())
      );
      ret = roadCount.rows;
    }

    return ret;
  }
}

function getPolygonCoords(records) {
  return records.map((record) => {
    return {
      road_id: record.road_id,
      polygon: JSON.parse(record.polygons).coordinates,
    };
  });
}

function getRoadsPolygonsQuery(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM ${region}`;
  return query;
}

function getSpecificRoadsPolygonsQuery(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM ${region} WHERE ogc_fid = ANY($1::int[])`;
  return query;
}

function getRoadCount(region) {
  const query = `SELECT count(*) AS road_count FROM ${region}`;
  return query;
}

export {
  RoadsService,
  getRoadsPolygonsQuery,
  getSpecificRoadsPolygonsQuery,
  getPolygonCoords,
  getRoadCount,
};
