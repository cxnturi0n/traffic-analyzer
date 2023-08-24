import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { REACT_APP_UI_BASE_PREFIX } from "../properties";

export default function BeginButton() {
  const navigate = useNavigate();

  const navigateToTrafficAnalyzer = () => {
    navigate(`${REACT_APP_UI_BASE_PREFIX}/query`);
  };
  return (
    <Box sx={{ "& > button": { m: 1 } }}>
      <LoadingButton
        sx={{
          fontSize: "24px", // Increase the font size
          padding: "15px 30px", // Adjust padding to make the button bigger
          backgroundColor: "#73AD21",
          ":hover": { backgroundColor: "#5D3FD3" },
        }}
        onClick={navigateToTrafficAnalyzer}
        endIcon={<PlayArrowIcon />}
        loadingPosition="end"
        variant="contained"
        color="primary"
      >
        <span>Begin</span>
      </LoadingButton>
    </Box>
  );
}
