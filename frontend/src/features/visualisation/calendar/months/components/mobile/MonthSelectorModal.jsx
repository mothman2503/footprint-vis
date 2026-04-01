// components/calendar/months/mobile/MonthSelectorModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import clsx from "clsx";
import { X, Calendar } from "lucide-react";
import ProportionalBarChart from "../../../../charts/ProportionalBarChart";

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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm text-white overflow-y-auto p-4"
        >
          <div className="max-w-2xl mx-auto bg-[#0f1419] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-[#0f1419] py-4 px-4 flex justify-between items-center z-10 border-b border-white/10">
              <div className="flex items-center gap-2 text-white/80 uppercase tracking-[0.2em] text-xs">
                <Calendar size={16} />
                Select Month
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80"
              >
                <X size={16} />
              </button>
            </div>

            {/* Month List */}
            <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(groupedByYear)
                .sort((a, b) => b[0] - a[0]) // descending by year
                .map(([year, months]) => (
                  <div key={year} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/60 font-semibold">
                      <span className="h-px flex-1 bg-white/10" />
                      <span>{year}</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {months
                        .sort((a, b) => a.summary.date - b.summary.date)
                        .map(({ key, summary }) => {
                          const isActive = key === currentMonth;

                          const chartData =
                            summary.categoryCounts?.map((cat) => ({
                              label: cat.label,
                              value: cat.value,
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
                                "w-full text-left px-3 py-3 rounded-lg border bg-[#141c22] hover:bg-[#1b252e] transition flex flex-col gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)]",
                                isActive
                                  ? "border-emerald-400/70 ring-1 ring-emerald-300/60"
                                  : "border-white/10"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">
                                    {format(summary.date, "MMM yyyy")}
                                  </div>
                                  <div className="text-xs text-white/60">
                                    {summary.searchCount} search
                                    {summary.searchCount !== 1 && "es"}
                                  </div>
                                </div>
                                <div className="text-[11px] text-white/60">
                                  {isActive ? "Active" : "Tap to view"}
                                </div>
                              </div>
                              {chartData.length > 0 && (
                                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                                  <ProportionalBarChart data={chartData} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
