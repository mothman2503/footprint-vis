import React, { useMemo, useRef, useState, useEffect } from "react";
import { scaleLinear, scaleTime, line } from "d3";
import {
  eachDayOfInterval,
  format,
  startOfYear,
  endOfYear,
  getYear,
} from "date-fns";

const generateMockUsageData = () => {
  const days = eachDayOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });
  return days.map((date) => ({
    date,
    usage: Math.floor(Math.random() * 15),
  }));
};

const UsageTimelineChart = ({ onDateSelect, selectedDate }) => {
  const svgRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(0);

  const data = useMemo(() => generateMockUsageData(), []);
  const height = 100;
  const margin = { top: 10, right: 10, bottom: 30, left: 30 };

  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  // Update width on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        setSvgWidth(svgRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const x = scaleTime()
    .domain([yearStart, yearEnd])
    .range([margin.left, svgWidth - margin.right]);

  const y = scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const usageLine = line()
    .x((d) => x(d.date))
    .y((d) => y(d.usage));

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const clickedDate = x.invert(xPos);
    const roundedDate = new Date(clickedDate.setHours(0, 0, 0, 0));
    onDateSelect(roundedDate);
  };

  return (
    <div ref={svgRef} className="w-full overflow-x-auto border-t">
      <svg width={svgWidth} height={height} className="cursor-pointer" onClick={handleClick}>
        {/* X-axis labels */}
        {[1, 60, 120, 180, 240, 300].map((d) => (
          <text
            key={d}
            x={x(new Date(getYear(new Date()), 0, d))}
            y={height - 10}
            fontSize={10}
            textAnchor="middle"
            fill="#555"
          >
            {format(new Date(getYear(new Date()), 0, d), "dd MMM")}
          </text>
        ))}

        {/* Usage line */}
        <path d={usageLine(data)} fill="none" stroke="#3b82f6" strokeWidth={2} />

        {/* Selected date head/marker */}
        {selectedDate && (
          <line
            x1={x(selectedDate)}
            x2={x(selectedDate)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke="red"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
};

export default UsageTimelineChart;
