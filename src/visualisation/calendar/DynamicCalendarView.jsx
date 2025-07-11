import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";
import Tooltip from "./components/Tooltip";
import XAxis from "./components/XAxis";
import YAxis from "./components/YAxis";
import Datapoint from "./components/Datapoint";
import { getDB, DB_CONSTANTS } from "../../utils/db";
import { useDataset } from "../../DataContext";

const DynamicCalendarView = ({ entries, startDate, numDays }) => {
  const margin = { top: 20, right: 20, bottom: 10, left: 50 };
  const svgRef = useRef();
  const containerRef = useRef();
  const radius = 5;
  const { dataset, setDataset } = useDataset();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const handleUpdatePointCategory = async (point, newCategoryId) => {
    const newCategory = IAB_CATEGORIES.find(c => c.id === newCategoryId);
    if (!newCategory || !point?.id) return;

    const updatedPoint = { ...point, category: newCategory };
    const updatedRecords = dataset.records.map(p =>
      p.id === point.id ? updatedPoint : p
    );
    setDataset({ ...dataset, records: updatedRecords });

    const db = await getDB();
    if (dataset.source === "user") {
      const entry = await db.get(DB_CONSTANTS.STORE_NAME, point.id);
      if (entry) await db.put(DB_CONSTANTS.STORE_NAME, { ...entry, category: newCategory });
    } else if (dataset.source === "saved") {
      const allSaved = await db.getAll("savedDatasets");
      const current = allSaved.find(d => d.name === dataset.label);
      if (current) {
        await db.put("savedDatasets", {
          ...current,
          records: updatedRecords,
          date: new Date().toISOString()
        });
      }
    }

    setSelectedPoint(updatedPoint);
    setClusteredData(prev =>
      prev.map(p => (p.id === point.id ? updatedPoint : p))
    );
  };

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const endDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (numDays || 1) - 1);
    return d;
  }, [startDate, numDays]);

  const { xScale, yScale } = useMemo(() => {
    const paddingX = 12 * 60 * 60 * 1000;
    return {
      xScale: d3.scaleTime()
        .domain([new Date(startDate?.getTime() - paddingX), new Date(endDate?.getTime() + paddingX)])
        .range([margin.left, dimensions.width - margin.right]),
      yScale: d3.scaleTime()
        .domain([
          new Date(1970, 0, 1, 0, 0),
          new Date(1970, 0, 1, 23, 59)
        ])
        .range([margin.top + 35, dimensions.height - margin.bottom])
    };
  }, [startDate, endDate, dimensions, margin.bottom, margin.left, margin.right, margin.top]);

  useEffect(() => {
    if (!startDate || !endDate || dimensions.width === 0) return;

    const filtered = entries.filter(d => {
      const date = new Date(d.timestamp);
      return date >= startDate && date <= new Date(endDate).setHours(23, 59, 59, 999);
    });

    const parsed = filtered.map(d => {
      const fullDate = new Date(d.timestamp);
      const timeOnly = new Date(fullDate);
      timeOnly.setFullYear(1970, 0, 1);
      return { ...d, fullDate, timeOnly };
    });

    const clusterHeight = radius * 2.5;
    const maxPerCluster = (dimensions.width - margin.left - margin.right) / radius / 21;
    const horizontalSpacing = radius * 2.5;

    parsed.forEach(d => {
      d.rawY = yScale(d.timeOnly);
      d.clusterY = Math.floor(d.rawY / clusterHeight) * clusterHeight;
    });

    const pointsByClusterY = d3.group(parsed, d => d.clusterY);
    const clustered = [];

    pointsByClusterY.forEach(pointsAtY => {
      const pointsByDay = d3.group(pointsAtY, d =>
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
            clusteredY: newClusterY
          });
        });
      });
    });

    setClusteredData(clustered);
  }, [entries, startDate, endDate, dimensions, xScale, yScale, margin.bottom, margin.left, margin.right, margin.top]);

  const hoverTimeoutRef = useRef(null);

  const handleSelection = (point) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (point) {
      setSelectedPoint(point);
    } else {
      hoverTimeoutRef.current = setTimeout(() => setSelectedPoint(null), 100);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
          <XAxis scale={xScale} height={dimensions.height} width={dimensions.width} margin={margin} />
          <YAxis scale={yScale} margin={margin} />

          {/* Horizontal grid lines */}
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

          {/* Vertical grid lines (per day) */}
          <g>
            {d3.timeDay.range(startDate, endDate, 1).map((date, i) => {
              const xPos = ((i + 1) * (dimensions.width - margin.left - margin.right)) / numDays + margin.left;
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

          {selectedPoint && (
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
      )}
    </div>
  );
};

export default DynamicCalendarView;
