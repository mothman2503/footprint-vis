import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTrendChart from "./charts/CategoryTrendChart";

export default function OverviewTrends({
  dataset,
  selectedDate,
  setSelectedDate,
  setViewMode,
}) {
  const records = useMemo(() => dataset?.records || [], [dataset?.records]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview-trends"
        className="w-full h-full min-h-[420px] px-2 sm:px-3 pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CategoryTrendChart
          records={records}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenMonthly={() => setViewMode?.("By Month")}
        />
      </motion.div>
    </AnimatePresence>
  );
}
