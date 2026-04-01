import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FixedSizeGrid as RWGrid } from "react-window";
import { format } from "date-fns";
import DayCell from "./DayCell";
import { IAB_CATEGORIES } from "../../../../../../assets/constants/iabCategories";

const COLS = 7;
const CELL_GAP = 0;

const Grid = forwardRef(function Grid(
  {
    allDates = [],
    dateRefs,
    monthRefs,
    selectedStartDate,
    selectedEndDate,
    searchCounts = {},
    onSelectDate,
    currentMonth = "",
    scrollRef,
    onVisibleMonthChange,
    records = [],
  },
  ref
) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const rowCount = Math.ceil((allDates?.length || 0) / COLS);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // react-window refs
  const gridRef = useRef(null);
  const gridOuterRef = useRef(null);             // <-- outer scroller

  // control visible-month handler during programmatic scroll
  const suppressVisibleMonthRef = useRef(false);

  // NEW: queue a scroll if called before outer scroller/dimensions are ready
  const pendingScrollRef = useRef(null);

  useEffect(() => {
    function updateDimensions() {
      if (scrollRef?.current) {
        setDimensions({
          width: scrollRef.current.offsetWidth,
          height: scrollRef.current.offsetHeight,
        });
      }
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    let ro;
    if (window.ResizeObserver && scrollRef?.current) {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(scrollRef.current);
    }
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (ro) ro.disconnect();
    };
  }, [scrollRef]);

  const totalGap = (COLS - 1) * CELL_GAP;
  const columnWidth =
    dimensions.width > 0
      ? Math.floor((dimensions.width - totalGap) / COLS)
      : 48;
  const rowHeight = Math.max((columnWidth * 13) / 9, 80); // keep your intended tall cells

  const [curMonthName, curYear] = (currentMonth || "January 1970").split(" ");
  const curMonthNum = new Date(`${curMonthName} 1, ${curYear}`).getMonth();
  const curYearNum = Number(curYear || 1970);
  const maxCount = Math.max(
    1,
    ...(allDates || []).map((date) => searchCounts[format(date, "yyyy-MM-dd")] || 0)
  );

  const dailyCategoryData = useMemo(() => {
    const map = {};
    for (const r of records) {
      const date = new Date(r.timestamp);
      const key = format(date, "yyyy-MM-dd");
      if (!map[key]) map[key] = {};
      const catId = r.category?.id || "uncategorized";
      map[key][catId] = (map[key][catId] || 0) + 1;
    }

    const transformed = {};
    for (const [key, counts] of Object.entries(map)) {
      transformed[key] = Object.entries(counts).map(([id, value]) => {
        const cat = IAB_CATEGORIES.find((c) => c.id === id);
        return {
          id,
          label: cat?.name || "Uncategorized",
          color: cat?.color || "#666",
          value,
        };
      });
    }
    return transformed;
  }, [records]);

  // Helper to actually perform the scroll (used by both imperative call and queued replay)
  const performScrollToMonth = useCallback(
    (monthKey, animated = true) => {
      if (!monthKey || !allDates?.length) return;

      const idx = allDates.findIndex(
        (d) => d.getDate() === 1 && format(d, "MMMM yyyy") === monthKey
      );
      if (idx < 0) return;

      const row = Math.floor(idx / COLS);
      const targetTop = row * (rowHeight + CELL_GAP) + 1; // +1 to avoid boundary ambiguity

      // suppress visible-month changes while animating
      suppressVisibleMonthRef.current = true;

      const outer = gridOuterRef.current;
      if (animated && outer?.scrollTo) {
        outer.scrollTo({ top: targetTop, behavior: "smooth" });
      } else if (gridRef.current?.scrollTo) {
        gridRef.current.scrollTo({ scrollTop: targetTop });
      }

      // Re-enable and confirm target month after animation
      window.setTimeout(() => {
        suppressVisibleMonthRef.current = false;
        onVisibleMonthChange?.([monthKey]);
      }, 650);
    },
    [allDates, rowHeight, onVisibleMonthChange]
  );

  // Expose programmatic scroll with SMOOTH behavior + queue if not ready
  useImperativeHandle(
    ref,
    () => ({
      scrollToMonth: (monthKey, { animated = true } = {}) => {
        // If grid isn't ready yet, queue it and we'll attempt once dimensions & outerRef exist
        if (!gridOuterRef.current || dimensions.height === 0 || dimensions.width === 0) {
          pendingScrollRef.current = { monthKey, animated };
          return;
        }
        performScrollToMonth(monthKey, animated);
      },
    }),
    [dimensions.height, dimensions.width, performScrollToMonth]
  );

  // When dimensions/outerRef become ready, replay any queued scroll
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    if (!gridOuterRef.current) return;
    if (dimensions.height === 0 || dimensions.width === 0) return;

    // double rAF to ensure layout is fully settled
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const { monthKey, animated } = pendingScrollRef.current || {};
        if (monthKey) {
          performScrollToMonth(monthKey, animated);
          pendingScrollRef.current = null;
        }
      });
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [dimensions.height, dimensions.width, performScrollToMonth]);

  const Cell = useCallback(
    ({ rowIndex, columnIndex, style }) => {
      const idx = rowIndex * COLS + columnIndex;
      if (!allDates || idx >= allDates.length) return null;

      const date = allDates[idx];
      const key = format(date, "yyyy-MM-dd");
      const count = searchCounts[key] || 0;
      const opacity = count > 0 ? 0.18 + 0.62 * (count / maxCount) : 0;
      const bgColor = count > 0 ? `rgba(255,255,255, ${opacity.toFixed(2)})` : "";

      const isFirstOfMonth = date.getDate() === 1;
      const isCurMonth =
        date.getMonth() === curMonthNum && date.getFullYear() === curYearNum;
      const monthKey = format(date, "MMMM yyyy");

      const refCallback = (el) => {
        dateRefs.current[idx] = el;
        if (isFirstOfMonth) {
          monthRefs.current[monthKey] = el;
        }
      };

      const adjustedStyle = {
        ...style,
        left: style.left + columnIndex * CELL_GAP,
        top: style.top + rowIndex * CELL_GAP,
        width: style.width,
        height: style.height,
      };

      return (
        <div style={adjustedStyle}>
          <DayCell
            ref={refCallback}
            date={date}
            count={count}
            bgColor={bgColor}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            onSelect={onSelectDate}
            isCurrentMonth={isCurMonth}
            showMonthLabel={isFirstOfMonth}
            index={idx}
            barSize={(count / maxCount) * 100}
            categoryData={dailyCategoryData[key]}
          />
        </div>
      );
    },
    [
      allDates,
      searchCounts,
      maxCount,
      selectedStartDate,
      selectedEndDate,
      onSelectDate,
      dateRefs,
      monthRefs,
      curMonthNum,
      curYearNum,
      dailyCategoryData,
    ]
  );

  return (
    <div
      ref={scrollRef}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "hidden", // <-- let RWGrid own the scroll
        overflowX: "hidden",
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <RWGrid
          ref={gridRef}
          outerRef={gridOuterRef}            // <-- smooth scroll target
          className="scrollbar-hide"
          columnCount={COLS}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={dimensions.height}
          width={dimensions.width}
          rowCount={rowCount}
          overscanRowCount={isMobile ? 6 : 200}
          overscanColumnCount={1}
          onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
            if (suppressVisibleMonthRef.current) return; // <-- ignore while animating

            let found = false;
            let monthKey = null;
            for (
              let row = visibleRowStartIndex;
              row <= Math.min(visibleRowStopIndex, rowCount - 1);
              row++
            ) {
              for (let col = 0; col < COLS; col++) {
                const idx = row * COLS + col;
                if (!allDates || idx >= allDates.length) continue;
                const date = allDates[idx];
                if (date.getDate() === 1) {
                  monthKey = format(date, "MMMM yyyy");
                  found = true;
                  break;
                }
              }
              if (found) break;
            }

            if (found && monthKey && onVisibleMonthChange) {
              onVisibleMonthChange([monthKey]);
            }
          }}
        >
          {Cell}
        </RWGrid>
      )}
    </div>
  );
});

export default Grid;
