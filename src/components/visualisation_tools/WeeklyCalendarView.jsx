import React, { useEffect, useRef, useState, useMemo } from "react";
import Tooltip from "./Tooltip";
import * as d3 from "d3";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import Datapoint from "./Datapoint";

const WeeklyCalendarView = ({ entries, startDate, endDate }) => {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
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
        width: window.innerWidth,
        height: (window.innerHeight - 80) * 0.85,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { xScale, yScale } = useMemo(() => {
    const paddingX = 12 * 60 * 60 * 1000;
    const paddingY = 30 * 60 * 1000;

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(startDate.getTime() - paddingX),
        new Date(endDate.getTime() + paddingX),
      ])
      .range([margin.left, dimensions.width - margin.right]);

    const yScale = d3
      .scaleTime()
      .domain([
        new Date(new Date(1970, 0, 1, 0, 0).getTime() - paddingY),
        new Date(new Date(1970, 0, 1, 23, 59).getTime() + paddingY),
      ])
      .range([margin.top, dimensions.height - margin.bottom]);

    return { xScale, yScale };
  }, [
    startDate,
    endDate,
    dimensions,
    margin.top,
    margin.bottom,
    margin.left,
    margin.right,
  ]);

  useEffect(() => {
    if (!startDate || !endDate || dimensions.width === 0) return;

    const width = dimensions.width;
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

    const clusterHeight = radius * 2.5;
    const maxPerCluster = (width - margin.left - margin.right) / radius / 21;
    const horizontalSpacing = radius * 2.5;

    console.log(maxPerCluster);
    parsed.forEach((d) => {
      d.rawY = yScale(d.timeOnly);
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
        const baseX = xScale(new Date(Number(dayTimestamp)));

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
  }, [
    entries,
    startDate,
    endDate,
    dimensions,
    xScale,
    yScale,
    margin.top,
    margin.bottom,
    margin.left,
    margin.right,
  ]);

  // Define margin here again for rendering

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


  const sameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isFirstDay =
    selectedPoint?.fullDate && sameDay(selectedPoint.fullDate, startDate);
  const isLastDay =
    selectedPoint?.fullDate && sameDay(selectedPoint.fullDate, endDate);

  return (
    <div
      className="relative w-full"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <XAxis
          scale={xScale}
          height={dimensions.height}
          width={dimensions.width}
          margin={margin}
        />
        <YAxis scale={yScale} margin={margin} />

        {/* Horizontal gridlines every 6 hours */}
        <g>
          {d3.timeHour
            .range(new Date(1970, 0, 1, 6, 0), new Date(1970, 0, 1, 24, 0), 6)
            .map((time, i) => {
              const yPos = yScale(time);
              return (
                <line
                  key={`six-hour-grid-${i}`}
                  x1={margin.left * 1.2}
                  y1={yPos}
                  x2={dimensions.width - margin.right}
                  y2={yPos}
                  opacity={0.5}
                  stroke="#9db"
                  strokeWidth={1}
                  strokeDasharray="4 4" // Makes the line dotted
                />
              );
            })}
        </g>

        {/* Vertical gridlines between days */}
        <g>
          {d3.timeDay.range(startDate, endDate, 1).map((date, i) => {
            const xPos =
              ((i + 1) * (dimensions.width - margin.left - margin.right)) / 7 +
              margin.left;
            return (
              <line
                key={`six-hour-grid-${i}`}
                x1={xPos}
                y1={margin.top}
                x2={xPos}
                y2={dimensions.height - margin.top}
                stroke="#cd5"
                strokeWidth={2}
              />
            );
          })}

          <line
            x1={dimensions.width - margin.right}
            y1={margin.top}
            x2={dimensions.width - margin.right}
            y2={dimensions.height - margin.top}
            stroke="#cd5"
            strokeWidth={2}
          />
        </g>
        {/* Data Points */}
        {clusteredData.map((d, i) => (
          <Datapoint
            key={i}
            point={d}
            obscure={selectedPoint?.query}
            radius={radius}
            selectedPoint={selectedPoint}
            onSelect={handleSelection}
          />
        ))}

        {selectedPoint && (
          <Tooltip
            point={selectedPoint}
            isTouch={isTouch}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            radius={radius}
            onClose={() => handleSelection(null)}
          />
        )}
      </svg>

      <h3
        className="text-md text-white font-semibold mx-5 mb-2 text-center"
        style={{ fontFamily: "Noto Sans JP" }}
      >
        Search Activity : {weekTitle}
      </h3>
    </div>
  );
};

export default WeeklyCalendarView;
