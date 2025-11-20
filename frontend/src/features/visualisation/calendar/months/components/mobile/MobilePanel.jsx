// components/calendar/months/mobile/MobilePanel.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DonutChart from "../../../../charts/Donut";
import MonthCategoryBarChart from "../../../../charts/MonthCategoryBarChart";
import MonthSelectorModal from "./MonthSelectorModal";
import OverviewStrip from "./OverviewStrip";
import MobileGrid from "./Grid";
import CalendarWeekdaysRow from "../CalendarWeekdaysRow";

export default function MobilePanel({
  // from usePanelState
  monthSummaries,
  currentMonth,
  setCurrentMonth,
  selectedStartDate,
  selectedEndDate,
  onSelectDate,              // <-- use onSelectDate
  allDates,
  records,
  searchCounts,

  // refs
  gridComponentRef,
  dateRefs,
  monthRefs,
  scrollRef,

  // handlers
  scrollToMonth,
  handleVisibleMonthChange,

  // mobile UI state
  isMonthModalOpen,
  setIsMonthModalOpen,
  expandChart,
  setExpandChart,
}) {
  return (
    <div className="flex flex-col h-full pt-3 relative">
      {/* Month overview strip */}
      <OverviewStrip
        monthSummaries={monthSummaries}
        currentMonth={currentMonth}
        onClick={(key) => {
          scrollToMonth(key);
          setCurrentMonth(key);
        }}
      />

      {/* Sticky month header */}
      <div className="z-30 bg-[#1e2626] h-[15dvh] w-full px-4 pb-2 pt-4 shadow-lg border-b border-[#999] overflow-hidden flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full"
          >
            <div className="flex justify-between items-start gap-6 pr-6">
              <span className="flex flex-col w-full relative">
                <div className="relative">
                  <button
                    onClick={() => setIsMonthModalOpen(true)}
                    className="bg-[#1e2626] text-white text-xl font-medium rounded py-2 w-full text-left shadow-sm"
                  >
                    {currentMonth} <span className="ml-1 text-sm">▼</span>
                  </button>
                  <span className="text-sm text-white mt-1">
                    {monthSummaries[currentMonth]?.searchCount ?? 0} Searches
                  </span>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white text-sm" />
                </div>
              </span>

              {monthSummaries[currentMonth]?.categoryCounts?.length > 0 && (
                <div className="absolute right-8">
                  <DonutChart
                    data={monthSummaries[currentMonth].categoryCounts}
                    size={100}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {monthSummaries[currentMonth]?.categoryCounts?.length > 0 && (
          <div className="w-full mt-2">
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setExpandChart(true)}
            >
              See Full Breakdown ▼
            </button>
          </div>
        )}
      </div>

      <CalendarWeekdaysRow />

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <MobileGrid
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
          records={records}
          onVisibleMonthChange={handleVisibleMonthChange}
        />
      </div>

      {/* Expanded chart overlay */}
      <AnimatePresence>
        {expandChart && (
          <motion.div
            key="chart-overlay"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto p-4"
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#1e2626] py-2">
              <h2 className="text-white text-lg font-bold">
                {currentMonth} — Category Breakdown
              </h2>
              <button
                className="text-sm text-white border border-white px-3 py-1 rounded hover:bg-white hover:text-black"
                onClick={() => setExpandChart(false)}
              >
                Close
              </button>
            </div>
            <MonthCategoryBarChart
              data={monthSummaries[currentMonth].categoryCounts}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month picker modal */}
      <MonthSelectorModal
        isOpen={isMonthModalOpen}
        onClose={() => setIsMonthModalOpen(false)}
        onSelectMonth={(monthKey) => {
          scrollToMonth(monthKey);
          setCurrentMonth(monthKey);
        }}
        currentMonth={currentMonth}
        monthSummaries={monthSummaries}
      />
    </div>
  );
}
