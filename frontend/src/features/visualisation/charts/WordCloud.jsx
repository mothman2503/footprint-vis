import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

const palette = [
  "#2dd4bf",
  "#22c55e",
  "#60a5fa",
  "#a855f7",
  "#f97316",
  "#f59e0b",
  "#38bdf8",
  "#e879f9",
  "#fb7185",
];

const WordCloud = ({ data, width = 500, height = 300 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data?.length) return;

    // Build frequency map from queries (words > 2 chars)
    const counts = data.reduce((acc, item) => {
      const tokens = (item.query || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2);
      tokens.forEach((token) => {
        acc[token] = (acc[token] || 0) + 1;
      });
      return acc;
    }, {});

    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 80); // show more words

    if (!entries.length) return;

    const [minCount, maxCount] = d3.extent(entries, ([, count]) => count);
    const sizeScale = d3
      .scaleSqrt()
      .domain([minCount || 1, maxCount || 1])
      .range([12, Math.max(22, Math.min(width, height) / 4)]);

    const colorScale = d3.scaleOrdinal(palette);

    const words = entries.map(([text, count], idx) => ({
      text,
      size: sizeScale(count),
      color: colorScale(idx),
    }));

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(2)
      .rotate(() => (Math.random() > 0.75 ? 90 : 0))
      .font("Noto Sans JP, sans-serif")
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
        .style("font-family", "Noto Sans JP, sans-serif")
        .style("font-weight", 700)
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
