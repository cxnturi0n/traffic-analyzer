import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "../App.css";
import utc from "dayjs/plugin/utc.js";
import React, { useState } from "react";

dayjs.extend(utc);

const minDateTime = dayjs.utc("2019-01-01T00:00:00Z");
const maxDateTime = dayjs.utc("2021-10-16T23:59:00Z");

export default function IntervalDateTimePicker({
  chooseBeginTimestamp,
  chooseEndTimestamp,
}) {
  const [beginTimestamp, setBeginTimestamp] = useState(minDateTime);

  const handleBeginTimestampChange = (beginTimestamp) => {
    const beginTimestampUTC = beginTimestamp.utc(); 
    console.log(Math.floor(beginTimestampUTC.$d.getTime() / 1000), beginTimestampUTC);
    setBeginTimestamp(beginTimestampUTC);
    chooseBeginTimestamp(Math.floor(beginTimestampUTC.$d.getTime() / 1000));
  };

  const handleEndTimestampChange = (endTimestamp) => {
    const endTimestampUTC = endTimestamp.utc(); 
    chooseEndTimestamp(Math.floor(endTimestampUTC.$d.getTime() / 1000));
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        className="map-query-filter-div"
        format={"YYYY-MM-DD HH:mm"}
        ampm={false}
        minDate={minDateTime}
        maxDate={maxDateTime}
        label="Begin timestamp"
        defaultValue={minDateTime}
        onChange={handleBeginTimestampChange}
      />
      <DateTimePicker
        className="map-query-filter-div"
        format={"YYYY-MM-DD HH:mm"}
        ampm={false}
        minDate={beginTimestamp}
        maxDate={maxDateTime}
        label="End timestamp"
        defaultValue={maxDateTime}
        onChange={handleEndTimestampChange}
      />
    </LocalizationProvider>
  );
}
