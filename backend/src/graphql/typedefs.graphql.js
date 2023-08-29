const observationTypedefs = `#graphql

enum Order {
  ASC
  DESC
}

enum Region{
  Anderlecht
  Belgium
  Bruxelles
}

  type Observation { 
    road_id: Int!
    timestamp: Int!
    avg_speed: Float!
    num_vehicles: Int!
  }

  type ObservationAnderlecht_5min {
    road_id: Int!
    timestamp: Int!
    avg_speed: Float!
    num_vehicles: Int!
  }

  type ObservationAnderlecht_15min {
    road_id: Int!
    timestamp: Int!
    avg_speed: Float!
    num_vehicles: Int!
  }

  type ObservationAnderlecht_30min { 
    road_id: Int!
    timestamp: Int!
    avg_speed: Float!
    num_vehicles: Int!
  }

  type RoadNumVehiclesAggregation {
    road_id: Int!
    sum_vehicles: Int!
  }

  type RoadAvgSpeedsAggregation {
    road_id: Int!
    avg_speed: Float!
  }

  input AggregationObservationsWhere {
    region: Region!
    granularity: Int!
    startTime: Int
    endTime: Int
    roadIds: [Int]
    days: [Int]
  }

  input RoadGeometriesWhere{
    region: String!
    roadIds: [Int]
  }

  input RoadsCountWhere{
    region: Region!
  }

  input AggregationObservationsOptions{
    limit: Int
    order: Order
  }

  type Query {
    aggregateRoadNumVehicles(
      where: AggregationObservationsWhere,
      options: AggregationObservationsOptions
    ): [RoadNumVehiclesAggregation]!

    aggregateRoadAvgSpeeds(
      where: AggregationObservationsWhere,
      options: AggregationObservationsOptions
    ): [RoadAvgSpeedsAggregation]!

    roadGeometries(where: RoadGeometriesWhere): [Road!]!
    roadsCount(where: RoadsCountWhere): Int!
  }

  type Coordinate {
    latitude: Float!
    longitude: Float!
  }
  
  type LinearRing {
    coordinates: [Coordinate!]!
  }
  
  type Polygon {
    rings: [LinearRing!]!
  }
  
  type Road {
    road_id: Int!
    polygons: [Polygon]!
  }

`;

export { observationTypedefs };
