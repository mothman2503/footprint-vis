import React, { useState, useRef } from "react";
import * as d3 from "d3";

const UsageStripeChartScrollable = ({ entries, onSelectWeek }) => {
  const containerRef = useRef();
  const scrollIntervalRef = useRef(null);
  const [highlightX, setHighlightX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const margin = { left: 40, right: 40, top: 0, bottom: 20 };
  const chartHeight =(window.innerHeight - 80) * 0.115; // 20dvh

  const now = new Date();
  const fiveYearsAgo = d3.timeYear.offset(now, - 5);

  const pixelsPerYear = 1000;
  const totalChartWidth = pixelsPerYear * 10;
  const viewportWidth = window.innerWidth ;
  const weekWidth = (pixelsPerYear / 365) * 14;

  const filteredEntries = entries.filter((d) => {
    const date = new Date(d.timestamp);
    return date >= fiveYearsAgo && date <= now;
  });

  const dataByDay = d3.rollup(
    filteredEntries,
    (v) => v.length,
    (d) => d3.timeDay(new Date(d.timestamp))
  );

  const data = Array.from(dataByDay, ([date, count]) => ({ date, count })).sort(
    (a, b) => a.date - b.date
  );

  const x = d3
    .scaleTime()
    .domain([fiveYearsAgo, now])
    .range([margin.left, totalChartWidth - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count) || 1])
    .nice()
    .range([chartHeight - margin.bottom, margin.top]);

  const posToDate = (pos) => {
    const clampedPos = Math.min(
      totalChartWidth - margin.right - weekWidth,
      Math.max(margin.left, pos)
    );
    return x.invert(clampedPos);
  };

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left + containerRef.current.scrollLeft;
    setHighlightX(xPos);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left + containerRef.current.scrollLeft;
    setHighlightX(xPos);
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    const selectedStartDate = d3.timeDay.floor(posToDate(highlightX));
    const selectedEndDate = d3.timeDay.offset(selectedStartDate, 6);
    onSelectWeek({ startDate: selectedStartDate, endDate: selectedEndDate });
  };

  const startScroll = (direction) => {
    if (!containerRef.current) return;
    scrollIntervalRef.current = setInterval(() => {
      containerRef.current.scrollLeft += direction * 5; // slower scroll
    }, 30); // slower interval
  };

  const stopScroll = () => {
    clearInterval(scrollIntervalRef.current);
  };

  const years = d3.timeYear.range(fiveYearsAgo, d3.timeYear.offset(now, 1));

  return (
    <div
      className="relative"
      style={{
        width: "100dvw",
        height: chartHeight,
        userSelect: "none",
      }}
    >
      {/* Left Scroll Button */}
      <div
        className="absolute left-0 top-0 w-8 text-white bg-slate-900  flex items-center justify-center z-20 cursor-pointer"
        style={{ height: chartHeight }}
        onMouseDown={() => startScroll(-1)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      >
        ◀
      </div>

      {/* Right Scroll Button */}
      <div
        className="absolute right-0 top-0 w-8 bg-slate-900 text-white  flex items-center justify-center z-20 cursor-pointer"
        style={{ height: chartHeight }}
        onMouseDown={() => startScroll(1)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      >
        ▶
      </div>

      {/* Scrollable Chart */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar relative"
        style={{
          width: viewportWidth,
          height: chartHeight,
          backgroundColor: "#222",
        }}
      >
        <svg
          width={totalChartWidth}
          height={chartHeight}
          className="inline-block align-top"
        >
          {data.map((d, i) => (
            <rect
              key={i}
              x={x(d.date) - 1}
              y={y(d.count)}
              width={3}
              height={y(0) - y(d.count)}
              fill="steelblue"
            />
          ))}

          {years.map((yearDate, i) => {
            const xPos = x(yearDate);
            return (
              <g
                key={i}
                transform={`translate(${xPos},${chartHeight - margin.bottom - 5})`}
              >
                <text
                  y={20}
                  textAnchor="middle"
                  fontSize={13}
                  fill="white"
                  style={{ userSelect: "none", fontFamily: "Noto Sans JP" }}
                >
                  {yearDate.getFullYear()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Highlight overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            transform: `translateX(${highlightX}px)`,
            width: weekWidth,
            height: `${(chartHeight - margin.bottom)/chartHeight * 100}%`,
            backgroundColor: "rgba(200, 250, 250, 0.3)",
            borderLeft: "1px solid white",
            borderRight: "1px solid white",
            pointerEvents: "none",
            transition: dragging ? "none" : "transform 0.2s",
            boxSizing: "border-box",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};

export default UsageStripeChartScrollable;
