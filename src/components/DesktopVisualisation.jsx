import React, { useEffect, useState } from "react";
import {getDB, DB_CONSTANTS } from '../utils/db';
import UsageStripeChart from "./visualisation_tools/UsageStripeChart";
import WeeklyCalendarView from "./visualisation_tools/WeeklyCalendarView";
import * as d3 from "d3";

const SearchActivityDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const loadData = async () => {
      const db = await getDB();
const all = await db.getAll(DB_CONSTANTS.STORE_NAME);

      const sorted = all.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setEntries(sorted);

      if (sorted.length) {
        const lastDate = new Date(sorted[sorted.length - 1].timestamp);
        const startDate = d3.timeDay.offset(d3.timeDay.floor(lastDate), -6);
        const endDate = d3.timeDay.floor(lastDate);
        setSelectedWeek({ startDate, endDate });
      }
    };

    loadData();
  }, []);

  if (!entries.length) {
    return <p className="mt-6 text-gray-500">No data loaded.</p>;
  }

  return (
    <div className="w-full mx-auto flex flex-col">
      <WeeklyCalendarView
        entries={entries}
        startDate={selectedWeek.startDate}
        endDate={selectedWeek.endDate}
      />

      {/* Add margin-top to separate */}
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

export default SearchActivityDashboard;
