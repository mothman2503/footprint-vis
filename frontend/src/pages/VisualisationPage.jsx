import { useEffect, useRef, useState } from "react";
import { useDataset } from "../DataContext";
import DynamicCalendarView from "../visualisation/calendar/DynamicCalendarView";
import DatePicker from "../visualisation/DatePicker";
import { IAB_CATEGORIES } from "../assets/constants/iabCategories";
import MonthGridPanel from "../visualisation/MonthGridPanel";
import Legend from "../visualisation/Legend";
import DonutChart from "../visualisation/donut/DonutChart";
import { classifyQueries } from "../utils/classify";
import { getDB, DB_CONSTANTS } from "../utils/db";
import Toolbar from "../components/Toolbar";
import ClassificationDialog from "../components/ClassificationDialog";
import ClassificationPreview from "../components/ClassificationPreview";
import { AnimatePresence, motion } from "framer-motion";

function buildSearchCounts(records) {
  const counts = {};
  for (const rec of records) {
    const date = new Date(rec.timestamp);
    if (isNaN(date.getTime())) continue;
    const key = date.toISOString().split("T")[0];
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

const VisualisationPage = () => {
  const { dataset, setDataset } = useDataset();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [numDays, setNumDays] = useState(1);
  const [viewMode, setViewMode] = useState("calendar");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classificationPreview, setClassificationPreview] = useState(null);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDays = () => {
      const width = window.innerWidth;
      const estimatedDays = width <= 768 ? 1 : Math.max(1, Math.floor(width / 300));
      setNumDays(estimatedDays);
    };
    updateDays();
    window.addEventListener("resize", updateDays);

    const fetchDatasets = async () => {
      const db = await getDB();
      const all = await db.getAll("savedDatasets");
      setAvailableDatasets(all);
    };
    fetchDatasets();

    return () => window.removeEventListener("resize", updateDays);
  }, []);

  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  const handleClassify = async () => {
    setLoading(true);
    try {
      const recordsToClassify = dataset.records;
      const queries = recordsToClassify.map((r) => r.query).filter(Boolean);
      if (queries.length === 0) {
        alert("No queries found.");
        return;
      }
      const results = await classifyQueries(queries);
      setClassificationPreview(results);
    } catch (err) {
      console.error("\u274c Classification failed:", err);
      alert("Classification failed.");
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  const applyClassification = async () => {
    const updatedRecords = dataset.records.map((rec) => {
      const match = classificationPreview.find((r) => r.query === rec.query);
      if (match) {
        return {
          ...rec,
          category: match.category,
        };
      }
      return rec;
    });

    const db = await getDB();
    const tx = db.transaction(DB_CONSTANTS.STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_CONSTANTS.STORE_NAME);
    for (const rec of updatedRecords) {
      if (rec.id !== undefined) {
        await store.put(rec);
      }
    }
    await tx.done;

    if (dataset.source === "saved") {
      const allSaved = await db.getAll("savedDatasets");
      const current = allSaved.find((d) => d.name === dataset.label);
      if (current) {
        await db.put("savedDatasets", {
          ...current,
          label: dataset.label,
          records: updatedRecords,
          date: new Date().toISOString(),
        });
      }
    }

    setDataset({ ...dataset, records: updatedRecords });
    setClassificationPreview(null);
  };

  if (!dataset?.records?.length) {
    return <p className="text-white text-center mt-10">⚠️ No dataset selected. Please select or upload a dataset.</p>;
  }

  const searchCounts = buildSearchCounts(dataset.records);

  return (
    <div ref={containerRef} className="flex w-full flex-col" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
      <div className="absolute top-16 opacity-20 hover:opacity-80 right-4 z-50 bg-black bg-opacity-60 text-white rounded shadow-lg">
        {["calendar", "monthGrid", "donutChart", "view4"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 block text-left w-full hover:bg-white hover:text-black ${viewMode === mode ? "bg-white text-black font-bold" : ""}`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="fixed top-0 z-40 w-full">
        <Toolbar
          datasetLabel={dataset?.label}
          datasets={availableDatasets}
          onSelectDataset={async (label) => {
            const db = await getDB();
            const all = await db.getAll("savedDatasets");
            const selected = all.find((d) => d.label === label);
            if (selected) {
              setDataset({ source: "saved", label: selected.label, records: selected.records });
            }
          }}
          onStartClassification={() => setShowDialog(true)}
        />
      </div>

      <ClassificationDialog open={showDialog} onClose={() => setShowDialog(false)} onClassify={handleClassify} loading={loading} />

      {classificationPreview && (
        <ClassificationPreview
          results={classificationPreview}
          onApply={applyClassification}
          onCancel={() => setClassificationPreview(null)}
        />
      )}

      <div className="flex-grow min-h-0 flex flex-col overflow-hidden pt-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-grow overflow-auto"
          >
            {viewMode === "monthGrid" ? (
              <MonthGridPanel
                startDate={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
                numDays={numDays}
                searchCounts={searchCounts}
                onClose={() => setViewMode("calendar")}
                records={dataset.records}
              />
            ) : viewMode === "calendar" ? (
              <DynamicCalendarView
                startDate={selectedDate}
                entries={dataset.records}
                numDays={numDays}
              />
            ) : viewMode === "donutChart" ? (
              <DonutChart
                data={Object.entries(dataset.records.reduce((acc, rec) => {
                  const key = rec.category?.id || "uncategorized";
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})).map(([id, value]) => {
                  const cat = IAB_CATEGORIES.find((c) => c.id === id);
                  return {
                    label: cat?.name || "Uncategorized",
                    color: cat?.color || "#888",
                    value,
                  };
                })}
                size={200}
                strokeWidth={30}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-white text-xl">
                Placeholder for {viewMode}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="shadow-up">
          <Legend />
        </div>
      </div>

      <div className="flex justify-center py-3 bg-black bg-opacity-80">
        <DatePicker
          startDate={selectedDate}
          onToggle={() => setViewMode((prev) => (prev === "monthGrid" ? "calendar" : "monthGrid"))}
          numDays={numDays}
        />
      </div>
    </div>
  );
};

export default VisualisationPage;
