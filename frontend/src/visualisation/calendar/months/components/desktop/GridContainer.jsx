import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { format } from "date-fns";
import CalendarDayCell from "./DayCell";
import { IAB_CATEGORIES } from "../../../../../assets/constants/iabCategories";

const COLS = 7;
const CELL_GAP = 0; // px

const GridContainer = forwardRef(function GridContainer(
  {
    allDates,
    dateRefs,
    monthRefs,
    selectedStartDate,
    selectedEndDate,
    searchCounts,
    onSelectDate,
    currentMonth,
    scrollRef,
    onVisibleMonthChange,
    records,
  },
  ref
) {
  const rowCount = Math.ceil(allDates.length / COLS);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [highlightRows, setHighlightRows] = useState([0]);
  const gridRef = useRef(null);
  const gridOuterRef = useRef(null); 

  const isAnimating = useRef(false);
  const suppressVisibleMonthRef = useRef(false);

  // expose smooth scrollToMonth
 

  // Responsive
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
  const rowHeight = Math.max((columnWidth * 8) / 16, 80);

  const [curMonthName, curYear] = (currentMonth || "January 1970").split(" ");
  const curMonthNum = new Date(`${curMonthName} 1, ${curYear}`).getMonth();
  const curYearNum = Number(curYear || 1970);
  const maxCount = Math.max(
    1,
    ...allDates.map((date) => searchCounts[format(date, "yyyy-MM-dd")] || 0)
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

  // inside GridContainer (the version wrapped with forwardRef)
useImperativeHandle(
  ref,
  () => ({
    scrollToMonth: (monthKey, { animated = true } = {}) => {
      if (!monthKey || !allDates?.length) return;

      const firstIdx = allDates.findIndex(
        (d) => d.getDate() === 1 && format(d, "MMMM yyyy") === monthKey
      );
      if (firstIdx < 0) return;

      const rowIndex = Math.floor(firstIdx / COLS);

      // Bias to avoid previous month being counted as visible
      const bias = Math.max(8, Math.floor(rowHeight * 0.1)); // 10% row height, min 8px
      const targetTop = rowIndex * rowHeight + bias;

      const outer = gridOuterRef.current;
      if (!outer) return;

      suppressVisibleMonthRef.current = true;

      if (animated && outer.scrollTo) {
        outer.scrollTo({ top: targetTop, behavior: "smooth" });
      } else if (gridRef.current?.scrollTo) {
        gridRef.current.scrollTo({ scrollTop: targetTop });
      }

      window.setTimeout(() => {
        suppressVisibleMonthRef.current = false;
        onVisibleMonthChange?.([monthKey]);
      }, 650);
    },
  }),
  [allDates, rowHeight, onVisibleMonthChange]
);



  const Cell = useCallback(
    ({ rowIndex, columnIndex, style }) => {
      const idx = rowIndex * COLS + columnIndex;
      if (idx >= allDates.length) return null;

      const date = allDates[idx];
      const key = format(date, "yyyy-MM-dd");
      const count = searchCounts[key] || 0;
      const opacity = count > 0 ? 0.1 + 0.9 * (count / maxCount) : 0;
      const bgColor =
        count > 0 ? `rgba(255,255,255,${opacity.toFixed(2)})` : "";

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

      const highlight = highlightRows.includes(rowIndex);

      const adjustedStyle = {
        ...style,
        left: style.left + columnIndex * CELL_GAP,
        top: style.top + rowIndex * CELL_GAP,
        width: style.width,
        height: style.height,
      };

      return (
        <div style={adjustedStyle}>
          <CalendarDayCell
            ref={refCallback}
            date={date}
            count={count}
            bgColor={bgColor}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            onSelect={(d) => {
              console.log("📦 GridContainer onSelectDate called with:", d);
              onSelectDate?.(d);
            }}
            isCurrentMonth={isCurMonth}
            showMonthLabel={isFirstOfMonth}
            index={idx}
            categoryData={dailyCategoryData[key]}
            highlight={highlight}
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
      highlightRows,
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
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >

      
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Grid
          ref={gridRef}
          outerRef={gridOuterRef} // <-- important for smooth scroll
          className="scrollbar-hide"
          columnCount={COLS}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={dimensions.height}
          width={dimensions.width}
          rowCount={rowCount}
          overscanRowCount={25}
          overscanColumnCount={1}
          onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
            setHighlightRows([visibleRowStartIndex]);

            if (suppressVisibleMonthRef.current || isAnimating.current) return;

            let found = false;
            let monthKey = null;
            for (
              let row = visibleRowStartIndex;
              row <= Math.min(visibleRowStopIndex, rowCount - 1);
              row++
            ) {
              for (let col = 0; col < COLS; col++) {
                const idx = row * COLS + col;
                if (idx >= allDates.length) continue;
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
        </Grid>
      )}
    </div>
  );
});

export default GridContainer;
