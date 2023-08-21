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
import { REACT_APP_EXPRESS_API_PREFIX, REACT_APP_EXPRESS_BASE_URL } from "./properties";

export default function App() {
  const [roads, setRoads] = useState([]);

  const [observations, setObservations] = useState([]);

  const [roadsToShow, setRoadsToShow] = useState([]);

  const [query, setQuery] = useState("");

  const [region, setRegion] = useState("");

  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  const [roadsColor, setRoadsColor] = useState("red");

  const [limit, setLimit] = useState(10);

  const [granularity, setGranularity] = useState(15);

  const [roadCount, setRoadCount] = useState(0);

  const [roadIds, setRoadIds] = useState([]);

  const [loading, setLoading] = useState(false);

  const [beginTimestamp, setBeginTimestamp] = useState(
    Math.floor(Date.UTC(2019, 0, 1, 0, 0, 0) / 1000)
  );

  const [endTimestamp, setEndTimestamp] = useState(
    Math.floor(Date.UTC(2021, 9, 10, 23, 59, 0) / 1000)
  );
  function generateRequestUrl(query) {
    const baseRequest = `${REACT_APP_EXPRESS_BASE_URL}${REACT_APP_EXPRESS_API_PREFIX}`;
    const observationEndpoint = "/roads/observations";
    const commonParams = `granularity=${granularity}&region=${region}&polygons=`;

    console.log(baseRequest)

    if (query === "roads") {
      return `${baseRequest}/roads?region=${region}${getRoadIdsQuery()}&count=false`;
    } else if (query.includes("histogram") || query.includes("timeseries")) {
      return `${baseRequest}${observationEndpoint}?${commonParams}false${getTimestampQuery()}${getDaysQuery()}&limit=${limit}${getRoadIdsQuery()}`;
    } else if (query.includes("crowded") || query.includes("speed")) {
      const typeQuery =
        query.includes("crowded") || query.includes("speed")
          ? `&type=${query}`
          : "";
      return `${baseRequest}${observationEndpoint}?${commonParams}true${typeQuery}${getTimestampQuery()}${getDaysQuery()}&limit=${limit}${getRoadIdsQuery()}`;
    }
  }

  function getRoadIdsQuery() {
    return roadIds && roadIds.length > 0
      ? `&roadIds=[${roadIds.map((road) => road.road_id)}]`
      : "";
  }

  function getTimestampQuery() {
    return `&tbegin=${beginTimestamp}&tend=${endTimestamp}`;
  }

  function getDaysQuery() {
    return days.length > 0 ? `&days=[${days}]` : "";
  }

  function handleClick() {
    if(query.length===0){
      alert("A query has to be specified!")
      setLoading(false);
      return;
    }
    if(region.length===0){
      alert("A region has to be specified!")
      setLoading(false);
      return;
    }
    const request = generateRequestUrl(query);
    setLoading(true);
    console.log(request);
    axios
      .get(request)
      .then((response) => {
        console.log(response);
        if (query.includes("roads")) {
          setRoadsToShow(response.data.map((road) => road.polygon));
        } else if (
          query.includes("histogram") ||
          query.includes("timeseries")
        ) {
          setObservations(response.data);
        } else if (query.includes("crowded") || query.includes("speed")) {
          console.log(response.data);
          setRoads(response.data.roads);
          setObservations(response.data.observations);
          setRoadsToShow(response.data.roads.map((road) => road.polygon));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }


  function handleChooseRoads(roadIds, reset) {
    if (!reset) {
      const newRoadsToshow = roads
        .filter((road) => roadIds.includes(road.road_id))
        .map((road) => road.polygon);
      setRoadsToShow(newRoadsToshow);
      setRoadsColor("purple");
      return;
    }
    const oldRoadPolygons = roads.map((road) => road.polygon);
    setRoadsToShow(oldRoadPolygons);
    setRoadsColor("red");
  }

  function handleChooseQuery(query) {
    setQuery(query);
    setObservations([]);
    setRoadsColor("red");
    setRoadsToShow([]);
    setRoads([]);
  }

  return (

    <div id="leaflet-map-query-container">
      <div id="map-query-filter">
        <QuerySelector chooseQuery={handleChooseQuery} />
        <RegionSelector
          chooseRegion={setRegion}
          chooseRoadCount={setRoadCount}
        />
        {roadCount && roadCount > 0 ? (
          <RoadIdsSelector chooseRoadIds={setRoadIds} roadCount={roadCount} />
        ) : null}
        {query === "roads" ? null : <DaysSelector chooseDays={setDays} />}
        {query === "roads" ? null : (
          <IntervalDateTimePicker
            chooseBeginTimestamp={setBeginTimestamp}
            chooseEndTimestamp={setEndTimestamp}
          />
        )}
        {query.includes("histogram") ||
        query.includes("timeseries") ||
        query.includes("timeseries") ? (
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
      {!loading && roadsToShow && roadsToShow.length > 0 ? (
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
      !query.includes("histogram") &&
      !query.includes("timeseries") ? (
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
      query.includes("timeseries") ? (
        <ObservationsTimeseries
          observations={observations
            .map((o) => {
              return {
                num_vehicles: o.num_vehicles,
                avg_speed: o.avg_speed,
                timestamp: o.timestamp * 1000,
              };
            })
            .sort((a, b) => a.timestamp - b.timestamp)}
          fieldY={query.includes("speeds") ? "avg_speed" : "num_vehicles"}
          fieldX="timestamp"
          title={query.includes("speed") ? "Average speeds" : "Vehicles count"}
        />
      ) : null}
    </div>
  );
}
