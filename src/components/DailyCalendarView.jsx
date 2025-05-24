import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DatapointMobile from "./DatapointMobile";

const DailyCalendarView = ({ entries, date }) => {
  const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"];

  const getColorFromFirstLetter = (str) => {
    if (!str || str.length === 0) return colors[0];
    const index = str[0].toUpperCase().charCodeAt(0) % colors.length;
    return colors[index];
  };

  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const radius = 7;

  useEffect(() => {
    const updateDimensions = () => {
      const usableHeight = window.innerHeight - 80;
      setDimensions({ width: window.innerWidth, height: usableHeight * 0.6 }); // 60% of usable height
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!date || dimensions.width === 0) return;

    const margin = { top: 20, bottom: 40 };
    const height = dimensions.height;
    const baseX = dimensions.width / 2;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filtered = entries.filter((d) => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= startOfDay && timestamp <= endOfDay;
    });

    const parsed = filtered.map((d) => {
      const fullDate = new Date(d.timestamp);
      const timeOnly = new Date(1970, 0, 1, fullDate.getHours(), fullDate.getMinutes(), fullDate.getSeconds());
      return { ...d, fullDate, timeOnly };
    });

    const y = d3.scaleTime()
      .domain([new Date(1970, 0, 1, 0, 0), new Date(1970, 0, 1, 23, 59)])
      .range([margin.top, height - margin.bottom]);

    const clusterHeight = radius * 3;
    const maxPerCluster = 6;
    const horizontalSpacing = radius * 3;

    parsed.forEach((d) => {
      d.rawY = y(d.timeOnly);
      d.clusterY = Math.floor(d.rawY / clusterHeight) * clusterHeight;
    });

    const grouped = d3.group(parsed, (d) => d.clusterY);
    const clustered = [];

    grouped.forEach((group) => {
      group.forEach((point, i) => {
        const clusterOffset = Math.floor(i / maxPerCluster);
        const newClusterY = point.clusterY + clusterOffset * clusterHeight;
        const colIndex = i % maxPerCluster;
        const offsetX = (colIndex - Math.floor(maxPerCluster / 2)) * horizontalSpacing;

        clustered.push({
          ...point,
          clusteredX: baseX + offsetX,
          clusteredY: newClusterY,
        });
      });
    });

    setClusteredData(clustered);
  }, [entries, date, dimensions]);

  const y = d3.scaleTime()
    .domain([new Date(1970, 0, 1, 0, 0), new Date(1970, 0, 1, 23, 59)])
    .range([20, dimensions.height - 40]);

  const sixHourIntervals = d3.timeHour.range(new Date(1970, 0, 1, 0), new Date(1970, 0, 2), 6);

  const handleSelect = (point) => {
    setSelectedPoint((prev) =>
      prev?.fullDate.getTime() === point?.fullDate.getTime() ? null : point
    );
  };

  return (
    <div className="relative w-full" style={{ height: `${dimensions.height}px` }}>
      <h3 className="text-sm font-semibold mb-2 text-center text-white">
        {d3.timeFormat("%A, %B %d, %Y")(date)}
      </h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <g>
          {sixHourIntervals.map((time, i) => {
            const yPos = y(time);
            return (
              <line
                key={`grid-${i}`}
                x1={0}
                y1={yPos}
                x2={dimensions.width}
                y2={yPos}
                stroke="#fff"
                strokeWidth={0.2}
              />
            );
          })}
        </g>

        <g transform="translate(40,0)">
          <g
            ref={(node) => {
              if (node) {
                d3.select(node)
                  .call(
                    d3.axisLeft(y).ticks(d3.timeHour.every(6)).tickFormat(d3.timeFormat("%H:%M"))
                  )
                  .selectAll("text")
                  .style("fill", "white")
                  .style("font-size", "12px");

                d3.select(node).selectAll("path,line").style("stroke", "white");
              }
            }}
          />
        </g>

        {clusteredData.map((d, i) => (
          <DatapointMobile
            key={i}
            x={d.clusteredX}
            y={d.clusteredY}
            query={d.query}
            color={getColorFromFirstLetter(d.query)}
            fullDate={d.fullDate}
            radius={radius}
            selectedQuery={selectedPoint?.query}
            selectedFullDate={selectedPoint?.fullDate}
            onSelect={handleSelect}
          />
        ))}
      </svg>
    </div>
  );
};

export default DailyCalendarView;
