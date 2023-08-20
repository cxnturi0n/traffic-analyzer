import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "../App.css";


export default function GranularitySelector({chooseGranularity}) {

  const handleChange = (event) => {
    const granularity = event.target.value
    chooseGranularity(granularity)
  };

  return (
    <div className ="map-query-filter-div">
        <FormControl fullWidth>
          <InputLabel>Granularities</InputLabel>
          <Select
            label="Granularities"
            onChange={handleChange}
          >
            <MenuItem value={5}>5 minutes</MenuItem>
            <MenuItem value={15}>15 minutes</MenuItem>
            <MenuItem value={30}>30 minutes</MenuItem>
            </Select>
        </FormControl>
    </div>
  );
}

