import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_EXPRESS_API_PREFIX, REACT_APP_EXPRESS_BASE_URL } from "../properties";

export default function RegionSelector({ chooseRegion, chooseRoadCount }) {
  const [region, setRegion] = useState();

  const handleChange = (event) => {
    const region = event.target.value;
    chooseRegion(region);
    setRegion(region);
  };

  useEffect(() => {

    if (!region || region.length === 0)
      return;
    const request = `${REACT_APP_EXPRESS_BASE_URL}${REACT_APP_EXPRESS_API_PREFIX}/roads?region=${region}&count=true`;

    const axiosInstance = axios.create({
      withCredentials: true, // Include credentials in requests (required by gitpod)
    });

    axiosInstance
      .get(request)
      .then((response) => {
        chooseRoadCount(response.data[0].road_count);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [region, chooseRoadCount]);

  return (
    <div className="map-query-filter-div">
      <FormControl fullWidth>
        <InputLabel>Regions</InputLabel>
        <Select label="Regions" onChange={handleChange}>
          <MenuItem value="Anderlecht">Anderlecht</MenuItem>
          <MenuItem value="Bruxelles">Bruxelles</MenuItem>
          <MenuItem value="Belgium">Belgium</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
