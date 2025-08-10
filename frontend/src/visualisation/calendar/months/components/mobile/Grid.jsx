import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FixedSizeGrid as RWGrid } from "react-window"; // <-- rename import
import { format } from "date-fns";
import DayCell from "./DayCell";

const COLS = 7;
const CELL_GAP = 0;

const Grid = forwardRef(function Grid(
  {
    allDates = [],                 // <-- default guards
    dateRefs,
    monthRefs,
    selectedStartDate,
    selectedEndDate,
    searchCounts = {},             // <-- default guard
    onSelectDate,
    currentMonth = "",
    scrollRef,
    onVisibleMonthChange,
  },
  ref
) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const rowCount = Math.ceil((allDates?.length || 0) / COLS); // guard
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [highlightRows, setHighlightRows] = useState([0]);
  const gridRef = useRef(null);
  const lastScrolledMonth = useRef(null);

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

  // track (no snapping on mobile)
  useEffect(() => {
    lastScrolledMonth.current = currentMonth;
  }, [currentMonth]);

  const totalGap = (COLS - 1) * CELL_GAP;
  const columnWidth =
    dimensions.width > 0
      ? Math.floor((dimensions.width - totalGap) / COLS)
      : 48;
  const rowHeight = (columnWidth * 13) / 9;

  const [curMonthName, curYear] = (currentMonth || "January 1970").split(" "); // guard
  const curMonthNum = new Date(`${curMonthName} 1, ${curYear}`).getMonth();
  const curYearNum = Number(curYear || 1970);
  const maxCount = Math.max(
    1,
    ...(allDates || []).map((date) => searchCounts[format(date, "yyyy-MM-dd")] || 0)
  );

  // expose programmatic scroll
  useImperativeHandle(ref, () => ({
    scrollToMonth: (monthKey) => {
      const idx = allDates.findIndex(
        (d) => d.getDate() === 1 && format(d, "MMMM yyyy") === monthKey
      );
      if (idx >= 0 && gridRef.current) {
        const row = Math.floor(idx / COLS);
        gridRef.current.scrollToItem({
          rowIndex: row,
          columnIndex: 0,
          align: "start",
        });
      }
    },
  }));

  const Cell = useCallback(
    ({ rowIndex, columnIndex, style }) => {
      const idx = rowIndex * COLS + columnIndex;
      if (!allDates || idx >= allDates.length) return null;

      const date = allDates[idx];
      const key = format(date, "yyyy-MM-dd");
      const count = searchCounts[key] || 0;
      const opacity = count > 0 ? 0.18 + 0.62 * (count / maxCount) : 0;
      const bgColor = count > 0 ? `rgba(34,197,94,${opacity.toFixed(2)})` : "";

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
      currentMonth,
      dateRefs,
      monthRefs,
      highlightRows,
      curMonthNum,
      curYearNum,
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
        <RWGrid
          ref={gridRef}                 // <-- use RWGrid here
          className="scrollbar-hide"
          columnCount={COLS}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          height={dimensions.height}
          width={dimensions.width}
          rowCount={rowCount}
          overscanRowCount={isMobile ? 6 : 200}
          overscanColumnCount={1}
          style={{ background: "#333" }}
          onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
            setHighlightRows([visibleRowStartIndex]);

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
