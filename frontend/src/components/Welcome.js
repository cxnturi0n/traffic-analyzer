import React from "react";
import "../App.css";
import BeginButton from "./BeginButton";
import freightImage from "../freight.jpg"

export default function Welcome() {
  return (
    <div id="welcome">
      <h1><span style={{ color: "#5D3FD3" }}>Freight Transport Data Analyzer</span></h1>
      <h2><span style={{ color: "#5D3FD3" }}>NoSQL Project</span> 2023/2024</h2>
      <br />
      <h3><span style={{ color: "#5D3FD3" }}>Professors:</span> Francesco Cutugno, Vincenzo Norman Vitale</h3>
      <h3><span style={{ color: "#5D3FD3" }}>Author:</span> Fabio Cinicolo</h3>
      <img id="freight-image" alt="" src={freightImage}></img>
      <BeginButton/>
    </div>
  );
}
