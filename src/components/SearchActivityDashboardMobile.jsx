import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import UsageStripeChartMobile from "./UsageStripeChartMobile";
import DailyCalendarView from "./DailyCalendarView";
import * as d3 from "d3";

const SearchActivityDashboardMobile = () => {
  const [entries, setEntries] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const loadData = async () => {
      const db = await openDB("GoogleActivityApp", 1);
      const all = await db.getAll("searchResults");
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
    <div className="w-full py-6 mx-auto flex flex-col">
      <DailyCalendarView
        entries={entries}
        date={selectedWeek.startDate}
      />

      {/* Add margin-top to separate */}
      <div className="mt-12">
        <UsageStripeChartMobile
          entries={entries}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />
      </div>
    </div>
  );
};

export default SearchActivityDashboardMobile;
