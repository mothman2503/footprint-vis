// VisualisationPage.js

// React & hooks
import { useEffect, useRef, useState, useMemo } from "react";

// Third-party libs
import { AnimatePresence, motion } from "framer-motion";
import { toZonedTime, format } from "date-fns-tz";

// App context
import { useDataset } from "../app/providers";
import sampleDataset from "../assets/constants/sample-datasets/classified_records_OvGU.json";

import sampleDataset2 from "../assets/constants/sample-datasets/billy_search_history_custom_iab.json";

// Utility functions
import { classifyQueries } from "../utils/classify";
import { getDB, DB_CONSTANTS } from "../utils/db";

// Shared components
import MovableViewMenu from "../shared/components/MovableViewMenu";
import ClassificationControls from "../features/visualisation/ClassificationControls";
import DatasetToolbar from "../features/visualisation/DatasetToolbar";
import Legend from "../features/visualisation/Legend";

// Visualisation views
import ViewContentSwitcher from "../features/visualisation/ViewContentSwitcher";

function buildSearchCounts(records) {
  const counts = {};
  const timeZone = "Europe/Berlin";
  for (const rec of records) {
    const date = new Date(rec.timestamp);
    if (isNaN(date.getTime())) continue;
    const zonedDate = toZonedTime(date, timeZone);
    const key = format(zonedDate, "yyyy-MM-dd", { timeZone });
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

const VisualisationPage = () => {
  const { dataset, setDataset } = useDataset();

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [numDays, setNumDays] = useState(1);
  const [viewMode, setViewMode] = useState("By Day");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classificationProgress, setClassificationProgress] = useState(0);
  const [showGridLoading, setShowGridLoading] = useState(false);
  const [classificationPreview, setClassificationPreview] = useState(null);
  const [savedDatasets, setSavedDatasets] = useState([]);
  const [sampleDatasets, setSampleDatasets] = useState([]);

  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const updateDays = () => {
      const width = window.innerWidth;
      const estimatedDays =
        width <= 768 ? 1 : Math.max(1, Math.floor(width / 300));
      setNumDays(estimatedDays);
    };
    updateDays();
    window.addEventListener("resize", updateDays);
    return () => window.removeEventListener("resize", updateDays);
  }, []);

  useEffect(() => {
    const fetchDatasets = async () => {
      const db = await getDB();
      const saved = await db.getAll("savedDatasets");

      setSavedDatasets(
        saved.map((d) => ({
          source: "saved",
          label: d.label,
          records: d.records,
          date: d.date,
        }))
      );

      // Add any additional sample datasets as needed
      setSampleDatasets([
        {
          source: "sample",
          label: "OvGU Sample Dataset",
          records: sampleDataset,
        },
        {
          source: "sample",
          label: "Billy",
          records: sampleDataset2,
        },
      ]);
    };

    fetchDatasets();
  }, []);

  useEffect(() => {
    if (viewMode === "monthGrid") {
      setShowGridLoading(true);
      const timer = setTimeout(() => setShowGridLoading(false), 200); // slight delay for perceived speed
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const searchCounts = useMemo(() => {
    if (!dataset?.records) return {};
    return buildSearchCounts(dataset.records);
  }, [dataset?.records]);

  const stopProgress = (value = 0) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setClassificationProgress(value);
  };

  const startProgress = () => {
    stopProgress(10);
    progressIntervalRef.current = setInterval(() => {
      setClassificationProgress((prev) => Math.min(prev + 7, 90));
    }, 400);
  };

  useEffect(() => {
    return () => stopProgress();
  }, []);

  const handleClassify = async () => {
    setLoading(true);
    startProgress();
    try {
      const queries = dataset.records.map((r) => r.query).filter(Boolean);
      const results = await classifyQueries(queries);
      setClassificationPreview(results);
    } catch (err) {
      console.error("\u274c Classification failed:", err);
      alert("Classification failed.");
    } finally {
      stopProgress(100);
      setLoading(false);
      setShowDialog(false);
      setTimeout(() => stopProgress(0), 400);
    }
  };

  const applyClassification = async () => {
    const updatedRecords = dataset.records.map((rec) => {
      const match = classificationPreview.find((r) => r.query === rec.query);
      return match ? { ...rec, category: match.category } : rec;
    });

    const db = await getDB();

    if (dataset.source === "user") {
      // Update the primary searchResults store
      const tx = db.transaction(DB_CONSTANTS.STORE_NAME, "readwrite");
      const store = tx.objectStore(DB_CONSTANTS.STORE_NAME);
      for (const rec of updatedRecords) {
        if (rec.id !== undefined) await store.put(rec);
      }
      await tx.done;
    } else if (dataset.source === "saved") {
      // Update the saved dataset entry by label/name
      const saved = await db.getAll(DB_CONSTANTS.STORE_NAME_SAVED);
      const found = saved.find(
        (d) => d.label === dataset.label || d.name === dataset.label
      );
      if (found) {
        await db.put(DB_CONSTANTS.STORE_NAME_SAVED, {
          ...found,
          label: found.label || found.name, // normalize
          records: updatedRecords,
          date: new Date().toISOString(),
        });
      }
    }

    setDataset({ ...dataset, records: updatedRecords });
    setClassificationPreview(null);
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col max-h-dvh"
      style={{}}
    >
      <MovableViewMenu viewMode={viewMode} setViewMode={setViewMode} />
      <div className="fixed top-0 z-40 w-full">
        <DatasetToolbar
          datasetLabel={dataset?.label}
          savedDatasets={savedDatasets}
          sampleDatasets={sampleDatasets}
          onSetDataset={(ds) => ds && setDataset(ds)}
          onStartClassification={() => setShowDialog(true)}
          promptOpen={!dataset?.records?.length}
        />
      </div>

      {!dataset?.records?.length ? (
        <p className="text-white text-center mt-28 text-lg">
          ⚠️ No dataset selected. Please choose or upload one above to begin.
        </p>
      ) : (
        <>
          <ClassificationControls
            showDialog={showDialog}
            setShowDialog={setShowDialog}
            loading={loading}
            progress={classificationProgress}
            onClassify={handleClassify}
            preview={classificationPreview}
            onApply={applyClassification}
            onCancel={() => setClassificationPreview(null)}
          />

          <div className="flex-grow h-[100dvh] min-h-0 flex flex-col overflow-hidden pt-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode + showGridLoading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-grow overflow-auto relative"
              >
                <ViewContentSwitcher
                  viewMode={viewMode}
                  showGridLoading={showGridLoading}
                  dataset={dataset}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  numDays={numDays}
                  setViewMode={setViewMode}
                  searchCounts={searchCounts}
                />
              </motion.div>
            </AnimatePresence>

            <div className="shadow-up">
              <Legend />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VisualisationPage;
