class RoadsService {
  pool;

  constructor(pool) {
    this.pool = pool;
  }

  async getRoadsCount(where) {
    const query = getRoadsCount(where.region);
    const roadsCount = await this.pool.query(query);
    return roadsCount.rows[0].count;
  }

  async getRoadGeometries(where) {
    const queryText = where.roadIds
      ? getRoadGeometriesQueryByRoadIds(where.region)
      : getRoadGeometriesQuery(where.region);
    const placeholders = where.roadIds ? where.roadIds : [];

    const query = {
      text: queryText,
      values: [placeholders],
    };

    const roadGeometries = await this.pool.query(query);

    const parsedGeometries = roadGeometries.rows.map((row) => {
      const polygons = JSON.parse(row.polygons).coordinates.map(
        (coordinates) => {
          const linearRing = {
            coordinates: coordinates.map((coordPair) => ({
              latitude: coordPair[1],
              longitude: coordPair[0],
            })),
          };
          return {
            rings: [linearRing],
          };
        }
      );
      return {
        road_id: row.road_id,
        polygons: polygons,
      };
    });

    return parsedGeometries;
  }
}

function getRoadGeometriesQuery(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM ${region}_streets`;
  return query;
}

function getRoadGeometriesQueryByRoadIds(region) {
  const query = `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM ${region}_streets WHERE ogc_fid = ANY($1::int[])`;
  return query;
}

function getRoadsCount(region) {
  const query = `SELECT count(*) AS count FROM ${region}_streets`;
  return query;
}

export { RoadsService };
