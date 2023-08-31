const observationTypedefs = `
  #graphql
  enum Order {
    ASC
    DESC
  }

  enum Sort {
    road_id
    timestamp
    avg_speed
    num_vehicles
  }

  enum Region {
    Anderlecht
    Belgium
    Bruxelles
  }

  type RoadSumVehiclesAggregation {
    road_id: Int!
    sum_vehicles: Int!
  }

  type RoadAvgSpeedAggregation {
    road_id: Int!
    avg_speed: Float!
  }

  input ObservationsWhere {
    region: Region!
    granularity: Int!
    startTime: Int
    endTime: Int
    roadIds: [Int]
    days: [Int]
  }

  input RoadGeometriesWhere {
    region: String!
    roadIds: [Int]
  }

  input RoadsCountWhere {
    region: Region!
  }

  input AggregationObservationsOptions {
    limit: Int
    order: Order
  }

  input ObservationsOptions {
    limit: Int
    sort: Sort
    order: Order
  }

  type Observation {
    road_id: Int!
    timestamp: Int!
    avg_speed: Float!
    num_vehicles: Int!
  }

  type Query {
    observations(where: ObservationsWhere, options: ObservationsOptions): [Observation!]
    
    vehicleCountForEachRoad(
      where: ObservationsWhere
      options: AggregationObservationsOptions
    ): [RoadSumVehiclesAggregation]!

    averageSpeedForEachRoad(
      where: ObservationsWhere
      options: AggregationObservationsOptions
    ): [RoadAvgSpeedAggregation]!

  }
`;

export { observationTypedefs };
