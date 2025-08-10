// components/calendar/months/mobile/MonthSelectorModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import clsx from "clsx";

export default function MonthSelectorModal({
  isOpen,
  onClose,
  onSelectMonth,
  monthSummaries,
  currentMonth,
}) {
  const groupedByYear = React.useMemo(() => {
    const grouped = {};
    Object.entries(monthSummaries).forEach(([key, summary]) => {
      const year = summary.date.getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push({ key, summary });
    });
    return grouped;
  }, [monthSummaries]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="month-modal"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-[#1b1f24] text-white overflow-y-auto p-4"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1b1f24] py-4 flex justify-between items-center z-10 border-b border-[#444]">
            <h2 className="text-lg font-bold">Select Month</h2>
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-black"
            >
              Close
            </button>
          </div>

          {/* Month List */}
          <div className="space-y-6 mt-4">
            {Object.entries(groupedByYear)
              .sort((a, b) => b[0] - a[0]) // descending by year
              .map(([year, months]) => (
                <div key={year}>
                  <h3 className="text-md font-semibold text-gray-300 mb-2">{year}</h3>
                  <div className="space-y-2">
                    {months
                      .sort((a, b) => a.summary.date - b.summary.date)
                      .map(({ key, summary }) => {
                        const isActive = key === currentMonth;
                        const topCategories = summary.categoryCounts
                          ?.slice(0, 2)
                          .map((cat) => ({
                            label: cat.label,
                            color: cat.color,
                          })) || [];

                        return (
                          <button
                            key={key}
                            onClick={() => {
                              onSelectMonth(key);
                              onClose();
                            }}
                            className={clsx(
                              "w-full text-left px-4 py-3 rounded border border-[#333] bg-[#222] hover:bg-[#2a2a2a] transition",
                              isActive && "border-white bg-white text-black font-semibold"
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-base font-medium">
                                  {format(summary.date, "MMM yyyy")}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {summary.searchCount} search
                                  {summary.searchCount !== 1 && "es"}
                                </div>
                              </div>
                              {topCategories.length > 0 && (
                                <div className="flex gap-2 items-center">
                                  {topCategories.map((cat) => (
                                    <div
                                      key={cat.label}
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      <span
                                        className="inline-block w-2 h-2 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                      />
                                      <span className="text-gray-300">{cat.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
