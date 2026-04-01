import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DonutChart from "./charts/Donut";
import WordCloud from "./charts/WordCloud";
import MonthCategoryBarChart from "./charts/MonthCategoryBarChart";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";
import { Activity, CalendarClock, CircleDot, PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";

const getLocalizedCategoryLabel = (label, t) => {
  const raw = String(label || "uncategorized").trim();
  const bare = raw.replace(/^categories\./, "");
  const key = bare.toLowerCase() === "uncategorized" ? "uncategorized" : bare;
  const defaultLabel = key.replaceAll("_", " ");
  return t(`categories.${key}`, { defaultValue: defaultLabel });
};

// Simple animated card shell so every viz feels consistent
function OverviewCard({ title, subtitle, actions, children, className = "", sharp = false }) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <motion.section
      className={`${sharp ? "rounded-none" : "rounded-2xl"} border border-white/10 bg-[#0f1013] shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col ${className}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {hasHeader ? (
        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4">
          <div>
            {title ? (
              <h3 className="text-white text-sm sm:text-base font-semibold tracking-tight">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="text-xs text-white/50 mt-0.5 hidden sm:block">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      ) : null}
      <div className="p-3 sm:p-4">{children}</div>
    </motion.section>
  );
}

export default function OverviewDashboard({
  dataset,
}) {
  const { t } = useTranslation();
  const records = useMemo(() => dataset?.records || [], [dataset?.records]);

  // Build category counts with IDs (needed for filter interactions)
  const categoryData = useMemo(() => {
    const counts = records.reduce((acc, rec) => {
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
  }, [records]);

  const total = records.length;
  const donutCategoryData = useMemo(
    () => categoryData.filter((d) => (d.value || 0) > 0),
    [categoryData]
  );

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [autoLoopEnabled, setAutoLoopEnabled] = useState(true);
  const donutCardBodyRef = useRef(null);
  const [donutCloudSize, setDonutCloudSize] = useState({ width: 360, height: 420 });

  useEffect(() => {
    if (donutCategoryData.length === 0) {
      setActiveCategoryIndex(0);
      return;
    }
    setActiveCategoryIndex((idx) => Math.min(idx, donutCategoryData.length - 1));
  }, [donutCategoryData.length]);

  useEffect(() => {
    if (!autoLoopEnabled || donutCategoryData.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveCategoryIndex((idx) => (idx + 1) % donutCategoryData.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [autoLoopEnabled, donutCategoryData.length]);

  useEffect(() => {
    const node = donutCardBodyRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDonutCloudSize({
        width: Math.max(320, Math.round(width)),
        height: Math.max(260, Math.round(height)),
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const activeCategory = donutCategoryData[activeCategoryIndex] || null;

  const activeCategoryRecords = useMemo(() => {
    if (!activeCategory) return [];
    return records.filter(
      (r) => String(r?.category?.id ?? "uncategorized") === String(activeCategory.id)
    );
  }, [records, activeCategory]);

  const activeCategoryShare = useMemo(() => {
    if (!activeCategory || total === 0) return 0;
    return (activeCategory.value / total) * 100;
  }, [activeCategory, total]);

  const handleSelectDonutCategory = useCallback(
    (categoryId) => {
      const idx = donutCategoryData.findIndex(
        (cat) => String(cat.id) === String(categoryId)
      );
      if (idx < 0) return;
      setActiveCategoryIndex((prev) => (prev === idx ? prev : idx));
    },
    [donutCategoryData]
  );
  const uniqueDays = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const date = new Date(r?.timestamp);
      const time = date.getTime();
      if (!Number.isNaN(time)) {
        set.add(date.toISOString().slice(0, 10));
      }
    });
    return set.size;
  }, [records]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(records.map((r) => r?.category?.id || "uncategorized"));
    return set.size;
  }, [records]);

  const rangeLabel = useMemo(() => {
    if (!records.length) return "No data";
    const times = records
      .map((r) => new Date(r.timestamp).getTime())
      .filter((n) => !Number.isNaN(n));
    if (!times.length) return "No data";
    const min = new Date(Math.min(...times));
    const max = new Date(Math.max(...times));
    return `${min.toLocaleDateString()} → ${max.toLocaleDateString()}`;
  }, [records]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        className="flex flex-col gap-4 xl:gap-5 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="px-1 sm:px-2">
          <div className="rounded-2xl border border-white/10 bg-[#0f141b]/65 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="inline-flex min-w-full items-center text-[11px] sm:text-xs text-white/85 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] border-r border-white/10">
                  <Activity size={12} className="text-emerald-300" />
                  <span className="text-white/70">Searches</span>
                  <span className="font-semibold text-white">{total.toLocaleString()}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] border-r border-white/10">
                  <CircleDot size={12} className="text-cyan-300" />
                  <span className="text-white/70">Categories</span>
                  <span className="font-semibold text-white">{uniqueCategories}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] border-r border-white/10">
                  <CalendarClock size={12} className="text-indigo-300" />
                  <span className="text-white/70">Days</span>
                  <span className="font-semibold text-white">{uniqueDays}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] max-w-[360px]">
                  <PieChart size={12} className="text-amber-300 shrink-0" />
                  <span className="text-white/70 shrink-0">Span</span>
                  <span className="font-semibold text-white truncate">{rangeLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0">
          <OverviewCard sharp className="border-b-0">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 dashboard-overview-grid">
              <div className="col-span-12 md:col-span-4 rounded-xl border border-white/10 bg-[#090b11] p-3 sm:p-4 flex flex-col relative overflow-hidden dashboard-donut-pane">
                <div className="pointer-events-none absolute inset-0 z-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`category-cloud-${activeCategory?.id ?? "none"}`}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <WordCloud
                        data={activeCategoryRecords}
                        width={donutCloudSize.width}
                        height={donutCloudSize.height}
                        maxWords={260}
                        minFont={8}
                        maxFont={16}
                        wordOpacity={0.6}
                        rotateProbability={0.2}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    {activeCategory ? (
                      <motion.p
                        key={`active-cat-label-${activeCategory.id}`}
                        className="text-xs text-white/85 truncate"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {getLocalizedCategoryLabel(activeCategory.label, t)} • {activeCategory.value.toLocaleString()} ({activeCategoryShare.toFixed(1)}%)
                      </motion.p>
                    ) : (
                      <p className="text-xs text-white/75">No category data</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoLoopEnabled((v) => !v)}
                    className="shrink-0 px-2 py-1 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-[10px] sm:text-xs text-white/90"
                    title="Toggle automatic category loop"
                  >
                    {autoLoopEnabled ? "Loop: On" : "Loop: Off"}
                  </button>
                </div>

                <div
                  ref={donutCardBodyRef}
                  className="relative z-10 min-h-[250px] md:min-h-[420px] flex-1 flex items-center justify-center overflow-hidden"
                >
                  <DonutChart
                    data={donutCategoryData}
                    size={220}
                    strokeWidth={24}
                    activeCategoryId={activeCategory?.id}
                    unselectedDarken={0.9}
                    unselectedWash={0.3}
                    onHoverCategory={handleSelectDonutCategory}
                    onSelectCategory={handleSelectDonutCategory}
                  />
                </div>
              </div>

              <div className="col-span-12 md:col-span-8 min-h-[420px] max-h-[68vh] overflow-y-auto pr-1 dashboard-bars-pane">
                <MonthCategoryBarChart data={categoryData} />
              </div>
            </div>
          </OverviewCard>
          <OverviewCard
            sharp
            title="Frequent Terms"
            subtitle="Most common words across your searches"
            className=""
          >
            <div className="relative h-[320px] sm:h-[360px] overflow-hidden rounded-xl border border-white/10 bg-[#090b11]">
              <motion.div
                className="absolute inset-y-0 left-0 flex items-center"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 26, ease: "linear", repeat: Infinity }}
              >
                <WordCloud data={records} width={1200} height={320} maxWords={500} />
                <WordCloud data={records} width={1200} height={320} maxWords={500} />
              </motion.div>
            </div>
          </OverviewCard>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @media (min-width: 768px) and (max-width: 1023.98px) and (orientation: portrait) {
            .dashboard-overview-grid .dashboard-donut-pane,
            .dashboard-overview-grid .dashboard-bars-pane {
              grid-column: span 12 / span 12 !important;
            }
          }
        `}</style>

      </motion.div>
    </AnimatePresence>
  );
}
