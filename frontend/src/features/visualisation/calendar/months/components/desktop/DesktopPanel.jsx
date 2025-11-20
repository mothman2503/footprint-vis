import React from "react";
import GridContainer from "./GridContainer";
import SidebarList from "./SidebarList";
import SidebarDetails from "./SidebarDetails";
import CalendarWeekdaysRow from "../CalendarWeekdaysRow";

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
