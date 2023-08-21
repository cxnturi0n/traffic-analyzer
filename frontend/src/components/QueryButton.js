import * as React from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';

export default function QueryButton({loading, handleClick}) {
  return (
      <Box sx={{ '& > button': { m: 1 } }}>
        <LoadingButton
          sx={{
            fontSize: "15px", // Increase the font size
            padding: "15px 30px", // Adjust padding to make the button bigger
            backgroundColor: "#73AD21",
            ":hover": { backgroundColor: "#5D3FD3" }}}
          onClick={handleClick}
          endIcon={<SearchIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          color="primary"
        >
          <span>Query</span>
        </LoadingButton>
      </Box>
  );
}