import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({
  data,
  size = 40,
  strokeWidth, // Optional: let it auto-size by default
  onClick,
  disableDialog = false
}) => {
  const ref = useRef();

  useEffect(() => {
    if (!data?.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = size / 2;
    // Auto-calculate width for donut ring (8px min, up to 40% of radius for larger sizes)
    const donutWidth =
      typeof strokeWidth === "number"
        ? strokeWidth
        : Math.max(8, Math.round(radius * 0.40)); // tweak 0.40 for a "fatter" or thinner donut

    const arc = d3.arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);

    const group = svg
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    const pie = d3.pie().value(d => d.value).sort(null);

    group
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", d => d.data.color)
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      });
  }, [data, size, strokeWidth]);

  return (
    <div
      className="cursor-pointer"
      onClick={e => {
        if (!disableDialog && typeof onClick === "function") {
          e.stopPropagation();
          onClick();
        }
      }}
      style={{ width: size, height: size }}
    >
      <svg ref={ref} />
    </div>
  );
};

export default DonutChart;
