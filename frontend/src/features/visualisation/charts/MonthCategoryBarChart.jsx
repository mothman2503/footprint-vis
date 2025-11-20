import React, { useRef, useEffect, useMemo } from "react";
import { EyeOff } from "lucide-react";
import * as d3 from "d3";
import { useCategoryFilter } from "../../../app/providers";
import { useTranslation } from "react-i18next";


const MonthCategoryBarChart = ({ data }) => {
  const ref = useRef();
  const { state, dispatch } = useCategoryFilter();
  const hiddenIds = useMemo(
    () => new Set(state.excludedCategoryIds),
    [state.excludedCategoryIds]
  );

  const {t} = useTranslation();

  const visibleData = useMemo(
    () => data.filter((d) => !hiddenIds.has(d.id)).sort((a, b) => b.value - a.value),
    [data, hiddenIds]
  );

  const hiddenData = useMemo(
    () => data.filter((d) => hiddenIds.has(d.id)),
    [data, hiddenIds]
  );

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (!visibleData.length) return;

    const container = ref.current.parentNode;
    const fullWidth = container.offsetWidth || 400;
    const barHeight = 30;
    const gap = 30;
    const topPadding = 24;
    const margin = { left: 0, right: 50, top: topPadding, bottom: 10 };
    const height = visibleData.length * (barHeight + gap) + topPadding;

    svg.attr("width", fullWidth).attr("height", height);

    const maxValue = d3.max(visibleData, (d) => d.value) || 1;

    const x = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, fullWidth - margin.left - margin.right]);

    const group = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    visibleData.forEach((d, i) => {
      const y = i * (barHeight + gap);
      const rowGroup = group.append("g").attr("transform", `translate(0, ${y})`);

      // Clickable background
      rowGroup
        .append("rect")
        .attr("x", -10)
        .attr("y", -barHeight / 2)
        .attr("width", fullWidth)
        .attr("height", barHeight + 10)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", () => {
          dispatch({ type: "TOGGLE_CATEGORY", payload: d.id });
        });

      // Label
      rowGroup
        .append("text")
        .text(t(d.label))
        .attr("x", 0)
        .attr("y", -6)
        .attr("fill", "#fff")
        .attr("font-size", "13px")
        .attr("font-weight", 600);

      // Bar
      rowGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", barHeight)
        .attr("width", 0)
        .attr("fill", d.color)
        .attr("rx", 6)
        .transition()
        .duration(700)
        .attr("width", x(d.value));

      // Value label
      rowGroup
        .append("text")
        .text(d.value)
        .attr("x", 0)
        .attr("y", barHeight / 2 + 4)
        .attr("fill", "#eee")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .transition()
        .duration(700)
        .attr("x", x(d.value) + 8);
    });
  }, [visibleData, dispatch, t]);

  return (
    <div>
      <svg ref={ref} />

      {hiddenData.length > 0 && (
        <div className="mt-4 px-2 text-sm text-gray-400">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-white">Hidden Categories</div>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-400 hover:text-blue-200 transition"
                onClick={() => {
                  hiddenData.forEach((cat) =>
                    dispatch({ type: "TOGGLE_CATEGORY", payload: cat.id })
                  );
                }}
              >
                Show All
              </button>
              <button
                className="text-xs text-red-400 hover:text-red-300 transition"
                onClick={() => {
                  data.forEach((cat) =>
                    dispatch({ type: "TOGGLE_CATEGORY", payload: cat.id })
                  );
                }}
              >
                Hide All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hiddenData.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  dispatch({ type: "TOGGLE_CATEGORY", payload: cat.id })
                }
                className="flex items-center gap-2 h-[28px] max-w-[180px] px-2 rounded cursor-pointer transition-all border border-gray-700 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:border-white"
                title="Click to show category"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 inline-block"
                  style={{ backgroundColor: cat.color }}
                />
                <span
                  className="text-sm text-white font-medium truncate"
                  style={{ fontFamily: "Noto Sans JP" }}
                >
                  {t(cat.label)}
                </span>
                <EyeOff className="text-white w-4 h-4 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthCategoryBarChart;
