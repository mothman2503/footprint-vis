import { useEffect, useRef } from "react";
import * as d3 from "d3";

const YAxis = ({ scale, margin }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      d3.select(ref.current)
        .call(
          d3.axisLeft(scale)
            .ticks(d3.timeHour.every(6))
            .tickFormat(d3.timeFormat("%H:%M"))
        )
        .selectAll("text")
        .style("font-size", "12px")
        .style("color", "white")
        .style("font-family", "Noto Sans JP");

      d3.select(ref.current)
        .selectAll("path, line")
        .style("stroke", "#ded")
        .style("stroke-width", "2px");
    }
  }, [scale]);

  return <g ref={ref} transform={`translate(${margin.left}, 0)`} />;
};

export default YAxis;
