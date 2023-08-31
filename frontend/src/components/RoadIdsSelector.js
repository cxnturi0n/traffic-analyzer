import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { createFilterOptions } from '@mui/material/Autocomplete';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export default function RoadIdsSelector({chooseRoadIds, roadCount}) {

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 100,
  });

  const roadIds = React.useMemo(
    () => { 
      return Array.from({ length: roadCount }, (_, index) => ({
        road_id: (index + 1).toString(), // Convert to string for getOptionLabel
      }))},
    [roadCount]
  );
  
  const handleChange = (event, value) => {
    chooseRoadIds(value)
};

  return (
    <div className="map-query-filter-div">
    <Autocomplete
    fullWidth
      multiple
      id="checkboxes-tags-demo"
      options={roadIds}
      disableCloseOnSelect
      onChange={handleChange}
      getOptionLabel={(option) => option.road_id}
      filterOptions={filterOptions}
      isOptionEqualToValue={(option, value) => option.road_id === value.road_id}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.road_id}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Road Ids " placeholder={"Search for ids>100 [1,"+roadCount+"]"} />
      )}
    />
    </div>
  );
}

