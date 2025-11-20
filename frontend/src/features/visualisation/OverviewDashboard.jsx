import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTrendChart from "./charts/CategoryTrendChart";
import MonthCategoryBarChart from "./charts/MonthCategoryBarChart";
import DonutChart from "./charts/Donut";
import WordCloud from "./charts/WordCloud";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";
import { Activity, BarChart3, CalendarClock, CircleDot, PieChart } from "lucide-react";

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
  const uniqueDays = useMemo(() => {
    const set = new Set(
      dataset.records.map((r) => new Date(r.timestamp).toISOString().slice(0, 10))
    );
    return set.size;
  }, [dataset.records]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(dataset.records.map((r) => r?.category?.id || "uncategorized"));
    return set.size;
  }, [dataset.records]);

  const rangeLabel = useMemo(() => {
    if (!dataset.records.length) return "No data";
    const times = dataset.records
      .map((r) => new Date(r.timestamp).getTime())
      .filter((n) => !Number.isNaN(n));
    if (!times.length) return "No data";
    const min = new Date(Math.min(...times));
    const max = new Date(Math.max(...times));
    return `${min.toLocaleDateString()} → ${max.toLocaleDateString()}`;
  }, [dataset.records]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview"
        className="flex flex-col gap-4 xl:gap-5 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* KPI row */}
        <div className="grid grid-cols-12 gap-4">
          <OverviewCard
            title="Activity Overview"
            subtitle="High-level pulse of your dataset"
            className="col-span-12 md:col-span-6 xl:col-span-4"
            actions={
              <button
                onClick={() => setViewMode?.("Table")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center gap-2"
              >
                <BarChart3 size={14} />
                Table view
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-300" />
                <div>
                  <p className="text-white font-semibold">{total.toLocaleString()}</p>
                  <p className="text-xs text-white/60">Total searches</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot size={16} className="text-cyan-300" />
                <div>
                  <p className="text-white font-semibold">{uniqueCategories}</p>
                  <p className="text-xs text-white/60">Categories</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-indigo-300" />
                <div>
                  <p className="text-white font-semibold">{uniqueDays}</p>
                  <p className="text-xs text-white/60">Days of data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-amber-300" />
                <div>
                  <p className="text-white font-semibold">{rangeLabel}</p>
                  <p className="text-xs text-white/60">Coverage</p>
                </div>
              </div>
            </div>
          </OverviewCard>

          <OverviewCard
            title="Category Share"
            subtitle="Top-level category distribution"
            className="col-span-12 md:col-span-6 xl:col-span-4"
          >
            <div className="flex items-center justify-center h-[220px]">
              <DonutChart data={categoryData} size={200} strokeWidth={24} />
            </div>
          </OverviewCard>

          <OverviewCard
            title="Frequent Terms"
            subtitle="Most common words across your searches"
            className="col-span-12 xl:col-span-4"
          >
            <div className="h-[220px]">
              <WordCloud data={dataset.records} />
            </div>
          </OverviewCard>
        </div>

        {/* Trend & breakdown */}
        <div className="grid grid-cols-12 gap-4">
          <OverviewCard title="Trends by Category" className="col-span-12 xl:col-span-8">
            <div className="h-[360px] md:h-[420px] xl:h-[460px]">
              <CategoryTrendChart
                records={dataset.records}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenMonthly={() => setViewMode?.("By Month")}
              />
            </div>
          </OverviewCard>

          <OverviewCard title="This Month by Category" className="col-span-12 xl:col-span-4">
            <div className="h-[360px]">
              <MonthCategoryBarChart data={categoryData} />
            </div>
          </OverviewCard>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
