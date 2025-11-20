import { useEffect, useRef } from "react";
import * as d3 from "d3";

const XAxis = ({ scale, width, margin }) => {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || width <= 0) return;

    const tickDates = d3.timeDay.range(
  scale.domain()[0],
  scale.domain()[1]
).map((d) => new Date(d.getTime() + 12 * 60 * 60 * 1000)); // ➕ 12h shift
const axis = d3.axisBottom(scale)
  .tickValues(tickDates)
  .tickFormat(d3.timeFormat("%b %d, %Y"));

    const selection = d3.select(ref.current).call(axis);

    selection.selectAll("text")
      .style("font-size", "15px")
      .style("fill", "white")
      .style("font-family", "Noto Sans JP");

    selection.selectAll("path, line").style("stroke", "#131818");
  }, [scale, width]);

  return <g ref={ref} transform={`translate(0, ${margin.top})`} />;
};

export default XAxis;
