import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";
import { useCategoryFilter } from "../../CategoryFilterContext";

const CategoryTrendChart = ({ records }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const { state } = useCategoryFilter();
  const hiddenIds = new Set(state.excludedCategoryIds);
  const [smaWindow, setSmaWindow] = useState(3);
  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const processed = useMemo(() => {
    const cutoff = new Date("2005-01-01");
    const colorMap = Object.fromEntries(IAB_CATEGORIES.map((c) => [c.id, c.color]));

    const valid = records.filter((r) => {
      const ts = new Date(r.timestamp);
      return ts >= cutoff && !isNaN(ts) && r.category?.id && !hiddenIds.has(r.category.id);
    });

    if (!valid.length) return { dataByCategory: {}, colorMap: {}, weeks: [], maxY: 0 };

    const byCategory = d3.group(valid, (r) => r.category.id);
    const allWeeks = new Set();
    let globalMax = 0;

    const dataByCategory = {};

    byCategory.forEach((recs, catId) => {
      const weeklyMap = new Map();
      recs.forEach((r) => {
        const weekStart = d3.timeWeek.floor(new Date(r.timestamp)).toISOString().split("T")[0];
        weeklyMap.set(weekStart, (weeklyMap.get(weekStart) || 0) + 1);
        allWeeks.add(weekStart);
      });

      const sorted = Array.from(weeklyMap.entries())
        .map(([date, count]) => ({ date: new Date(date), count }))
        .sort((a, b) => a.date - b.date);

      const interpolated = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        interpolated.push(a);
        const mid = new Date((a.date.getTime() + b.date.getTime()) / 2);
        interpolated.push({ date: mid, count: (a.count + b.count) / 2 });
      }
      interpolated.push(sorted[sorted.length - 1]);

      const smoothed = interpolated.map((d, i, arr) => {
        const start = Math.max(0, i - Math.floor(smaWindow / 2));
        const end = i + Math.ceil(smaWindow / 2);
        const window = arr.slice(start, end);
        const avg = d3.mean(window, (x) => x.count);
        globalMax = Math.max(globalMax, avg || 0);
        return { ...d, count: avg };
      });

      dataByCategory[catId] = smoothed;
    });

    return {
      dataByCategory,
      colorMap,
      weeks: Array.from(allWeeks).map((d) => new Date(d)).sort((a, b) => a - b),
      maxY: globalMax,
    };
  }, [records, hiddenIds, smaWindow]);

  useEffect(() => {
    const { dataByCategory, colorMap, weeks, maxY } = processed;
    if (!Object.keys(dataByCategory).length || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 20, bottom: 30, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const xScale = d3.scaleTime().domain(d3.extent(weeks)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]).nice();

    const lineGen = d3.line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .call((g) => {
        g.selectAll("text")
          .attr("transform", "rotate(-40)")
          .style("text-anchor", "end")
          .style("fill", "#fff");
        g.selectAll("path, line").attr("stroke", "#fff");
      });

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => {
        g.selectAll("text").style("fill", "#fff");
        g.selectAll("path, line").attr("stroke", "#fff");
      });

    Object.entries(dataByCategory).forEach(([catId, points]) => {
      const color = colorMap[catId] || "#aaa";
      g.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.85);
    });

    svg.on("mousemove", (event) => {
      if (Object.keys(dataByCategory).length !== 1) return;

      const [x] = d3.pointer(event);
      const dateAtCursor = xScale.invert(x - margin.left);

      let closest = null;
      let minDist = Infinity;

      Object.entries(dataByCategory).forEach(([catId, points]) => {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];

          if (p1.date <= dateAtCursor && dateAtCursor <= p2.date) {
            const t = (dateAtCursor - p1.date) / (p2.date - p1.date);
            const interpolatedCount = p1.count + t * (p2.count - p1.count);

            const interpX = xScale(dateAtCursor);
            const interpY = yScale(interpolatedCount);
            const dist = Math.abs(interpX - (x - margin.left));

            if (dist < minDist) {
              minDist = dist;
              closest = {
                x: interpX,
                y: interpY,
                color: colorMap[catId] || "#aaa",
                date: dateAtCursor,
                count: interpolatedCount,
              };
            }
          }
        }
      });

      if (closest) setHoverData(closest);
    });

    // Draw hover overlay only if one category is visible and hoverData exists
    svg.select(".hover-overlay")?.remove();

    if (Object.keys(dataByCategory).length === 1 && hoverData) {
      const overlay = svg.append("g").attr("class", "hover-overlay");

      const cx = hoverData.x + margin.left;
      const cy = hoverData.y + margin.top;

      overlay
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 5)
        .attr("fill", hoverData.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      overlay
        .append("line")
        .attr("x1", cx)
        .attr("y1", margin.top)
        .attr("x2", cx)
        .attr("y2", dimensions.height - margin.bottom)
        .attr("stroke", hoverData.color)
        .attr("stroke-dasharray", "4 2");

      overlay
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", cy)
        .attr("x2", dimensions.width - margin.right)
        .attr("y2", cy)
        .attr("stroke", hoverData.color)
        .attr("stroke-dasharray", "4 2");

      overlay
        .append("text")
        .attr("x", cx + 6)
        .attr("y", margin.top + 12)
        .text(d3.timeFormat("%b %d, %Y")(hoverData.date))
        .attr("fill", "#fff")
        .attr("font-size", "12px");

      overlay
        .append("text")
        .attr("x", margin.left + 6)
        .attr("y", cy - 6)
        .text(`y = ${Math.round(hoverData.count)}`)
        .attr("fill", "#fff")
        .attr("font-size", "12px");
    }
  }, [processed, dimensions, smaWindow, hoverData]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full bg-[#111] p-4 rounded flex flex-col gap-2"
      style={{ minHeight: 200 }}
    >
      <svg ref={svgRef} className="w-full flex-1" style={{ height: "100%" }} />
    </div>
  );
};

export default CategoryTrendChart;
