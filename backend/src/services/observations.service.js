class ObservationsService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  async getObservations(where, options, info) {
    const session = this.driver.session();

    const requestedFields = info.fieldNodes[0].selectionSet.selections.map( // Columns requested by client
      (selection) => selection.name.value
    );

    let query = `
          MATCH (o:Observation${where.region}_${where.granularity}min)
          WHERE o.timestamp IS NOT NULL`;

    const params = { ...where };

    if (where.startTime) {
      query += " AND o.timestamp >= $startTime";
    }

    if (where.endTime) {
      query += " AND o.timestamp < $endTime";
    }

    if (where.roadIds) {
      query += " AND o.road_id IN $roadIds";
    }

    if (where.days) {
      query +=
        " AND date(datetime({epochSeconds: o.timestamp})).dayOfWeek IN $days";
    }
    query += " WITH o.road_id AS road_id, o.timestamp AS timestamp, o.num_vehicles AS num_vehicles, o.avg_speed AS avg_speed"

    if (options.sort) {
      query += ` ORDER BY ${options.sort} ${options.order}`;
    }

    query += ` RETURN ${requestedFields.join(", ")}`; // Return only columns requested by client and avoid overfetching

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      params.limit = options.limit;
    }

    const result = await session.run(query, params);

    return result.records.map((record) => { 
      const observation = {};
      requestedFields.forEach((field) => {
        observation[field] = record.get(field);
      });
      return observation;
    });
  }

  async getVehicleCountForEachRoad(where, options) {
    const session = this.driver.session();
    let query = `
          MATCH (o:Observation${where.region}_${where.granularity}min)
          WHERE o.timestamp IS NOT NULL`;

    const params = { ...where };

    if (where.startTime) {
      query += " AND o.timestamp >= $startTime";
    }

    if (where.endTime) {
      query += " AND o.timestamp < $endTime";
    }

    if (where.roadIds) {
      query += " AND o.road_id IN $roadIds";
    }

    if (where.days) {
      query +=
        " AND date(datetime({epochSeconds: o.timestamp})).dayOfWeek IN $days";
    }

    query += `
          WITH o.road_id AS road_id, SUM(o.num_vehicles) AS sum_vehicles
          ORDER BY sum_vehicles ${options.order}`;

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      params.limit = options.limit;
    }

    query += " RETURN road_id, sum_vehicles";

    const result = await session.run(query, params);

    return result.records.map((record) => ({
      road_id: record.get("road_id"),
      sum_vehicles: record.get("sum_vehicles"),
    }));
  }

  async getAverageSpeedForEachRoad(where, options) {
    const session = this.driver.session();

    let query = `
        MATCH (o:Observation${where.region}_${where.granularity}min)
        WHERE o.timestamp IS NOT NULL`;

    const params = { ...where };

    if (where.startTime) {
      query += " AND o.timestamp >= $startTime";
    }

    if (where.endTime) {
      query += " AND o.timestamp < $endTime";
    }

    if (where.roadIds) {
      query += " AND o.road_id IN $roadIds";
    }

    if (where.days) {
      query +=
        " AND date(datetime({epochSeconds: o.timestamp})).dayOfWeek IN $days";
    }

    query += `
        WITH o.road_id AS road_id, AVG(o.avg_speed) AS avg_speed
        ORDER BY avg_speed ${options.order}`;

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      params.limit = options.limit;
    }

    query += " RETURN road_id, avg_speed";

    const result = await session.run(query, params);

    return result.records.map((record) => ({
      road_id: record.get("road_id"),
      avg_speed: record.get("avg_speed"),
    }));
  }
}

export { ObservationsService };
