import React from 'react';
import { AgChartsReact } from 'ag-charts-react';

 function Histogram({data, xKey, xTitle}){

    const yTitle = "Observations count"

  const options = {
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
  },
    title: {
      text: xTitle+" over observations count",
    },
    data: data,
    series: [
      {
        type: 'histogram',
        xKey: xKey,
        xName: xTitle,
        binCount: 10,
        fill: "#CC6752",
        stroke: "red",
        showInLegend: true,
    
      },
    ],
    axes: [
      {
        type: 'number',
        position: 'bottom',
        title: { text: xTitle },
      },
      {
        type: 'number',
        position: 'left',
        title: { text: yTitle },
      },
    ],
    background: {
        fill: 'rgba(0, 0, 0, 0)', // Set background color to transparent black
      },

    
  };
  return <AgChartsReact options={options} />;
};

export { Histogram }