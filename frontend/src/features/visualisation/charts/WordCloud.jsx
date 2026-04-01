import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { IAB_CATEGORIES } from "../../../assets/constants/iabCategories";

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

const categoryColorById = Object.fromEntries(
  IAB_CATEGORIES.map((cat) => [String(cat.id), cat.color || "#888"])
);

function getRecordCategoryColor(item) {
  if (item?.category?.color) return item.category.color;
  const id = item?.category?.id;
  if (id === undefined || id === null) return "#888";
  return categoryColorById[String(id)] || "#888";
}

function createSeededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashEntries(entries) {
  let seed = 2166136261;
  entries.forEach(({ text, count }) => {
    for (let i = 0; i < text.length; i += 1) {
      seed ^= text.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
    seed ^= count;
    seed = Math.imul(seed, 16777619);
  });
  return seed >>> 0;
}

const WordCloud = ({
  data,
  width = 500,
  height = 300,
  maxWords = 140,
  minFont = 12,
  maxFont,
  wordOpacity = 1,
  rotateProbability = 0.25,
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data?.length) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Build frequency map + category-color voting map from queries (words > 2 chars).
    // Use a Map to avoid object prototype key collisions (e.g. "constructor").
    const tokenStats = data.reduce((acc, item) => {
      const categoryColor = getRecordCategoryColor(item);
      const tokens = (item.query || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((w) => w.length > 2);
      tokens.forEach((token) => {
        const stat = acc.get(token) || { count: 0, colorVotes: new Map() };
        stat.count += 1;
        const votes = stat.colorVotes;
        votes.set(categoryColor, (votes.get(categoryColor) || 0) + 1);
        acc.set(token, stat);
      });
      return acc;
    }, new Map());

    const entries = Array.from(tokenStats.entries())
      .map(([text, stat]) => {
        let dominantColor = null;
        let dominantCount = -1;
        stat.colorVotes.forEach((count, color) => {
          if (count > dominantCount) {
            dominantCount = count;
            dominantColor = color;
          }
        });
        return {
          text,
          count: stat.count,
          color: dominantColor,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);

    if (!entries.length) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const upperFont =
      typeof maxFont === "number"
        ? maxFont
        : Math.max(22, Math.min(width, height) / 4);
    const lowerFont = Math.max(6, Math.min(minFont, upperFont));
    const spinProbability = Math.max(0, Math.min(1, rotateProbability));

    const [minCount, maxCount] = d3.extent(entries, (entry) => entry.count);
    const sizeScale = d3
      .scaleSqrt()
      .domain([minCount || 1, maxCount || 1])
      .range([lowerFont, upperFont]);

    const colorScale = d3.scaleOrdinal(palette);
    const random = createSeededRandom(hashEntries(entries) || 1);

    const words = entries.map((entry, idx) => ({
      text: entry.text,
      size: sizeScale(entry.count),
      color: entry.color || colorScale(idx),
    }));

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(2)
      .rotate(() => (random() > 1 - spinProbability ? 90 : 0))
      .random(random)
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
        .style("fill-opacity", wordOpacity)
        .style("font-family", "Noto Sans JP, sans-serif")
        .style("font-weight", 700)
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
        )
        .text((d) => d.text);
    }
  }, [data, width, height, maxWords, minFont, maxFont, wordOpacity, rotateProbability]);

  return <svg ref={svgRef}></svg>;
};

export default WordCloud;
