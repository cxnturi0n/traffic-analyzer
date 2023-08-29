class ObservationsService {
  driver;

  constructor(driver) {
    this.driver = driver;
  }

  async getAggregateRoadNumVehicles(where, options) {
    const session = this.driver.session();
    let query = `
          MATCH (o:Observation${where.region}_${where.granularity}min)
          WHERE o.timestamp IS NOT NULL`;

    const params = { ...where };

    if (where.startTime !== null) {
      query += " AND o.timestamp >= $startTime";
    }

    if (where.endTime !== null) {
      query += " AND o.timestamp < $endTime";
    }

    if (where.roadIds !== null) {
      query += " AND o.road_id IN $roadIds";
    }

    if (where.days !== null) {
      query +=
        " AND date(datetime({epochSeconds: o.timestamp})).dayOfWeek IN $days";
    }

    query += `
          WITH o.road_id AS road_id, SUM(o.num_vehicles) AS sum_vehicles
          ORDER BY sum_vehicles ${options.order}`;

    if (options.limit !== null) {
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

  async getAggregateRoadAvgSpeeds(where, options) {
    const session = this.driver.session();

    let query = `
        MATCH (o:Observation${where.region}_${where.granularity}min)
        WHERE o.timestamp IS NOT NULL`;

    const params = { ...where };

    if (where.startTime !== null) {
      query += " AND o.timestamp >= $startTime";
    }

    if (where.endTime !== null) {
      query += " AND o.timestamp < $endTime";
    }

    if (where.roadIds !== null) {
      query += " AND o.road_id IN $roadIds";
    }

    if (where.days !== null) {
      query +=
        " AND date(datetime({epochSeconds: o.timestamp})).dayOfWeek IN $days";
    }

    query += `
        WITH o.road_id AS road_id, AVG(o.avg_speed) AS avg_speed
        ORDER BY avg_speed ${options.order}`;

    if (options.limit !== null) {
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
