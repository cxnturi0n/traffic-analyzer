import { gql } from "@apollo/client";

const GET_SUM_VEHICLES_FOR_EACH_ROAD_QUERY = gql`
  query GetSumVehiclesForEachRoad(
    $where: ObservationsWhere
    $options: AggregationObservationsOptions
  ) {
    vehicleCountForEachRoad(where: $where, options: $options) {
      sum_vehicles
      road_id
    }
  }
`;

const GET_AVG_SPEED_FOR_EACH_ROAD_QUERY = gql`
  query GetAvgSpeedForEachRoad(
    $where: ObservationsWhere
    $options: AggregationObservationsOptions
  ) {
    averageSpeedForEachRoad(where: $where, options: $options) {
      road_id
      avg_speed
    }
  }
`;

const GET_NUM_VEHICLES_TIMESERIES_QUERY = gql`
query Observations($where: ObservationsWhere, $options: ObservationsOptions) {
  observations(where: $where, options: $options) {
    num_vehicles
    timestamp
  }
}
`;

const GET_AVG_SPEED_TIMESERIES_QUERY = gql`
query Observations($where: ObservationsWhere, $options: ObservationsOptions) {
  observations(where: $where, options: $options) {
    avg_speed
    timestamp
  }
}
`;

const GET_NUM_VEHICLES_QUERY = gql`
query Observations($where: ObservationsWhere, $options: ObservationsOptions) {
  observations(where: $where, options: $options) {
    num_vehicles
  }
}
`;

const GET_AVG_SPEED_QUERY = gql`
query Observations($where: ObservationsWhere, $options: ObservationsOptions) {
  observations(where: $where, options: $options) {
    avg_speed
  }
}
`;

export {
  GET_SUM_VEHICLES_FOR_EACH_ROAD_QUERY,
  GET_AVG_SPEED_FOR_EACH_ROAD_QUERY,
  GET_NUM_VEHICLES_TIMESERIES_QUERY,
  GET_AVG_SPEED_TIMESERIES_QUERY,
  GET_NUM_VEHICLES_QUERY,
  GET_AVG_SPEED_QUERY
};
