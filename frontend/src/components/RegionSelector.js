import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "../App.css";
import { useState, useEffect } from "react";
import { useLazyQuery } from '@apollo/client';
import { REACT_APP_EXPRESS_API_PREFIX, REACT_APP_EXPRESS_BASE_URL } from "../properties";
import { roadsQuery, roadsCountQuery } from "../graphqlQueries";

export default function RegionSelector({ chooseRegion, chooseRoadCount }) {

  const [region, setRegion] = useState();


  const handleChange = (event) => {
    const region = event.target.value;
    chooseRegion(region);
    setRegion(region);
    chooseRoadCount(region)
  };

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
