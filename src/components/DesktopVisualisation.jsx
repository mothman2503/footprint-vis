import React, { useEffect, useState } from "react";
import UsageStripeChart from "./visualisation_tools/UsageStripeChart";
import WeeklyCalendarView from "./visualisation_tools/WeeklyCalendarView";
import * as d3 from "d3";
import { getDB, DB_CONSTANTS } from "../utils/db";
import { IAB_CATEGORIES } from "../constants/iabCategories";

const DesktopVisualisation = ({ entries }) => {
  const [selectedWeek, setSelectedWeek] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (!entries.length) return;

    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const lastDate = new Date(sorted[sorted.length - 1].timestamp);
    const startDate = d3.timeDay.offset(d3.timeDay.floor(lastDate), -6);
    const endDate = d3.timeDay.floor(lastDate);
    setSelectedWeek({ startDate, endDate });
  }, [entries]);

  const handleUpdatePointCategory = async (point, newCategoryId) => {
    const updatedCategory = IAB_CATEGORIES.find(
      (cat) => cat.id === newCategoryId
    );
    if (!updatedCategory || !point?.id) return;

    const db = await getDB();
    const entry = await db.get(DB_CONSTANTS.STORE_NAME, point.id);
    if (!entry) return;

    const updatedEntry = { ...entry, category: updatedCategory };
    await db.put(DB_CONSTANTS.STORE_NAME, updatedEntry);
  };

  if (!entries.length || !selectedWeek.startDate || !selectedWeek.endDate) {
    return <p className="mt-6 text-gray-500">No data loaded.</p>;
  }

  return (
    <div className="w-full mx-auto flex flex-col">
      <WeeklyCalendarView
        entries={entries}
        startDate={selectedWeek.startDate}
        endDate={selectedWeek.endDate}
        onCategoryChange={handleUpdatePointCategory}
      />

      <div className="mt-12">
        <UsageStripeChart
          entries={entries}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />
      </div>
    </div>
  );
};

export default DesktopVisualisation;
