import React from "react";
import "../App.css";
import BeginButton from "./BeginButton";
import freightImage from "../freight.jpg"

export default function Welcome() {
  return (
    <div id="welcome">
      <h1>Freight Transport Data Analyzer</h1>
      <h2>NoSql Project 2023/2024</h2>
      <br />
      <h3>Professors: Francesco Cutugno, Vincenzo Norman Vitale</h3>
      <h3>Author: Fabio Cinicolo</h3>
      <img id="freight-image" alt="" src={freightImage}></img>
      <BeginButton/>
    </div>
  );
}
