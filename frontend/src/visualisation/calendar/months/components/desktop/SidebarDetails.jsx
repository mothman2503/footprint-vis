import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import MonthCategoryBarChart from "../../../../charts/MonthCategoryBarChart";

const SidebarDetails = ({ currentMonth, monthSummaries }) => {
  const [monthName, year] = currentMonth.split(" ");

  return (
    <div className="z-30 bg-[#162020] w-[250px] min-h-0 pb-2 shadow-lg border-b border-[#333] overflow-hidden flex flex-col justify-start">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full flex flex-col justify-between items-start gap-4 overflow-y-auto scrollbar-hide"
        >
          <div className="sticky top-0 w-full p-3 bg-[#1e2626] pt-8 border-b">
            <div className="text-xs text-white px-1">{"SHOWING MONTH"}</div>
            <div className="text-4xl text-white font-bold">{monthName}</div>
            <div className="text-2xl text-white">{year}</div>
            <div className="text-sm text-white my-2">
              {monthSummaries[currentMonth]?.searchCount ?? 0} Searches
            </div>
          </div>

          <div className="w-full flex-grow overflow-y-auto px-3 pb-4 pt-2">
            {monthSummaries[currentMonth]?.categoryCounts?.length > 0 && (
              <MonthCategoryBarChart
                data={monthSummaries[currentMonth].categoryCounts}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SidebarDetails;
