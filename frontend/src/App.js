import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import PrettyLimiterSlider from "./components/PrettyLimiterSlider";
import IntervalDateTimePicker from "./components/IntervalDateTimePicker";
import QuerySelector from "./components/QuerySelector";
import ResultTable from "./components/ResultTable";
import React, { useState } from "react";
import axios from "axios";
import DaysSelector from "./components/DaysSelector";
import RegionSelector from "./components/RegionSelector";
import QueryButton from "./components/QueryButton";
import RoadIdsSelector from "./components/RoadIdsSelector";
import GranularitySelector from "./components/GranularitySelector";
import { Histogram } from "./components/Histogram";
import ObservationsTimeseries from "./components/ObservationTimeseries";
import { useEffect } from "react";
import {
  REACT_APP_EXPRESS_BASE_PREFIX,
  REACT_APP_EXPRESS_API_ROADS_ENDPOINT,
} from "./properties";
import { useLazyQuery } from "@apollo/client";
import {
  GET_SUM_VEHICLES_FOR_EACH_ROAD_QUERY,
  GET_AVG_SPEED_FOR_EACH_ROAD_QUERY,
  GET_NUM_VEHICLES_TIMESERIES_QUERY,
  GET_AVG_SPEED_TIMESERIES_QUERY,
  GET_NUM_VEHICLES_QUERY,
  GET_AVG_SPEED_QUERY,
} from "./graphqlQueries";

