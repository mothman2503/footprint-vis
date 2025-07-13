import { useEffect, useRef } from "react";
import * as d3 from "d3";

const XAxis = ({ scale, height, width, margin }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      d3.select(ref.current)
        .call(
          d3.axisBottom(scale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat("%b %d, %Y"))
        )
        .selectAll("text")
        .style("font-size", "15px")
        .style("color", "white")
        .style("font-family", "Noto Sans JP");

      d3.select(ref.current)
        .selectAll("path, line")
        .style("stroke", "#131818");
    }
  }, [scale]);

  return <g ref={ref} transform={`translate(0, ${margin.top})`} />;
};

export default XAxis;
