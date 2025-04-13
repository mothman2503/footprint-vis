import React from "react";
import { scaleLinear, scaleTime, line } from "d3";
import { eachDayOfInterval, format, startOfYear, endOfYear } from "date-fns";

const generateMockUsageData = () => {
  const days = eachDayOfInterval({ start: startOfYear(new Date()), end: endOfYear(new Date()) });
  return days.map((date) => ({
    date,
    usage: Math.floor(Math.random() * 100),
  }));
};

const UsageTimelineChart = ({ onDateSelect }) => {
  const data = generateMockUsageData();

  const width = 800;
  const height = 100;
  const margin = { top: 10, right: 10, bottom: 30, left: 30 };

  const x = scaleTime()
    .domain([startOfYear(new Date()), endOfYear(new Date())])
    .range([margin.left, width - margin.right]);

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
    <svg width={width} height={height} className="cursor-pointer" onClick={handleClick}>
      {/* Axes */}
      {[1, 60, 120, 180, 240, 300].map((d) => (
        <text
          key={d}
          x={x(new Date(new Date().getFullYear(), 0, d))}
          y={height - 10}
          fontSize={10}
          textAnchor="middle"
          fill="#555"
        >
          {format(new Date(new Date().getFullYear(), 0, d), "dd MMM")}
        </text>
      ))}

      {/* Line */}
      <path
        d={usageLine(data)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
      />
    </svg>
  );
};

export default UsageTimelineChart;
