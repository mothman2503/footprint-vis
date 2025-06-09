import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { getDB, DB_CONSTANTS } from "../utils/db";
import DatePicker from "./DatePicker";
import Tooltip from "./Tooltip";
import YAxis from "./YAxis";
import Datapoint from "./Datapoint";
import { BsChevronDown } from "react-icons/bs";

const DailyCalendarView = () => {
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

  const getColorFromFirstLetter = (str) => {
    if (!str || str.length === 0) return colors[0];
    const index = str[0].toUpperCase().charCodeAt(0) % colors.length;
    return colors[index];
  };

  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [entries, setEntries] = useState([]);

  const radius = 7;
  const margin = { top: 20, bottom: 100, left: 50, right: 10 };
  const labelMarginBottom = 20;

  const isBeforeNoon = selectedPoint?.fullDate.getHours() < 12;

  useEffect(() => {
    const loadData = async () => {
      const db = await getDB();
      const all = await db.getAll(DB_CONSTANTS.STORE_NAME);

      const sorted = all.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setEntries(sorted);
      if (sorted.length) {
        setCurrentDate(new Date(sorted[sorted.length - 1].timestamp));
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const usableHeight = window.outerHeight - 80;
      setDimensions({ width: window.innerWidth, height: usableHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { yScale } = useMemo(() => {
    const paddingY = 30 * 60 * 1000;

    const yScale = d3
      .scaleTime()
      .domain([
        new Date(new Date(1970, 0, 1, 0, 0).getTime() - paddingY),
        new Date(new Date(1970, 0, 1, 23, 59).getTime() + paddingY),
      ])
      .range([margin.top, dimensions.height - margin.bottom]);

    return { yScale };
  }, [dimensions, margin.top, margin.bottom]);
  useEffect(() => {
    if (!currentDate || dimensions.width === 0) return;

    const baseX = dimensions.width / 2;

    const y = d3
      .scaleTime()
      .domain([new Date(1970, 0, 1, 0, 0), new Date(1970, 0, 2, 0, 0)])
      .range([
        margin.top,
        dimensions.height - margin.bottom - labelMarginBottom,
      ]);

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filtered = entries.filter((d) => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= startOfDay && timestamp <= endOfDay;
    });

    const parsed = filtered.map((d) => {
      const fullDate = new Date(d.timestamp);
      const timeOnly = new Date(
        1970,
        0,
        1,
        fullDate.getHours(),
        fullDate.getMinutes(),
        fullDate.getSeconds()
      );
      return { ...d, fullDate, timeOnly };
    });

    const clusterHeight = radius * 3;
    const maxPerCluster = 10;
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
        const offsetX =
          (colIndex - Math.floor(maxPerCluster / 2)) * horizontalSpacing;

        clustered.push({
          ...point,
          clusteredX: baseX + offsetX,
          clusteredY: newClusterY,
        });
      });
    });

    setClusteredData(clustered);
  }, [entries, currentDate, dimensions, margin.top, margin.bottom]);

  const handleSelect = (point) => {
    setSelectedPoint(point);
  };

  const y = d3
    .scaleTime()
    .domain([
      new Date(new Date(1970, 0, 1, 0, 0).getTime() - 30 * 60 * 1000),
      new Date(new Date(1970, 0, 1, 23, 59).getTime() + 30 * 60 * 1000),
    ])
    .range([margin.top, dimensions.height - margin.bottom - labelMarginBottom]);

  // Horizontal gridlines every 6 hours
  const sixHourIntervals = d3.timeHour.range(
    new Date(1970, 0, 1, 6, 0),
    new Date(1970, 0, 1, 24, 0),
    6
  );
  return (
    <div
      className="relative w-full overflow-hidden px-2"
      style={{ height: `${dimensions.height}px` }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width * 0.9}
        height={Math.max(0, dimensions.height - 70)}
      >
        <YAxis scale={yScale} margin={margin} />

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
            selectedPoint={selectedPoint}
            onSelect={handleSelect}
            category={d.category}
          />
        ))}
        <Tooltip
          point={selectedPoint}
          isTouch={true}
          isMobile={true}
          margin={margin}
          isBeforeNoon={isBeforeNoon}
          getColor={getColorFromFirstLetter}
          radius={radius}
          onClose={() => handleSelect(null)}
        />
      </svg>

      <div>
        <div
          className="h-[50px] flex justify-center items-center mb-2 w-full border-t-[0.5px] border-[#fff]"
          style={{ fontFamily: "Noto Sans JP" }}
        >
          <button
            onClick={() => {
              setShowPicker((prev) => !prev);
              console.log(showPicker);
            }}
            className="text-white text-lg font-semibold flex items-center gap-1"
          >
            {d3.timeFormat("%A, %B %d, %Y")(currentDate)}
            <BsChevronDown />
          </button>

          {showPicker && (
            <div className="absolute mt-2 z-80">
              <DatePicker
                selectedDate={currentDate}
                annotations={{}}
                onSelectDate={(newDate) => {
                  setCurrentDate(newDate);
                  setShowPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCalendarView;
