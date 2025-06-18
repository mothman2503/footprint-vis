import { useEffect, useRef } from "react";
import * as d3 from "d3";

const VerticalGridLines = ({ startDate, endDate, dimensions, margin }) => {
  const groupRef = useRef();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!groupRef.current || !startDate || !endDate) return;

    const g = d3.select(groupRef.current);
    g.selectAll("*").remove(); // Clear previous lines if any

    const centerY = (dimensions.height + margin.top) / 2;
    const fullHeight = dimensions.height - margin.top;

    const days = d3.timeDay.range(startDate, endDate, 1);

    days.forEach((date, i) => {
      const xPos =
        ((i + 1) * (dimensions.width - margin.left - margin.right)) / 7 +
        margin.left;

      const line = g.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", centerY)
        .attr("y2", centerY)
        .attr("stroke", "#cd5")
        .attr("stroke-width", 2);

      if (!hasAnimated.current) {
        line.transition()
          .duration(800)
          .attr("y1", margin.top)
          .attr("y2", fullHeight);
      } else {
        line.attr("y1", margin.top).attr("y2", fullHeight);
      }
    });

    // Right edge line
    const lastLine = g.append("line")
      .attr("x1", dimensions.width - margin.right)
      .attr("x2", dimensions.width - margin.right)
      .attr("y1", centerY)
      .attr("y2", centerY)
      .attr("stroke", "#cd5")
      .attr("stroke-width", 2);

    if (!hasAnimated.current) {
      lastLine.transition()
        .duration(800)
        .attr("y1", margin.top)
        .attr("y2", fullHeight);
    } else {
      lastLine.attr("y1", margin.top).attr("y2", fullHeight);
    }

    hasAnimated.current = true;
  }, [startDate, endDate, dimensions, margin]);

  return <g ref={groupRef} />;
};

export default VerticalGridLines;
