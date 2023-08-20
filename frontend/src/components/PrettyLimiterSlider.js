import * as React from "react";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const StyledSlider = styled(Slider)({
  color: "#73AD21",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#73AD21",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});



export default function PrettyLimiterSlider({sx, label, min, max, value, chooseLimit}) {
  const handleChange = (event) => {
    const limit = event.target.value
    if( chooseLimit ) chooseLimit(limit)
  };

  return (
      <div className="map-query-filter-div">
        <Typography>{label}</Typography>
        <StyledSlider
          value={value}
          valueLabelDisplay="auto"
          min={min}
          max={max}
          onChange={handleChange}
        />
      </div>
  );
}
