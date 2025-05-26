import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Datapoint from "./Datapoint";

const WeeklyCalendarView = ({ entries, startDate, endDate }) => {
  const colors = [
    "#e41a1c",
    "#377eb8",
    "#4daf4a",
    "#984ea3",
    "#ff7f00",
    "#ffff33",
    "#a65628",
    "#f781bf",
  ];


  function getColorFromFirstLetter(str) {
    if (!str || str.length === 0) return colors[0]; // default fallback
    const firstChar = str[0].toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    const index = charCode % colors.length;
    return colors[index];
  }

  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const radius = 5;

  const weekTitle =
    startDate && endDate
      ? `${d3.timeFormat("%b %d, %Y")(startDate)} - ${d3.timeFormat(
          "%b %d, %Y"
        )(endDate)}`
      : "Loading...";

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.99,
        height: (window.innerHeight - 80) * 0.8,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!startDate || !endDate || dimensions.width === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = dimensions.width;
    const height = dimensions.height;
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const filtered = entries.filter((d) => {
      const date = new Date(d.timestamp);
      return date >= startDate && date <= adjustedEndDate;
    });

    const parsed = filtered.map((d) => {
      const fullDate = new Date(d.timestamp);
      const timeOnly = new Date(fullDate);
      timeOnly.setFullYear(1970, 0, 1);
      return { ...d, fullDate, timeOnly };
    });

    const paddingX = 12 * 60 * 60 * 1000; // 12 hours
    const paddingY = 30 * 60 * 1000; // 30 minutes

    const x = d3
      .scaleTime()
      .domain([
        new Date(startDate.getTime() - paddingX),
        new Date(endDate.getTime() + paddingX),
      ])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleTime()
      .domain([
        new Date(new Date(1970, 0, 1, 0, 0).getTime() - paddingY),
        new Date(new Date(1970, 0, 1, 23, 59).getTime() + paddingY),
      ])
      .range([margin.top, height - margin.bottom]);

    const clusterHeight = radius * 2.5;
    const maxPerCluster = 9;
    const horizontalSpacing = radius * 2.5;

    parsed.forEach((d) => {
      d.rawY = y(d.timeOnly);
    });

    parsed.forEach((d) => {
      d.clusterY = Math.floor(d.rawY / clusterHeight) * clusterHeight;
    });

    const pointsByClusterY = d3.group(parsed, (d) => d.clusterY);

    const clustered = [];

    pointsByClusterY.forEach((pointsAtY) => {
      const pointsByDay = d3.group(pointsAtY, (d) =>
        d3.timeDay.floor(d.fullDate).getTime()
      );

      pointsByDay.forEach((points, dayTimestamp) => {
        const baseX = x(new Date(Number(dayTimestamp)));

        points.forEach((point, i) => {
          const clusterOffset = Math.floor(i / maxPerCluster);
          const newClusterY = point.clusterY + clusterOffset * clusterHeight;
          const colIndex = i % maxPerCluster;
          const offsetX =
            (colIndex - Math.floor(maxPerCluster / 2)) * horizontalSpacing;

          clustered.push({
            ...point,
            clusteredX: baseX + offsetX,
            clusteredY: newClusterY,
          });
        });
      });
    });

    setClusteredData(clustered);
  }, [entries, startDate, endDate, dimensions]);

  // Define margin here again for rendering
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };

  // Define scales again for rendering gridlines and axes
  const x = d3
    .scaleTime()
    .domain([
      new Date(startDate.getTime() - 12 * 60 * 60 * 1000),
      new Date(endDate.getTime() + 12 * 60 * 60 * 1000),
    ])
    .range([margin.left, dimensions.width - margin.right]);

  const y = d3
    .scaleTime()
    .domain([
      new Date(new Date(1970, 0, 1, 0, 0).getTime() - 30 * 60 * 1000),
      new Date(new Date(1970, 0, 1, 23, 59).getTime() + 30 * 60 * 1000),
    ])
    .range([margin.top, dimensions.height - margin.bottom]);

  // Vertical gridlines for days
  const days = d3.timeDay.range(startDate, new Date(endDate.getTime() + 24 * 60 * 60 * 1000));

  // Horizontal gridlines every 6 hours
  const sixHourIntervals = d3.timeHour.range(
    new Date(1970, 0, 1, 0, 0),
    new Date(1970, 0, 1, 24, 0),
    6
  );

  const hoverTimeoutRef = useRef(null);

  const handleSelection = (point) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (point) {
      setSelectedPoint(point);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setSelectedPoint(null);
      }, 100);
    }
  };

  return (
    <div
      className="relative"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <h3 className="text-md text-white font-semibold mx-5 mb-2">
        Search Activity : {weekTitle}
      </h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        {/* Vertical gridlines for days */}
        <g>
          {days.map((day, i) => {
            const xPos = x(day);
            return (
              <line
                key={`day-grid-${i}`}
                x1={xPos}
                y1={margin.top}
                x2={xPos}
                y2={dimensions.height - margin.bottom}
                stroke="#131818"
                strokeWidth={1}
              />
            );
          })}
        </g>

        {/* Horizontal gridlines every 6 hours */}
<g>
  {sixHourIntervals.map((time, i) => {
    const yPos = y(time);
    return (
      <line
        key={`six-hour-grid-${i}`}
        x1={margin.left}
        y1={yPos}
        x2={dimensions.width - margin.right}
        y2={yPos}
        stroke="#9db"
        strokeWidth={0.3}
        strokeDasharray="4 4" // Makes the line dotted
      />
    );
  })}
</g>


        {/* X Axis */}
        <g transform={`translate(0,${dimensions.height - margin.bottom})`}>
          <g
            ref={(node) => {
              if (node) {
                d3.select(node).call(
                  d3
                    .axisBottom(x)
                    .ticks(d3.timeDay.every(1))
                    .tickFormat(d3.timeFormat("%b %d, %Y"))
                ).selectAll("text")
          .style("font-size", "13px").style("color", "white");
      
        d3.select(node)
          .selectAll("path, line") // Axis line and ticks
          .style("stroke", "#131818");
              }
            }}

          />
        </g>

        {/* Y Axis */}
        <g transform={`translate(${margin.left},0)`}>
          <g
            ref={(node) => {
              if (node) {
                d3.select(node).call(
                  d3
                    .axisLeft(y)
                    .ticks(d3.timeHour.every(6))
                    .tickFormat(d3.timeFormat("%H:%M"))
                ).selectAll("text")
          .style("font-size", "12px").style("color", "white");


        d3.select(node)
          .selectAll("path, line") // Axis line and ticks
          .style("stroke", "white");
              }
            }}
          />
        </g>

        {/* Data Points */}
        {clusteredData.map((d, i) => (
          <Datapoint
            key={i}
            x={d.clusteredX}
            y={d.clusteredY}
            query={d.query}
            obscure={selectedPoint?.query}
            color={getColorFromFirstLetter(d.query)}
            fullDate={d.fullDate}
            radius={radius}
            selectedQuery={selectedPoint?.query}
            selectedFullDate={selectedPoint?.fullDate}
            onSelect={handleSelection}
          />
        ))}
      </svg>
    </div>
  );
};

export default WeeklyCalendarView;
