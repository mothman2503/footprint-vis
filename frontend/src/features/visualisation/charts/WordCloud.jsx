import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

const WordCloud = ({ data, width = 500, height = 300 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data?.length) return;

    const words = data.slice(0, 20).map((item) => ({
      text: item.query,
      color: item.category?.color || "#999",
      size: Math.max(8, Math.min(width, height) / 8),
    }));

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(1)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font("sans-serif")
      .fontSize((d) => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      d3.select(svgRef.current).selectAll("*").remove(); // clear previous

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (d) => d.color)
        .style("font-family", "Noto Sans JP")
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
        )
        .text((d) => d.text);
    }
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default WordCloud;
