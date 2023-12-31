import { getPool } from "../databases/postgres.database.js";

class RoadsService {
  pool;

  constructor(pool) {
    this.pool = pool;
  }

  async getRoads(req) {
    const region = req.query.region.toLowerCase();
    const justCount = req.query.count;
    const roadIds = req.query.roadIds;
    let ret = "";
    if (!justCount || justCount !== "true") {
      let roadPolygons = "";
      if (roadIds && JSON.parse(roadIds).length > 0) {
        const postgisGetSpecificRoadPolygonsQuery = {
          // Craft postgres query to get the roads present in the roadIds array.
          text: getSpecificRoadPolygonsQuery(region),
          values: [JSON.parse(roadIds)], // Road ids will be read from postgres from placeholders to avoid SQL injections
        };
        roadPolygons = await getPool().query(
          postgisGetSpecificRoadPolygonsQuery
        );
      } else {
        roadPolygons = await getPool().query(getRoadPolygonsQuery(region));
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
      polygon: JSON.parse(record.polygon).coordinates,
    };
  });
}

function getRoadPolygonsQuery(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygon FROM ${region}_streets`;
  return query;
}

function getSpecificRoadPolygonsQuery(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygon FROM ${region}_streets WHERE ogc_fid = ANY($1::int[])`;
  return query;
}

function getRoadCount(region) {
  const query = `SELECT count(*) AS road_count FROM ${region}_streets`;
  return query;
}

export {
  RoadsService
};
