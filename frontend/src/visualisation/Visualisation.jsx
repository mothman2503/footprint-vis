import { useEffect, useRef, useState } from "react";
import { useDataset } from "../DataContext";
import DynamicCalendarView from "./calendar/DynamicCalendarView";
import DatePicker from "./DatePicker";
import MonthGridPanel from "./MonthGridPanel";
import Legend from "./Legend";

const Visualisation = () => {
  const { dataset } = useDataset();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [numDays, setNumDays] = useState(1);
  const [viewMode, setViewMode] = useState("calendar"); // can be: 'calendar', 'monthGrid', 'view3', 'view4'
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const estimatedDays =
        width <= 768 ? 1 : Math.max(1, Math.floor(width / 300));
      setNumDays(estimatedDays);
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!dataset?.records?.length) {
    return (
      <p className="text-white text-center mt-10">
        ⚠️ No dataset selected. Please select or upload a dataset.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen overflow-hidden relative"
    >
      {/* 🧭 Simple Navigation Menu (top-right) */}
      <div className="absolute top-4 right-4 z-50 bg-black bg-opacity-60 text-white rounded shadow-lg">
        {["calendar", "monthGrid", "view3", "view4"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 block text-left w-full hover:bg-white hover:text-black ${
              viewMode === mode ? "bg-white text-black font-bold" : ""
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 🖼️ Visualisation area */}
      <div className="flex-grow min-h-0 overflow-hidden">
        {viewMode === "monthGrid" ? (
          <MonthGridPanel
            startDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            numDays={numDays}
            onClose={() => setViewMode("calendar")}
          />
        ) : viewMode === "calendar" ? (
          <>
              <DynamicCalendarView
                startDate={selectedDate}
                entries={dataset.records}
                numDays={numDays}
              />
            <Legend />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white text-xl">
            Placeholder for {viewMode}
          </div>
        )}
      </div>

      {/* 📅 Date Picker */}
      <div className="flex justify-center py-3 bg-black bg-opacity-80">
        <DatePicker
          startDate={selectedDate}
          onToggle={() =>
            setViewMode((prev) =>
              prev === "monthGrid" ? "calendar" : "monthGrid"
            )
          }
          numDays={numDays}
        />
      </div>
    </div>
  );
};

export default Visualisation;
