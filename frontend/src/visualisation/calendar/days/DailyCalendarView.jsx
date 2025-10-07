import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { IAB_CATEGORIES } from "../../../assets/constants/iabCategories";
import Tooltip from "./components/Tooltip";
import XAxis from "./components/XAxis";
import YAxis from "./components/YAxis";
import Datapoint from "./components/Datapoint";
import { useCategoryFilter } from "../../../CategoryFilterContext";

const DailyCalendarView = ({ entries, startDate, numDays }) => {
  const dateBarHeight = 42;
  const margin = { top: 30, right: 20, bottom: 0, left: 50 };
  const svgRef = useRef();
  const containerRef = useRef();
  const radius = 5;

  const { state } = useCategoryFilter();

  const visibleData = useMemo(
    () =>
      entries.filter(
        (d) => !new Set(state.excludedCategoryIds).has(d.category?.id)
      ),
    [entries, state.excludedCategoryIds]
  );

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height: height - dateBarHeight });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const endDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (numDays || 1) - 1);
    return d;
  }, [startDate, numDays]);

  // NEW: helper to compare calendar dates
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const { xScale, yScale } = useMemo(
    () => ({
      xScale: d3
        .scaleTime()
        .domain([
          new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          ),
          new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate() + 1
          ),
        ])
        .range([margin.left, dimensions.width - margin.right]),

      yScale: d3
        .scaleTime()
        .domain([new Date(1970, 0, 1, 0, 0), new Date(1970, 0, 1, 23, 59)])
        .range([margin.top + 30, dimensions.height - margin.bottom - 20]),
    }),
    [startDate, endDate, dimensions, margin]
  );

  useEffect(() => {
    if (!startDate || !endDate || dimensions.width === 0) return;

    const filtered = visibleData.filter((d) => {
      const date = new Date(d.timestamp);
      const localEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
        999
      );
      return date >= startDate && date <= localEnd;
    });

    const parsed = filtered.map((d) => {
      const ts = new Date(d.timestamp);
      const fullDate = new Date(
        ts.getFullYear(),
        ts.getMonth(),
        ts.getDate(),
        ts.getHours(),
        ts.getMinutes(),
        ts.getSeconds()
      );
      const timeOnly = new Date(fullDate);
      timeOnly.setFullYear(1970, 0, 1);
      return { ...d, fullDate, timeOnly };
    });

    const clusterHeight = radius * 2.5;
    const maxPerCluster =
      (dimensions.width - margin.left - margin.right) / radius / 21;
    const horizontalSpacing = radius * 2.5;

    parsed.forEach((d) => {
      d.rawY = yScale(d.timeOnly);
      d.clusterY = Math.floor(d.rawY / clusterHeight) * clusterHeight;
    });

    const clustered = [];
    const pointsByClusterY = d3.group(parsed, (d) => d.clusterY);

    pointsByClusterY.forEach((pointsAtY) => {
      const pointsByDay = d3.group(pointsAtY, (d) => {
        const f = d.fullDate;
        return new Date(
          f.getFullYear(),
          f.getMonth(),
          f.getDate(),
          12
        ).getTime();
      });

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
  }, [visibleData, startDate, endDate, dimensions, xScale, yScale, margin]);

  const hoverTimeoutRef = useRef(null);
  const getAnchorScreenPoint = (pt) => {
    if (!pt || !svgRef.current) return { x: 0, y: 0 };
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: r.left + window.scrollX + pt.clusteredX,
      y: r.top + window.scrollY + pt.clusteredY,
    };
  };

  const handleSelection = (point) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (point) {
      setSelectedPoint(point);
    } else {
      hoverTimeoutRef.current = setTimeout(() => setSelectedPoint(null), 100);
    }
  };

  const handleUpdatePointCategory = (point, newCategoryId) => {
    const newCategory = IAB_CATEGORIES.find((c) => c.id === newCategoryId);
    if (!newCategory || !point?.id) return;
    const updatedPoint = { ...point, category: newCategory };
    setSelectedPoint(updatedPoint);
    setClusteredData((prev) =>
      prev.map((p) => (p.id === point.id ? updatedPoint : p))
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex-grow relative"
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
        >
          <XAxis
            scale={xScale}
            height={dimensions.height}
            width={dimensions.width}
            margin={margin}
          />
          <YAxis scale={yScale} margin={margin} />

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
            {d3.timeDay
              .every(1)
              .range(startDate, endDate)
              .map((date, i) => {
                const xPos =
                  ((i + 1) * (dimensions.width - margin.left - margin.right)) /
                    numDays +
                  margin.left;
                return (
                  <line
                    key={i}
                    x1={xPos}
                    y1={margin.top}
                    x2={xPos}
                    y2={dimensions.height - margin.bottom - 20}
                    stroke="#98a34d"
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
        </svg>
      )}

      {selectedPoint && (
        <Tooltip
          point={selectedPoint}
          radius={radius}
          position={{
            x: selectedPoint.clusteredX,
            y: selectedPoint.clusteredY,
            isBeforeNoon: selectedPoint.fullDate.getHours() < 12,
            // NEW: inform Tooltip whether this is first/last day
            isFirstDay: isSameDay(selectedPoint.fullDate, startDate),
            isLastDay: isSameDay(selectedPoint.fullDate, endDate),
          }}
          screen={getAnchorScreenPoint(selectedPoint)}
          onClose={() => handleSelection(null)}
          onCategoryChange={handleUpdatePointCategory}
        />
      )}

      <div
        className="flex justify-center py-2 bg-black bg-opacity-80"
        style={{ height: dateBarHeight }}
      >
        <h3
          className="text-md text-white font-semibold text-center cursor-pointer"
          style={{ fontFamily: "Noto Sans JP" }}
        >
          {"Selected Period: "}
          {startDate
            ? `${d3.timeFormat("%b %d, %Y")(startDate)}${
                numDays > 1 ? ` - ${d3.timeFormat("%b %d, %Y")(endDate)}` : ""
              }`
            : "Select Date"}
        </h3>
      </div>
    </div>
  );
};

export default DailyCalendarView;
