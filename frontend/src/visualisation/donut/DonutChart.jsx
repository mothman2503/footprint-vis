import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({ data, size = 200, strokeWidth = 30, onClick, disableDialog = false }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data?.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = size / 2;
    const group = svg
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    const pie = d3.pie().value((d) => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius - strokeWidth).outerRadius(radius);

    const paths = group
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      });

    paths
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t));
      });

  }, [data, size, strokeWidth]);

  return (
    <div
      className="cursor-pointer"
      onClick={(e) => {
        if (!disableDialog && typeof onClick === "function") {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <svg ref={ref} className="mx-auto block" />
    </div>
  );
};


export default DonutChart;
