import React, { useEffect } from "react";
import GridContainer from "./GridContainer";
import SidebarList from "./SidebarList";
import SidebarDetails from "./SidebarDetails";
import CalendarWeekdaysRow from "../CalendarWeekdaysRow";
import { format } from "date-fns";

export default function DesktopPanel({
  monthSummaries,
  currentMonth,
  selectedStartDate,
  selectedEndDate,
  allDates,
  records,
  searchCounts,
  onSelectDate,
  gridComponentRef,
  dateRefs,
  monthRefs,
  scrollRef,
  scrollToMonth,
  handleVisibleMonthChange,
}) {
  // Wait for grid to measure before simulating sidebar click
  useEffect(() => {
    if (!selectedStartDate) return;
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const key = format(selectedStartDate, "MMMM yyyy");
        scrollToMonth(key, { animated: true });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [selectedStartDate, scrollToMonth]);

  return (
    <div className="flex h-full ">
      <SidebarList
        monthSummaries={monthSummaries}
        currentMonth={currentMonth}
        onClick={(monthKey) => {
          scrollToMonth(monthKey);
        }}
      />
      <SidebarDetails
        currentMonth={currentMonth}
        monthSummaries={monthSummaries}
      />
      <div className="flex flex-col flex-1 pt-3">
        <CalendarWeekdaysRow />
        <div className="flex-1 min-h-0">
          <GridContainer
            ref={gridComponentRef}
            allDates={allDates}
            dateRefs={dateRefs}
            monthRefs={monthRefs}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            searchCounts={searchCounts}
            onSelectDate={onSelectDate}
            currentMonth={currentMonth}
            scrollRef={scrollRef}
            onVisibleMonthChange={handleVisibleMonthChange}
            records={records}
          />
        </div>
      </div>
    </div>
  );
}
