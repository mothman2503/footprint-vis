import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({
  data,
  size = 40,
  strokeWidth, // Optional: let it auto-size by default
  onClick,
  onHoverCategory,
  onSelectCategory,
  disableDialog = false,
  activeCategoryId = null,
  unselectedDarken = 1,
  unselectedWash = 0,
  transitionMs = 420,
}) => {
  const ref = useRef();
  const hasActiveCategory =
    activeCategoryId !== null &&
    activeCategoryId !== undefined &&
    String(activeCategoryId).length > 0;
  const selectedArcScale = hasActiveCategory ? 1.05 : 1;
  const selectionBleed = hasActiveCategory ? Math.max(6, Math.round(size * 0.05)) : 0;
  const canvasSize = size + selectionBleed * 2;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    if (!data?.length) return;

    const radius = Math.max(10, size / 2 - 1);
    // Auto-calculate width for donut ring (8px min, up to 40% of radius for larger sizes)
    const maxDonutWidth = Math.max(1, radius - 1);
    const autoDonutWidth = Math.max(8, Math.round(radius * 0.40));
    const donutWidth =
      typeof strokeWidth === "number"
        ? Math.min(strokeWidth, maxDonutWidth)
        : Math.min(autoDonutWidth, maxDonutWidth); // tweak 0.40 for a "fatter" or thinner donut

    const arc = d3
      .arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);
    svg
      .attr("width", canvasSize)
      .attr("height", canvasSize)
      .style("overflow", "visible");

    const group = svg
      .append("g")
      .attr("pointer-events", "auto")
      .append("g")
      .attr("transform", `translate(${canvasSize / 2},${canvasSize / 2})`);
    const segmentLayer = group.append("g");

    const pie = d3.pie().value(d => d.value).sort(null);
    const pieData = pie(data);
    const isSelectedSlice = (slice) =>
      hasActiveCategory && String(slice?.data?.id) === String(activeCategoryId);

    const darkenAmount = Math.max(0, Number(unselectedDarken) || 0);
    const washAmount = Math.max(0, Math.min(1, Number(unselectedWash) || 0));
    const getArcFill = (d) => {
      const base = d.data.color;
      if (!hasActiveCategory || String(d.data.id) === String(activeCategoryId)) {
        return base;
      }

      let inactiveColor = base;
      if (washAmount > 0) {
        const hsl = d3.hsl(base);
        if (!Number.isNaN(hsl.s) && !Number.isNaN(hsl.l)) {
          hsl.s = Math.max(0, Math.min(1, hsl.s * (1 - washAmount * 0.86)));
          hsl.l = Math.max(0, Math.min(1, hsl.l + (1 - hsl.l) * (washAmount * 0.52)));
          inactiveColor = hsl.formatHex();
        }
        inactiveColor = d3.interpolateLab(inactiveColor, "#d3dae2")(washAmount * 0.58);
      }

      if (darkenAmount <= 0) return inactiveColor;
      const shaded = d3.color(inactiveColor);
      return shaded ? shaded.darker(darkenAmount).formatHex() : inactiveColor;
    };

    const segments = segmentLayer
      .selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("fill", (d) => getArcFill(d))
      .attr("d", arc)
      .attr("transform", (d) => (isSelectedSlice(d) ? `scale(${selectedArcScale})` : null))
      .attr("stroke", "#0b1012")
      .attr("stroke-width", 1)
      .style("cursor", (typeof onHoverCategory === "function" || typeof onSelectCategory === "function") ? "pointer" : "default")
      .attr("fill-opacity", 1);

    segments
      .on("pointerenter", (event, d) => {
        if (typeof onHoverCategory !== "function") return;
        if (event.pointerType === "touch") return;
        onHoverCategory(d.data.id);
      })
      .on("pointerdown", (event, d) => {
        if (typeof onSelectCategory !== "function") return;
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          event.stopPropagation();
          onSelectCategory(d.data.id);
        }
      })
      .on("click", (event, d) => {
        if (typeof onSelectCategory !== "function") return;
        event.stopPropagation();
        onSelectCategory(d.data.id);
      })
      .on("touchstart", (event, d) => {
        if (typeof onSelectCategory !== "function") return;
        event.preventDefault();
        event.stopPropagation();
        onSelectCategory(d.data.id);
      });

    segments
      .transition()
      .duration(transitionMs)
      .ease(d3.easeCubicOut)
      .attr("fill", (d) => getArcFill(d))
      .attr("transform", (d) => (isSelectedSlice(d) ? `scale(${selectedArcScale})` : null))
      .attr("fill-opacity", 1);
  }, [data, size, canvasSize, strokeWidth, hasActiveCategory, selectedArcScale, activeCategoryId, onHoverCategory, onSelectCategory, unselectedDarken, unselectedWash, transitionMs]);

  const isClickable =
    (!disableDialog && typeof onClick === "function") ||
    typeof onSelectCategory === "function";

  return (
    <div
      className={isClickable ? "cursor-pointer" : "cursor-default"}
      onClick={e => {
        if (!disableDialog && typeof onClick === "function") {
          e.stopPropagation();
          onClick();
        }
      }}
      style={{ width: canvasSize, height: canvasSize, overflow: "visible" }}
    >
      <svg ref={ref} />
    </div>
  );
};

export default DonutChart;