export default function App() {
  const [roads, setRoads] = useState([]);

  const [observations, setObservations] = useState([]);

  const [roadsToShow, setRoadsToShow] = useState([]);

  const [query, setQuery] = useState("");

  const [region, setRegion] = useState("");

  const [days, setDays] = useState([]);

  const [roadsColor, setRoadsColor] = useState("red");

  const [limit, setLimit] = useState(10);

  const [granularity, setGranularity] = useState(30);

  const [roadCount, setRoadCount] = useState(0);

  const [roadIds, setRoadIds] = useState([]);

  const [loading, setLoading] = useState(false);

  const [beginTimestamp, setBeginTimestamp] = useState(
    Math.floor(Date.UTC(2019, 0, 1, 0, 0, 0) / 1000)
  );

  const [endTimestamp, setEndTimestamp] = useState(
    Math.floor(Date.UTC(2021, 9, 10, 23, 59, 0) / 1000)
  );

  // Apollo Graphql query hooks
  const [getSumVehiclesForEachRoad, getSumVehiclesForEachRoadResponse] =
    useLazyQuery(GET_SUM_VEHICLES_FOR_EACH_ROAD_QUERY);
  const [getAvgSpeedForEachRoad, getAvgSpeedForEachRoadResponse] = useLazyQuery(
    GET_AVG_SPEED_FOR_EACH_ROAD_QUERY
  );

  const [getNumVehiclesTimeseries, getNumVehiclesTimeseriesResponse] =
    useLazyQuery(GET_NUM_VEHICLES_TIMESERIES_QUERY);
  const [getAvgSpeedTimeseries, getAvgSpeedTimeseriesResponse] = useLazyQuery(
    GET_AVG_SPEED_TIMESERIES_QUERY
  );

  const [getNumVehicles, getNumVehiclesResponse] = useLazyQuery(
    GET_NUM_VEHICLES_QUERY
  );
  const [getAvgSpeed, getAvgSpeedResponse] = useLazyQuery(GET_AVG_SPEED_QUERY);

  function handleChooseRoadCount(region) {
    setLoading(true);
    axios
      .get(
        `${REACT_APP_EXPRESS_BASE_PREFIX}${REACT_APP_EXPRESS_API_ROADS_ENDPOINT}?region=${region}&count=true`
      )
      .then((response) => {
        setRoadCount(response.data[0].road_count);
      })
      .catch((error) => {
        alert(`Couldn't fetch ${region} road count`);
      });
    setLoading(false);
  }

  // use Effect hooks to manage apollo client errors and responses for each query
  useEffect(() => {
    if (getNumVehiclesTimeseriesResponse.data) {
      if (getNumVehiclesTimeseriesResponse.error) {
        alert("Couldn't get number of vehicles timeseries, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      setObservations(getNumVehiclesTimeseriesResponse.data.observations);
      setLoading(false);
    }
  }, [
    getNumVehiclesTimeseriesResponse.data,
    getNumVehiclesTimeseriesResponse.error,
  ]);

  useEffect(() => {
    if (getAvgSpeedTimeseriesResponse.data) {
      if (getAvgSpeedTimeseriesResponse.error) {
        alert("Couldn't get average speeds timeseries, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      setObservations(getAvgSpeedTimeseriesResponse.data.observations);
      setLoading(false);
    }
  }, [getAvgSpeedTimeseriesResponse.data, getAvgSpeedTimeseriesResponse.error]);

  useEffect(() => {
    if (getNumVehiclesResponse.data) {
      if (getNumVehiclesResponse.error) {
        alert("Couldn't get number of vehicles, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      setObservations(getNumVehiclesResponse.data.observations);
      setLoading(false);
    }
  }, [getNumVehiclesResponse.data, getNumVehiclesResponse.error]);

  useEffect(() => {
    if (getAvgSpeedResponse.data) {
      if (getAvgSpeedResponse.error) {
        alert("Couldn't get average speeds, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      setObservations(getAvgSpeedResponse.data.observations);
      setLoading(false);
    }
  }, [getAvgSpeedResponse.data, getAvgSpeedResponse.error]);

  useEffect(() => {
    if (getSumVehiclesForEachRoadResponse.data) {
      if (getSumVehiclesForEachRoadResponse.error) {
        alert("Couldn't get sum of vehicles for each road, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      const roadIds =
        getSumVehiclesForEachRoadResponse.data.vehicleCountForEachRoad.map(
          (item) => item.road_id
        );
      if (roadIds.length === 0) {
        alert("No observations over these roads yet!");
        setLoading(false);
        return;
      }
      setObservations(
        getSumVehiclesForEachRoadResponse.data.vehicleCountForEachRoad
      );
      setLoading(true);
      axios
        .get(
          `${REACT_APP_EXPRESS_BASE_PREFIX}${REACT_APP_EXPRESS_API_ROADS_ENDPOINT}?region=${region}${
            roadIds.length > 0 ? `&roadIds=[${roadIds}]` : ""
          }`
        )
        .then((response) => {
          setRoads(response.data);
          setRoadsToShow(response.data.map((road) => road.polygon));
          setLoading(false);
        })
        .catch((error) => {
          alert(`Couldn't fetch ${region} road geometries`);
          setObservations([]);
          setLoading(false);
        });
    }
  }, [
    getSumVehiclesForEachRoadResponse.data,
    getSumVehiclesForEachRoadResponse.error,
    region,
  ]);

  useEffect(() => {
    if (getAvgSpeedForEachRoadResponse.data) {
      if (getAvgSpeedForEachRoadResponse.error) {
        alert("Couldn't get average speeds for each road, try again");
        setLoading(false);
        setObservations([]);
        return;
      }
      const roadIds =
        getAvgSpeedForEachRoadResponse.data.averageSpeedForEachRoad.map(
          (item) => item.road_id
        );
      if (roadIds.length === 0) {
        alert("No observations over these roads yet!");
        setLoading(false);
        return;
      }
      setObservations(
        getAvgSpeedForEachRoadResponse.data.averageSpeedForEachRoad
      );
      setLoading(true);
      axios
        .get(
          `${REACT_APP_EXPRESS_BASE_PREFIX}${REACT_APP_EXPRESS_API_ROADS_ENDPOINT}?region=${region}${
            roadIds.length > 0 ? `&roadIds=[${roadIds}]` : ""
          }`
        )
        .then((response) => {
          setRoads(response.data);
          setRoadsToShow(response.data.map((road) => road.polygon));
          setLoading(false);
        })
        .catch((error) => {
          alert(`Couldn't fetch ${region} road geometries`);
          setObservations([]);
          setLoading(false);
        });
    }
  }, [
    getAvgSpeedForEachRoadResponse.data,
    getAvgSpeedForEachRoadResponse.error,
    region,
  ]);

  // Triggers axios request to fetch road geometries or graphql requests to fetch observations
  function handleClick() {
    reset();
    setLoading(true);
    if (query.length === 0) {
      alert("A query has to be specified!");
      setLoading(false);
      return;
    }
    if (region.length === 0) {
      alert("A region has to be specified!");
      setLoading(false);
      return;
    }
    if (query === "roads") {
      axios
        .get(
          `${REACT_APP_EXPRESS_BASE_PREFIX}${REACT_APP_EXPRESS_API_ROADS_ENDPOINT}?region=${region}${
            roadIds.length > 0
              ? `&roadIds=[${roadIds.map((road) => Number(road.road_id))}]`
              : ""
          }`
        )
        .then((response) => {
          setRoadsToShow(response.data.map((road) => road.polygon));
          setLoading(false);
        })
        .catch((error) => {
          alert(`Couldn't fetch ${region} road geometries`);
          setLoading(false);
        });
    } else if (query.includes("timeseries")) {
      if (query.includes("count")) {
        getNumVehiclesTimeseries({
          variables: {
            where: {
              region: region,
              startTime: beginTimestamp,
              roadIds:
                roadIds.length > 0 ? roadIds.map((road) => road.road_id) : null,
              granularity: granularity,
              endTime: endTimestamp,
              days: days.length > 0 ? days : null,
            },
            options: {
              limit: limit,
              sort: "timestamp",
              order: "ASC",
            },
          },
        });
      } else if (query.includes("speed")) {
        getAvgSpeedTimeseries({
          variables: {
            where: {
              region: region,
              startTime: beginTimestamp,
              roadIds:
                roadIds.length > 0 ? roadIds.map((road) => road.road_id) : null,
              granularity: granularity,
              endTime: endTimestamp,
              days: days.length > 0 ? days : null,
            },
            options: {
              limit: limit,
              sort: "timestamp",
              order: "ASC",
            },
          },
        });
      }
    } else if (query.includes("histogram")) {
      if (query.includes("count")) {
        getNumVehicles({
          variables: {
            where: {
              region: region,
              startTime: beginTimestamp,
              roadIds:
                roadIds.length > 0 ? roadIds.map((road) => road.road_id) : null,
              granularity: granularity,
              endTime: endTimestamp,
              days: days.length > 0 ? days : null,
            },
            options: {
              limit: limit,
            },
          },
        });
      } else if (query.includes("speed")) {
        getAvgSpeed({
          variables: {
            where: {
              region: region,
              startTime: beginTimestamp,
              roadIds:
                roadIds.length > 0 ? roadIds.map((road) => road.road_id) : null,
              granularity: granularity,
              endTime: endTimestamp,
              days: days.length > 0 ? days : null,
            },
            options: {
              limit: limit,
            },
          },
        });
      }
    } else if (query.includes("crowded")) {
      getSumVehiclesForEachRoad({
        variables: {
          where: {
            region: region,
            startTime: beginTimestamp,
            roadIds:
              roadIds.length > 0
                ? roadIds.map((road) => Number(road.road_id))
                : null,
            granularity: 30,
            endTime: endTimestamp,
            days: days.length > 0 ? days : null,
          },
          options: {
            limit: limit,
            order: query.includes("most") ? "DESC" : "ASC",
          },
        },
      });
    } else if (query.includes("speed")) {
      getAvgSpeedForEachRoad({
        variables: {
          where: {
            region: region,
            startTime: beginTimestamp,
            roadIds:
              roadIds.length > 0 ? roadIds.map((road) => road.road_id) : null,
            granularity: 30,
            endTime: endTimestamp,
            days: days.length > 0 ? days : null,
          },
          options: {
            limit: limit,
            order: query.includes("most") ? "DESC" : "ASC",
          },
        },
      });
    }
  }

  function handleChooseRoads(roadIds, reset) {
    if (!reset) {
      const newRoadsToshow = roads
        .filter((road) => roadIds.includes(road.road_id))
        .map((road) => road.polygon);
      setRoadsToShow(newRoadsToshow);
      setRoadsColor("#5D3FD3");
      return;
    }
    const oldRoadPolygons = roads.map((road) => road.polygon);
    setRoadsToShow(oldRoadPolygons);
    setRoadsColor("red");
  }

  function handleChooseQuery(query) {
    setQuery(query);
    reset();
  }

  function reset() {
    setRoadsColor("red");
    setRoadsToShow([]);
    setRoads([]);
    setObservations([]);
    setLoading(false);
  }

  return (
    <div id="leaflet-map-query-container">
      <div id="map-query-filter">
        <QuerySelector chooseQuery={handleChooseQuery} />
        <RegionSelector
          chooseRegion={setRegion}
          chooseRoadCount={handleChooseRoadCount}
        />
        {roadCount > 0 ? (
          <RoadIdsSelector chooseRoadIds={setRoadIds} roadCount={roadCount} />
        ) : null}
        {query === "roads" ? null : <DaysSelector chooseDays={setDays} />}
        {query === "roads" ? null : (
          <IntervalDateTimePicker
            chooseBeginTimestamp={setBeginTimestamp}
            chooseEndTimestamp={setEndTimestamp}
          />
        )}
        {query.includes("histogram") || query.includes("timeseries") ? (
          <GranularitySelector chooseGranularity={setGranularity} />
        ) : null}

        {query === "roads" ? null : (
          <PrettyLimiterSlider
            sx={{ width: "20vh" }}
            label={
              query.includes("histogram") || query.includes("timeseries")
                ? "Limit observations"
                : "Limit roads"
            }
            min={1}
            max={Number(roadCount)}
            defaultValue={10}
            chooseLimit={setLimit}
          />
        )}
        <QueryButton loading={loading} handleClick={handleClick} />
      </div>
      {roadsToShow.length > 0 ? (
        <MapContainer
          center={[50.83619, 4.31454]}
          zoom={12}
          scrollWheelZoom={false}
        >
          <Polygon
            pathOptions={{ color: roadsColor }}
            positions={roadsToShow}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      ) : null}
      {(query.includes("most") || query.includes("least")) &&
      observations.length > 0 ? (
        <ResultTable
          observations={observations}
          type={query}
          handleChooseRoads={handleChooseRoads}
        />
      ) : null}
      {!loading &&
      observations &&
      observations.length > 0 &&
      query !== "roads" &&
      query.includes("histogram") ? (
        <Histogram
          data={observations}
          xKey={query.includes("count") ? "num_vehicles" : "avg_speed"}
          xTitle={query.includes("count") ? "Vehicle count" : "Average speeds"}
        />
      ) : null}
      {!loading &&
      observations &&
      observations.length > 0 &&
      query !== "roads" &&
      query.includes("timeseries") ? (
        <ObservationsTimeseries
          observations={observations.map((obs) => ({
            ...obs,
            timestamp: obs.timestamp * 1000, // Histogram needs unix timestamp in nanoseconds
          }))}
          fieldY={query.includes("speeds") ? "avg_speed" : "num_vehicles"}
          fieldX="timestamp"
          title={query.includes("speed") ? "Average speeds" : "Vehicles count"}
        />
      ) : null}
    </div>
  );
}
