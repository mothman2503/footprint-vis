import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";
import { useCategoryFilter } from "../../CategoryFilterContext";

/* ---------- helpers ---------- */
const ema = (arr, alpha = 0.3) => {
  let prev = arr[0] || 0;
  return arr.map((v) => (prev = alpha * v + (1 - alpha) * prev));
};
const rollingMedianMAD = (arr, win = 9) => {
  const half = Math.floor(win / 2);
  const med = Array(arr.length).fill(0);
  const mad = Array(arr.length).fill(1);
  for (let i = 0; i < arr.length; i++) {
    const s = Math.max(0, i - half), e = Math.min(arr.length, i + half + 1);
    const w = arr.slice(s, e).slice().sort((a, b) => a - b);
    const m = w[Math.floor(w.length / 2)] || 0;
    med[i] = m;
    const devs = w.map((x) => Math.abs(x - m)).sort((a, b) => a - b);
    mad[i] = Math.max(1e-6, devs[Math.floor(devs.length / 2)] || 1e-6);
  }
  return { med, mad };
};
const findEpisodes = (series, zThresh = 2, minLen = 2) => {
  const out = [];
  let i = 0;
  while (i < series.length) {
    if (series[i].z >= zThresh) {
      let j = i;
      while (j < series.length && series[j].z >= zThresh) j++;
      if (j - i >= minLen) {
        const seg = series.slice(i, j);
        const peak = seg.reduce((a, b) => (b.smooth > a.smooth ? b : a), seg[0]);
        out.push({ start: seg[0].date, end: seg[seg.length - 1].date, peakDate: peak.date, peakValue: peak.smooth });
      }
      i = j;
    } else i++;
  }
  return out;
};
/* -------------------------------- */

