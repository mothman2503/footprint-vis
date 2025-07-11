import { useEffect, useRef, useState } from "react";
import { useDataset } from "../DataContext";
import DynamicCalendarView from "./calendar/DynamicCalendarView";
import DatePicker from "./DatePicker";
import MonthGridPanel from "./MonthGridPanel"; // new
import Legend from "./Legend";

const Visualisation = () => {
  const { dataset } = useDataset();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [numDays, setNumDays] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const estimatedDays = width <= 768 ? 1 : Math.max(1, Math.floor(width / 300));
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
    <div ref={containerRef} className="flex flex-col h-screen overflow-hidden">
      {/* Month calendar view – fully expanded above all */}
      {calendarOpen && (
        <MonthGridPanel
          startDate={selectedDate}
          onSelectDate={setSelectedDate}
          numDays={numDays}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* 1. Dynamic, expandable calendar view */}
      <div className="flex-grow min-h-0 overflow-hidden">
        <DynamicCalendarView startDate={selectedDate} entries={dataset.records} numDays={numDays} />
      </div>

      {/* 2. Fixed-height legend */}
      <Legend />

      {/* 3. Date picker trigger (below all) */}
      <div className="flex justify-center py-3">
        <DatePicker
          startDate={selectedDate}
          onToggle={() => setCalendarOpen(prev => !prev)}
          numDays={numDays}
        />
      </div>
    </div>
  );
};

export default Visualisation;
