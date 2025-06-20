import React, { useEffect, useRef, useState, useMemo } from "react";
import { IAB_CATEGORIES } from "../../constants/iabCategories";
import Tooltip from "./Tooltip";
import * as d3 from "d3";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import Datapoint from "./Datapoint";
import { getDB, DB_CONSTANTS } from "../../utils/db";
import { useDataset } from "../../context/DataContext";

const WeeklyCalendarView = ({ entries, startDate, endDate }) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const radius = 5;

  const { dataset, setDataset } = useDataset();

  const handleUpdatePointCategory = async (point, newCategoryId) => {
    const newCategory = IAB_CATEGORIES.find(cat => cat.id === newCategoryId);
    if (!newCategory || !point?.id) return;

    const updatedPoint = { ...point, category: newCategory };

    // Update context
    const updatedRecords = dataset.records.map((p) =>
      p.id === point.id ? updatedPoint : p
    );
    setDataset({ ...dataset, records: updatedRecords });

    // Update IndexedDB
    const db = await getDB();
    if (dataset.source === "user") {
      const entry = await db.get(DB_CONSTANTS.STORE_NAME, point.id);
      if (entry) await db.put(DB_CONSTANTS.STORE_NAME, { ...entry, category: newCategory });
    } else if (dataset.source === "saved") {
      const allSaved = await db.getAll("savedDatasets");
      const current = allSaved.find((d) => d.name === dataset.label);
      if (current) {
        const updated = {
          ...current,
          records: updatedRecords,
          date: new Date().toISOString(),
        };
        await db.put("savedDatasets", updated);
      }
    }

    // Update UI
    setSelectedPoint(updatedPoint);
    setClusteredData((prev) =>
      prev.map((p) => (p.id === point.id ? updatedPoint : p))
    );
  };

  const weekTitle =
    startDate && endDate
      ? `${d3.timeFormat("%b %d, %Y")(startDate)} - ${d3.timeFormat("%b %d, %Y")(endDate)}`
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
  }, [margin.left, margin.right]);

  const { xScale, yScale } = useMemo(() => {
    const paddingX = 12 * 60 * 60 * 1000;
    const paddingY = 30 * 60 * 1000;
    return {
      xScale: d3
        .scaleTime()
        .domain([
          new Date(startDate.getTime() - paddingX),
          new Date(endDate.getTime() + paddingX),
        ])
        .range([margin.left, dimensions.width - margin.right]),
      yScale: d3
        .scaleTime()
        .domain([
          new Date(new Date(1970, 0, 1, 0, 0).getTime() - paddingY),
          new Date(new Date(1970, 0, 1, 23, 59).getTime() + paddingY),
        ])
        .range([margin.top, dimensions.height - margin.bottom]),
    };
  }, [startDate, endDate, dimensions, margin.left, margin.right, margin.top, margin.bottom]);

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
          const offsetX = (colIndex - Math.floor(maxPerCluster / 2)) * horizontalSpacing;

          clustered.push({
            ...point,
            clusteredX: baseX + offsetX,
            clusteredY: newClusterY,
          });
        });
      });
    });

    setClusteredData(clustered);
  }, [entries, startDate, endDate, dimensions, xScale, yScale, margin.left, margin.right]);

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
    <div className="relative w-full" style={{ width: dimensions.width, height: dimensions.height }}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <XAxis scale={xScale} height={dimensions.height} width={dimensions.width} margin={margin} />
        <YAxis scale={yScale} margin={margin} />

        {/* Grid lines */}
        <g>
          {d3.timeHour
            .range(new Date(1970, 0, 1, 6), new Date(1970, 0, 2, 0), 6)
            .map((time, i) => (
              <line
                key={i}
                x1={margin.left * 1.2}
                y1={yScale(time)}
                x2={dimensions.width - margin.right}
                y2={yScale(time)}
                opacity={0.5}
                stroke="#9db"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
        </g>

        <g>
          {d3.timeDay.range(startDate, endDate, 1).map((date, i) => {
            const xPos = ((i + 1) * (dimensions.width - margin.left - margin.right)) / 7 + margin.left;
            return (
              <line
                key={i}
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

        {selectedPoint && selectedPoint.clusteredX && selectedPoint.clusteredY && (
          <Tooltip
            point={selectedPoint}
            radius={radius}
            position={{
              x: selectedPoint.clusteredX,
              y: selectedPoint.clusteredY,
              isBeforeNoon: selectedPoint.fullDate.getHours() < 12,
            }}
            onClose={() => handleSelection(null)}
            onCategoryChange={handleUpdatePointCategory}
          />
        )}
      </svg>

      <h3 className="text-md text-white font-semibold mx-5 mb-2 text-center" style={{ fontFamily: "Noto Sans JP" }}>
        Search Activity : {weekTitle}
      </h3>
    </div>
  );
};

export default WeeklyCalendarView;
