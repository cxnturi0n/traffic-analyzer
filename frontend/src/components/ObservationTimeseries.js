import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "../App.css";

const formatTime = (date) => {
  return Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};

export default function ObservationsTimeseries({
  observations,
  fieldX,
  fieldY,
  title,
}) {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "70%", height: "100%" }), []);
  const [rowData, setRowData] = useState(observations);
  const [columnDefs, setColumnDefs] = useState([
    { field: fieldX, chartDataType: "time" },
    { field: fieldY },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      resizable: true,
    };
  }, []);
  const popupParent = useMemo(() => {
    return document.body;
  }, []);
  const chartThemeOverrides = useMemo(() => {
    return {
      area: {
        title: {
          enabled: true,
          text: title,
        },
        navigator: {
          enabled: true,
          height: 20,
          margin: 25,
        },
        axes: {
          time: {
            label: {
              rotation: 300,
              format: "%Y-%m-%d",
            },
          },
          number: {
            label: {
              formatter: (params) => {
                return params.value;
              },
            },
          },
        },
        series: {
          tooltip: {
            renderer: ({ xValue, yValue }) => {
              xValue = xValue instanceof Date ? xValue : new Date(xValue);
              return {
                content: `${formatTime(xValue)}, ${fieldY}: ${yValue}`,
              };
            },
            
          },
        },
        background: {
          fill: "rgba(0, 0, 0, 0)", // Set background color to transparent black
        },
      },
    };
  }, [fieldY, title]);
  const getChartToolbarItems = useCallback(() => {
    return [""];
  }, []);

  const chartToolPanelsDef = useMemo(() => {
    return {
      panels: [""],
    };
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    const createRangeChartParams = {
      chartContainer: document.querySelector("#myChart"),
      suppressChartRanges: true,
      cellRange: {
        columns: [fieldX, fieldY],
      },
      chartType: "area",
    };
    gridRef.current.api.createRangeChart(createRangeChartParams);
  }, [fieldX, fieldY]);

  return (
    <div style={containerStyle}>
      <div className="wrapper">
        <div>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            popupParent={popupParent}
            enableRangeSelection={true}
            enableCharts={true}
            chartThemeOverrides={chartThemeOverrides}
            chartToolPanelsDef={chartToolPanelsDef}
            getChartToolbarItems={getChartToolbarItems}
            onFirstDataRendered={onFirstDataRendered}
          />
        </div>
        <div id="myChart" className="ag-theme-alpine my-chart"></div>
      </div>
    </div>
  );
}
