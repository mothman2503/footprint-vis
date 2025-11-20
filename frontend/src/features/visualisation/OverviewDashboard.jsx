import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTrendChart from "./charts/CategoryTrendChart";
import MonthCategoryBarChart from "./charts/MonthCategoryBarChart";
import DonutChart from "./charts/Donut";
import WordCloud from "./charts/WordCloud";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";

// Simple animated card shell so every viz feels consistent
function OverviewCard({ title, subtitle, actions, children, className = "" }) {
  return (
    <motion.section
      className={`rounded-2xl border border-white/10 bg-[#0f1013] shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${className}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4">
        <div>
          <h3 className="text-white text-sm sm:text-base font-semibold tracking-tight">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-white/50 mt-0.5 hidden sm:block">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </motion.section>
  );
}

export default function OverviewDashboard({
  dataset,
  selectedDate,
  setSelectedDate,
  setViewMode,
}) {
  // Build category counts with IDs (needed for filter interactions)
  const categoryData = useMemo(() => {
    const counts = dataset.records.reduce((acc, rec) => {
      const id = rec?.category?.id ?? "uncategorized";
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([id, value]) => {
      const cat = IAB_CATEGORIES.find((c) => String(c.id) === String(id));
      return {
        id: String(id),
        label: cat?.name || "Uncategorized",
        color: cat?.color || "#888",
        value,
      };
    });
  }, [dataset.records]);

  const total = dataset.records.length;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview"
        className="grid grid-cols-12 gap-4 xl:gap-5 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* KPI header */}
        <OverviewCard
          title="Activity Overview"
          subtitle={`Total items • ${total.toLocaleString()} records`}
          className="col-span-12"
          actions={
            <button
              onClick={() => setViewMode?.("Table")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 border border-white/10"
            >
              Open Table
            </button>
          }
        >
          <div className="text-white text-sm opacity-80">
            Click peaks or anywhere on the line chart to set a date. Drag the vertical marker to fine‑tune.
          </div>
        </OverviewCard>

        {/* Trend chart full width on small screens, 8/12 on xl if you want to add more to the right */}
        <OverviewCard title="Trends by Category" className="col-span-12">
          <div className="h-[320px] md:h-[380px] xl:h-[420px]">
            <CategoryTrendChart
              records={dataset.records}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenMonthly={() => setViewMode?.("By Month")}
            />
          </div>
        </OverviewCard>

        {/* Bars and side column */}
        <OverviewCard title="This Month by Category" className="col-span-12 xl:col-span-8">
          <div className="h-[380px] overflow-hidden">
            <MonthCategoryBarChart data={categoryData} />
          </div>
        </OverviewCard>

        <div className="col-span-12 xl:col-span-4 grid grid-cols-12 gap-4">
          <OverviewCard title="Category Share" className="col-span-12">
            <div className="flex items-center justify-center h-[260px]">
              <DonutChart data={categoryData} size={220} strokeWidth={26} />
            </div>
          </OverviewCard>
          <OverviewCard title="Frequent Terms" className="col-span-12">
            <div className="h-[260px]">
              <WordCloud data={dataset.records} />
            </div>
          </OverviewCard>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
