import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ListSubheader from "@mui/material/ListSubheader";
import "../App.css";

export default function QuerySelector({ chooseQuery }) {
  const handleChange = (event) => {
    const query = event.target.value;
    chooseQuery(query);
  };

  return (
    <div className="map-query-filter-div">
      <FormControl fullWidth>
        <InputLabel>Queries</InputLabel>
        <Select label="Queries" onChange={handleChange}>
          <ListSubheader>Spatial</ListSubheader>
          <MenuItem value="roads">Show roads</MenuItem>
          <MenuItem value="most-crowded">Most crowded roads</MenuItem>
          <MenuItem value="least-crowded">Least crowded roads</MenuItem>
          <MenuItem value="most-speed">Roads with higher speeds</MenuItem>
          <MenuItem value="least-speed">Roads with lower speeds</MenuItem>
          <ListSubheader>Histograms</ListSubheader>
          <MenuItem value="vehicle-count-histogram">Vehicle count</MenuItem>
          <MenuItem value="average-speeds-histogram">Average speeds</MenuItem>
          <ListSubheader>Timeseries</ListSubheader>
          <MenuItem value="vehicle-count-timeseries">Vehicle count</MenuItem>
          <MenuItem value="average-speeds-timeseries">
            Average speeds
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