const CategoryTrendChart = ({ records, selectedDate, onSelectDate, onOpenMonthly }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  const { state } = useCategoryFilter();
  const hiddenIds = new Set(state.excludedCategoryIds);

  const [smaWindow, setSmaWindow] = useState(3);
  const [hoverData, setHoverData] = useState(null);
  const [flagArmed, setFlagArmed] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [showPeaks, setShowPeaks] = useState(true);

  // ---- NEW: bump after each draw so marker re-renders even if selectedDate didn't change
  const [drawVersion, setDrawVersion] = useState(0);

  // keep latest values in refs for event handlers
  const selectedDateRef = useRef(selectedDate);
  const flagArmedRef = useRef(flagArmed);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { flagArmedRef.current = flagArmed; }, [flagArmed]);

  // animate only on load or when filters change
  const filterKey = useMemo(() => Array.from(hiddenIds).sort().join(","), [hiddenIds]);
  const prevFilterKeyRef = useRef(filterKey);
  const shouldAnimateRef = useRef(true);
  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      shouldAnimateRef.current = true;
      prevFilterKeyRef.current = filterKey;
    }
  }, [filterKey]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const processed = useMemo(() => {
    const cutoff = new Date("2005-01-01");
    const colorMap = Object.fromEntries(IAB_CATEGORIES.map((c) => [c.id, c.color]));
    const valid = records.filter((r) => {
      const ts = new Date(r.timestamp);
      return ts >= cutoff && !isNaN(ts) && r.category?.id && !hiddenIds.has(r.category.id);
    });
    if (!valid.length) {
      return { dataByCategory: {}, colorMap: {}, weeks: [], maxY: 0, episodesByCategory: {}, peaksByCategory: {} };
    }

    const byCategory = d3.group(valid, (r) => r.category.id);
    let globalMax = 0;
    const minDate = d3.timeWeek.floor(d3.min(valid, (d) => new Date(d.timestamp)));
    const maxDate = d3.timeWeek.ceil(d3.max(valid, (d) => new Date(d.timestamp)));
    const weekTicks = d3.timeWeek.range(minDate, maxDate);
    const weeksISO = weekTicks.map((d) => d.toISOString().slice(0, 10));

    const dataByCategory = {};
    const episodesByCategory = {};
    const peaksByCategory = {};

    byCategory.forEach((recs, catId) => {
      const weekly = new Map();
      recs.forEach((r) => {
        const w = d3.timeWeek.floor(new Date(r.timestamp)).toISOString().slice(0, 10);
        weekly.set(w, (weekly.get(w) || 0) + 1);
      });

      const dense = weeksISO.map((w) => ({ date: new Date(w), count: weekly.get(w) || 0 }));
      const sm = ema(dense.map((d) => d.count), 0.3);
      const sm2 = sm.map((v, i, arr) => {
        const h = Math.floor(smaWindow / 2);
        const s = Math.max(0, i - h), e = Math.min(arr.length, i + h + 1);
        return d3.mean(arr.slice(s, e));
      });

      const { med, mad } = rollingMedianMAD(sm2, 9);
      const series = dense.map((d, i) => ({ date: d.date, smooth: sm2[i] || 0, z: (sm2[i] - med[i]) / mad[i] }));
      const episodes = findEpisodes(series, 2, 2);
      episodesByCategory[catId] = episodes;

      const peaks = episodes.map((ep) => ({ date: ep.peakDate, value: ep.peakValue }));
      peaksByCategory[catId] = peaks;

      const smoothed = series.map((d) => ({ date: d.date, count: d.smooth }));
      dataByCategory[catId] = smoothed;
      globalMax = Math.max(globalMax, d3.max(smoothed, (d) => d.count) || 0);
    });

    return { dataByCategory, colorMap, weeks: weekTicks, maxY: globalMax, episodesByCategory, peaksByCategory };
  }, [records, hiddenIds, smaWindow]);

  // store scales for other effects
  const scalesRef = useRef(null);

  // --- MAIN DRAW (no redraw on clicks/drag; animates only on load/filter change)
  useEffect(() => {
    const { dataByCategory, colorMap, weeks, maxY, episodesByCategory, peaksByCategory } = processed;
    if (!Object.keys(dataByCategory).length || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 20, bottom: 30, left: 50 };
    
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const xScale = d3.scaleTime().domain(d3.extent(weeks)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]).nice();
    scalesRef.current = { xScale, yScale, margin, width, height };

    const lineGen = d3.line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const root = svg.attr("width", dimensions.width).attr("height", dimensions.height);
    const g = root.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .call((g2) => {
        g2.selectAll("text").attr("transform", "rotate(-40)").style("text-anchor", "end").style("fill", "#fff");
        g2.selectAll("path, line").attr("stroke", "#fff");
      });

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g2) => {
        g2.selectAll("text").style("fill", "#fff");
        g2.selectAll("path, line").attr("stroke", "#fff");
      });

    const animate = shouldAnimateRef.current === true;

    // episode bands
    if (showEpisodes) {
      Object.entries(episodesByCategory).forEach(([catId, eps]) => {
        const color = colorMap[catId] || "#aaa";
        const bandG = g.append("g").attr("class", "episode-bands");
        const sel = bandG.selectAll("rect")
          .data(eps)
          .enter()
          .append("rect")
          .attr("x", (d) => xScale(d.start))
          .attr("y", 0)
          .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
          .attr("height", height)
          .attr("fill", color)
          .style("mix-blend-mode", "screen")
          .style("pointer-events", "none");

        if (animate) sel.attr("opacity", 0).transition().duration(500).delay(200).attr("opacity", 0.08);
        else sel.attr("opacity", 0.08);
      });
    }

    // lines
    Object.entries(dataByCategory).forEach(([catId, points]) => {
      const color = colorMap[catId] || "#aaa";
      const path = g.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)
        .attr("d", lineGen)
        .style("pointer-events", "none");

      if (animate) {
        path.each(function () {
          try {
            const L = this.getTotalLength();
            d3.select(this)
              .attr("stroke-dasharray", `${L} ${L}`)
              .attr("stroke-dashoffset", L)
              .transition()
              .duration(900)
              .ease(d3.easeCubicOut)
              .attr("stroke-dashoffset", 0);
          } catch {}
        });
      }
    });

    // peak markers
    if (showPeaks) {
      const markers = g.append("g").attr("class", "peak-markers");
      Object.entries(peaksByCategory).forEach(([catId, peaks]) => {
        const color = colorMap[catId] || "#aaa";
        const sel = markers.selectAll(`circle.peak-${catId}`)
          .data(peaks, (d) => d.date)
          .enter()
          .append("circle")
          .attr("class", `peak-${catId}`)
          .attr("cx", (d) => xScale(d.date))
          .attr("cy", (d) => yScale(d.value))
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("cursor", "pointer");

        if (animate) sel.attr("r", 0).transition().duration(350).delay(250).attr("r", 4).ease(d3.easeBackOut.overshoot(1.4));
        else sel.attr("r", 4);

        sel.append("title").text((d) => `Peak: ${d3.timeFormat("%b %d, %Y")(d.date)} • ${Math.round(d.value)}`);

        markers.selectAll(`circle.peak-${catId}`).on("click", (event, d) => {
          onSelectDate?.(d3.timeDay.floor(d.date));
        });
      });
    }

    // overlay groups for hover & selection (drawn by other effects)
    root.select(".hover-overlay")?.remove();
    root.append("g").attr("class", "hover-overlay");
    root.select(".selected-marker")?.remove();
    root.append("g").attr("class", "selected-marker");

    // mousemove handler (only when one category visible)
    root.on("mousemove", (event) => {
      const cats = Object.keys(processed.dataByCategory);
      if (cats.length !== 1) return;
      const { xScale, yScale, margin, width } = scalesRef.current || {};
      if (!xScale || !yScale) return;
      const [x] = d3.pointer(event, root.node());
      const xIn = x - margin.left;
      if (xIn < 0 || xIn > width) return;

      const dateAtCursor = xScale.invert(xIn);
      const pts = processed.dataByCategory[cats[0]];
      let yVal = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (a.date <= dateAtCursor && dateAtCursor <= b.date) {
          const t = (dateAtCursor - a.date) / (b.date - a.date);
          yVal = a.count + t * (b.count - a.count);
          break;
        }
      }
      setHoverData({
        x: xIn,
        y: yScale(yVal),
        color: processed.colorMap[cats[0]] || "#aaa",
        date: dateAtCursor,
        count: yVal,
      });
    });

    // click to set/move date (reads latest refs, so no redraw)
    root.on("click", (event) => {
      const { xScale, margin, width } = scalesRef.current || {};
      if (!xScale) return;
      const [x] = d3.pointer(event, root.node());
      const xIn = x - margin.left;
      if (xIn < 0 || xIn > width) return;

      if (event.shiftKey) {
        onSelectDate?.(null);
        setFlagArmed(false);
        return;
      }
      if (flagArmedRef.current || selectedDateRef.current) {
        const picked = d3.timeDay.floor(xScale.invert(xIn));
        onSelectDate?.(picked);
        setFlagArmed(false);
      }
    });

    // after this draw, disable animation until filters change and bump drawVersion
    shouldAnimateRef.current = false;
    setDrawVersion((v) => v + 1); // ⬅ triggers marker re-render after a rebuild
  }, [processed, dimensions, smaWindow, showEpisodes, showPeaks, onSelectDate]);

  // --- SELECTED MARKER effect (no redraw/animation)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const selLayer = svg.select(".selected-marker");
    if (selLayer.empty()) return;

    selLayer.selectAll("*").remove();
    selLayer.raise(); // keep on top

    if (!selectedDate || !scalesRef.current) return;

    const { xScale, margin, width, height } = scalesRef.current;

    // clamp into domain so it's visible even if filters shrink the domain
    const [d0, d1] = xScale.domain();
    const sd = d3.timeDay.floor(selectedDate);
    const clampedDate = new Date(Math.min(+d1, Math.max(+d0, +sd)));
    const xSel = xScale(clampedDate);
    if (isNaN(xSel)) return;

    const xPx = xSel + margin.left;

    const line = selLayer.append("line")
      .attr("x1", xPx)
      .attr("y1", margin.top)
      .attr("x2", xPx)
      .attr("y2", dimensions.height - margin.bottom)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 3")
      .attr("opacity", 0.95)
      .style("cursor", "ew-resize");

    const handle = selLayer.append("rect")
      .attr("x", xPx - 12)     // bigger hitbox
      .attr("y", margin.top)
      .attr("width", 24)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("cursor", "ew-resize")
      .style("pointer-events", "all");

    const drag = d3.drag()
      .on("drag", (event) => {
        const xIn = Math.max(0, Math.min(width, event.x - margin.left));
        const dPicked = d3.timeDay.floor(xScale.invert(xIn));
        const xNew = xScale(dPicked) + margin.left;
        line.attr("x1", xNew).attr("x2", xNew);
        handle.attr("x", xNew - 12);
      })
      .on("end", (event) => {
        const xIn = Math.max(0, Math.min(width, event.x - margin.left));
        onSelectDate?.(d3.timeDay.floor(xScale.invert(xIn)));
      });

    handle.call(drag);
  }, [selectedDate, dimensions, drawVersion]); // ⬅ re-run after each rebuild

  // --- HOVER OVERLAY effect (isolated; re-raise marker to stay on top)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const overlay = svg.select(".hover-overlay");
    if (overlay.empty()) return;

    overlay.selectAll("*").remove();
    if (!hoverData) return;

    const { margin } = scalesRef.current || { margin: { left: 50, top: 30, right: 20, bottom: 30 } };
    const dims = svgRef.current?.getBoundingClientRect();
    if (!dims) return;

    const cx = hoverData.x + margin.left;
    const cy = hoverData.y + margin.top;

    overlay.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 4)
      .attr("fill", hoverData.color).attr("stroke", "white").attr("stroke-width", 1);

    overlay.append("line")
      .attr("x1", cx).attr("y1", margin.top)
      .attr("x2", cx).attr("y2", dims.height - margin.bottom)
      .attr("stroke", hoverData.color).attr("stroke-dasharray", "4 2");

    overlay.append("line")
      .attr("x1", margin.left).attr("y1", cy)
      .attr("x2", dims.width - margin.right).attr("y2", cy)
      .attr("stroke", hoverData.color).attr("stroke-dasharray", "4 2");

    overlay.append("text")
      .attr("x", cx + 6).attr("y", margin.top + 12)
      .text(d3.timeFormat("%b %d, %Y")(hoverData.date))
      .attr("fill", "#fff").attr("font-size", "12px");

    // keep selection marker above hover crosshair
    svg.select(".selected-marker").raise();
  }, [hoverData]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full bg-[#111] p-4 rounded flex flex-col gap-2"
      style={{ minHeight: 240 }}
    >
      {/* Controls */}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-2">
        <button
          className={`px-2 py-1 rounded text-sm border ${
            flagArmed ? "bg-amber-500 text-black border-amber-400" : "bg-[#1e1e1e] text-white border-[#333]"
          }`}
          onClick={() => {
            if (selectedDate) onOpenMonthly?.();
            else setFlagArmed((v) => !v);
          }}
          title={
            selectedDate
              ? "Open Monthly Calendar at selected date"
              : flagArmed
              ? "Click on the chart to choose a date"
              : "Pick a date from the chart"
          }
        >
          {selectedDate ? "📅 Open Month" : flagArmed ? "✅ Pick a date…" : "📍 Select date"}
        </button>

        <button
          className="px-2 py-1 rounded text-sm border bg-[#1e1e1e] text-white border-[#333]"
          onClick={() => setShowEpisodes((v) => !v)}
          title="Toggle episode bands"
        >
          {showEpisodes ? "🟦 Episodes on" : "⬜ Episodes off"}
        </button>

        <button
          className="px-2 py-1 rounded text-sm border bg-[#1e1e1e] text-white border-[#333]"
          onClick={() => setShowPeaks((v) => !v)}
          title="Toggle peak markers"
        >
          {showPeaks ? "🔺 Peaks on" : "△ Peaks off"}
        </button>

        <label className="hidden md:flex items-center gap-2 text-xs text-white/70">
          <span>SMA</span>
          <input type="range" min={1} max={9} step={2} value={smaWindow} onChange={(e) => setSmaWindow(+e.target.value)} />
          <span className="w-6 text-right">{smaWindow}</span>
        </label>
      </div>

      <div className="absolute left-3 bottom-2 text-[11px] text-white/50 select-none">
        Tip: click to set/move date • drag line to adjust • Shift+click clears
      </div>

      <svg ref={svgRef} className="w-full flex-1" style={{ height: "100%" }} />
    </div>
  );
};

export default CategoryTrendChart;
