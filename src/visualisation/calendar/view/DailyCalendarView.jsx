import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { getDB, DB_CONSTANTS } from "../../../utils/db";
import Tooltip from "../components/Tooltip";
import YAxis from "../components/YAxis";
import Datapoint from "../components/Datapoint";
import { BsChevronDown } from "react-icons/bs";
import { IAB_CATEGORIES } from "../../../assets/constants/iabCategories";

const MobileVisualisation = (entries, startDate) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [clusteredData, setClusteredData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const radius = 7;
  const margin = { top: 20, bottom: 100, left: 50, right: 10 };
  const labelMarginBottom = 20;

  useEffect(() => {
    const updateDimensions = () => {
      const usableHeight = window.outerHeight - 80;
      setDimensions({ width: window.innerWidth, height: usableHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const yScale = useMemo(() => {
    const paddingY = 30 * 60 * 1000;
    return d3.scaleTime()
      .domain([
        new Date(new Date(1970, 0, 1, 0, 0).getTime() - paddingY),
        new Date(new Date(1970, 0, 1, 23, 59).getTime() + paddingY),
      ])
      .range([margin.top, dimensions.height - margin.bottom]);
  }, [dimensions, margin.top, margin.bottom]);

  useEffect(() => {
    if (!currentDate || dimensions.width === 0) return;

    const baseX = dimensions.width / 2;
    const y = d3.scaleTime()
      .domain([new Date(1970, 0, 1, 0, 0), new Date(1970, 0, 2, 0, 0)])
      .range([margin.top, dimensions.height - margin.bottom - labelMarginBottom]);

    const startOfDay = new Date(currentDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate); endOfDay.setHours(23, 59, 59, 999);

    const filtered = entries.filter((d) => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= startOfDay && timestamp <= endOfDay;
    });

    const parsed = filtered.map((d) => {
      const fullDate = new Date(d.timestamp);
      const timeOnly = new Date(1970, 0, 1, fullDate.getHours(), fullDate.getMinutes(), fullDate.getSeconds());
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
        const offsetX = (colIndex - Math.floor(maxPerCluster / 2)) * horizontalSpacing;
        clustered.push({ ...point, clusteredX: baseX + offsetX, clusteredY: newClusterY });
      });
    });

    setClusteredData(clustered);
  }, [entries, currentDate, dimensions, margin.top, margin.bottom]);

  const handleSelect = (point) => {
    setSelectedPoint(point);
  };

  const handleUpdatePointCategory = async (point, newCategoryId) => {
    const db = await getDB();
    const updatedCategory = IAB_CATEGORIES.find((cat) => cat.id === newCategoryId);
    if (!updatedCategory || !point?.id) return;
    const entry = await db.get(DB_CONSTANTS.STORE_NAME, point.id);
    if (!entry) return;
    const updatedEntry = { ...entry, category: updatedCategory };
    await db.put(DB_CONSTANTS.STORE_NAME, updatedEntry);
    const updatedPoint = { ...point, category: updatedCategory };
    setSelectedPoint(updatedPoint);
    setClusteredData((prev) =>
      prev.map((p) => (p.id === point.id ? updatedPoint : p))
    );
  };

  const y = d3.scaleTime()
    .domain([new Date(1970, 0, 1, -0.5), new Date(1970, 0, 2, 0, 0)])
    .range([margin.top, dimensions.height - margin.bottom - labelMarginBottom]);

  const sixHourIntervals = d3.timeHour.range(
    new Date(1970, 0, 1, 6, 0),
    new Date(1970, 0, 1, 24, 0),
    6
  );

  return (
    <div className="relative w-full overflow-hidden px-2" style={{ height: `${dimensions.height}px` }}>
      <svg ref={svgRef} width={dimensions.width * 0.9} height={Math.max(0, dimensions.height - 70)}>
        <YAxis scale={yScale} margin={margin} />
        <g>
          {sixHourIntervals.map((time, i) => {
            const yPos = y(time);
            return (
              <line key={i} x1={margin.left} y1={yPos} x2={dimensions.width - margin.right} y2={yPos}
                stroke="#9db" strokeWidth={0.3} strokeDasharray="4 4" />
            );
          })}
        </g>
        {clusteredData.map((d, i) => (
          <Datapoint
            key={i}
            point={d}
            obscure={selectedPoint?.query}
            radius={radius}
            selectedPoint={selectedPoint}
            onSelect={handleSelect}
          />
        ))}
        {selectedPoint && (
          <Tooltip
            point={selectedPoint}
            radius={radius}
            onClose={() => setSelectedPoint(null)}
            onCategoryChange={handleUpdatePointCategory}
            position={{
              x: selectedPoint.clusteredX,
              y: selectedPoint.clusteredY,
              isBeforeNoon: selectedPoint.fullDate?.getHours() < 12,
            }}
          />
        )}
      </svg>

      <div>
        <div className="h-[50px] flex justify-center items-center mb-2 w-full border-t-[0.5px] border-[#fff]">
          <button onClick={() => setShowPicker((prev) => !prev)} className="text-white text-lg font-semibold flex items-center gap-1">
            {d3.timeFormat("%A, %B %d, %Y")(currentDate)}
            <BsChevronDown />
          </button>
          {showPicker && (
            <div className="absolute mt-2 z-80">
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileVisualisation;
