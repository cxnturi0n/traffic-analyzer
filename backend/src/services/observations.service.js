import {
  addFilter,
  addTimestampIntervalFilter,
  addDaysOfWeekFilter,
  addLimit,
  addReturnFields,
  addOrdering,
  addRoadIdsRangeFilter,
} from "../utils/neo4j.utils.js";
import neo4j from "neo4j-driver";

import { getPool } from "../databases/postgres.database.js";

import {
  getSpecificRoadsPolygonsQuery,
  getPolygonCoords,
} from "./roads.service.js";

export default class ObservationsService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  async getObservationsFromDatabase(session, queryParams) {
    const neo4jGetObservationsWithFiltersQuery =
      getObservationsQueryWithFilters(queryParams);
  
    const neo4jQueryParams = getNeo4jQueryPlaceholders(queryParams);
  
    const { records } = await session.executeRead((tx) => {
      return tx.run(neo4jGetObservationsWithFiltersQuery, neo4jQueryParams);
    });
  
    return records;
  }
  
  async getRoadsPolygons(queryParams, observations) {
    const postgisPool = getPool(); // Get postgres pool
  
    const postgisGetSpecificRoadsPolygonsQuery = {
      text: getSpecificRoadsPolygonsQuery(queryParams.region.toLowerCase()),
      values: [roadIdsAsArray(observations)],
    };
  
    const roads = await postgisPool.query(postgisGetSpecificRoadsPolygonsQuery);
  
    return getPolygonCoords(roads.rows);
  }

  async get(req) {
    const session = this.driver.session();
    const queryParams = req.query;
  
    try {
      const records = await this.getObservationsFromDatabase(
        session,
        queryParams
      );
  
      const observations = neo4jRecordsToObservations(records);
  
      if (queryParams && queryParams.polygons === "true") {
        const roads = await this.getRoadsPolygons(queryParams, observations);
        return {
          observations,
          roads,
        };
      }
      
      return observations;
    } finally {
      await session.close();
    }
  }
  



}

function getObservationsQueryWithFilters(params) {
  // Builds query to get observations based on the filters specified as query parameters in the request

  let cypherQuery = `
    MATCH (o:Observation${params.region + "_" + params.granularity + "min"})
  `;

  if (params.tbegin || params.tend) {
    cypherQuery = addTimestampIntervalFilter(
      cypherQuery,
      params.tbegin,
      params.tend,
      "o.timestamp"
    );
  }

  if (params.roadIds) {
    cypherQuery = addRoadIdsRangeFilter(
      cypherQuery,
      params.roadIds,
      "o.road_id"
    );
  }

  if (params.days) {
    cypherQuery = addDaysOfWeekFilter(cypherQuery, params.days, "o.timestamp");
  }

  if (params.region) {
    cypherQuery = addFilter(cypherQuery, `o.region = $region`);
  }

  const typeToObservationField = {
    "most-crowded": "sum_vehicles",
    "least-crowded": "sum_vehicles",
    "most-speed": "avg_speed",
    "least-speed": "avg_speed",
  };

  cypherQuery += " WITH o.road_id AS road_id";
  if (params.type) {
    const orderByCondition = params.type.includes("most") ? "DESC" : "ASC";
    if (params.type.includes("crowded")) {
      cypherQuery += ", SUM(o.num_vehicles) AS sum_vehicles ";
    } else if (params.type.includes("speed")) {
      cypherQuery += ", AVG(o.avg_speed) AS avg_speed ";
    }
    cypherQuery = addOrdering(
      cypherQuery,
      typeToObservationField[params.type],
      orderByCondition
    );
    cypherQuery = addLimit(cypherQuery, params.limit);
  } else {
    cypherQuery +=
      ", o.timestamp AS timestamp, o.avg_speed AS avg_speed, o.num_vehicles AS num_vehicles";
  }

  cypherQuery = addReturnFields(
    cypherQuery,
    `road_id ${
      params.type
        ? "," + typeToObservationField[params.type]
        : ", timestamp, avg_speed, num_vehicles"
    }`
  );
  if (!params.type) {
    cypherQuery = addLimit(cypherQuery, params.limit);
  }

  return cypherQuery;
}


function neo4jRecordsToObservations(records) {
const transformedArray = records.map((record) => {
  const obj = {};
  record.keys.forEach((key, index) => {
    obj[key] = record._fields[index];
  });
  return obj;
});
return transformedArray;
}

function roadIdsAsArray(records) {
// Create a Set to store unique road IDs
const uniqueRoadIds = new Set();

// Iterate through the records and add road IDs to the Set
records.forEach((record) => {
  uniqueRoadIds.add(record.road_id);
});

// Convert the Set back to an array
return Array.from(uniqueRoadIds);
}

function getNeo4jQueryPlaceholders(params) {
// Neo4j query placeholders to counter SQL injections
return {
  region: params.region,
  roadIds: params.roadIds ? JSON.parse(params.roadIds) : undefined,
  tbegin: params.tbegin ? neo4j.int(params.tbegin) : undefined,
  tend: params.tend ? neo4j.int(params.tend) : undefined,
  limit: params.limit ? neo4j.int(params.limit) : undefined,
  days: params.days ? JSON.parse(params.days) : undefined,
};
}