import React, { useState,  useMemo } from "react";
import UsageTimelineChart from "../components/UsageTimelineChart";
import TimeDayGrid from "../components/TimeDayGrid";

import { getDay, getHours, getMinutes } from "date-fns";

const MobileVisualisation = ({ rawJson }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Create markers
    const markers = useMemo(() => {
      if (!rawJson || !rawJson["Browser History"]) return [];
  
      return rawJson["Browser History"]
        .filter((entry) => entry.time_usec) // avoid broken entries
        .map((entry) => {
          const date = new Date(Number(entry.time_usec) / 1000); // microseconds to ms
  
          // Calculate the row and dayIndex based on the specific date and time
          const dayIndex = getDay(date); // Get the day index (0-6, with Monday as 0)
          const row = getHours(date) * 2 + (getMinutes(date) >= 30 ? 1 : 0); // Convert time to 30-minute intervals
  
          // Here we use the date object as part of the key to differentiate between Mondays on different weeks
          return {
            row,
            dayIndex,
            date, // Store the full date object for later reference
            uniqueKey: `${date.toISOString()}-${row}`, // Include the full date and row to ensure uniqueness
            favicon: entry.favicon_url,
            title: entry.title,
          };
        });
              // eslint-disable-next-line
    }, [rawJson, selectedDate]);

  return (
    <div className="h-[calc(100dvh-100px)] w-full flex flex-col">
      {/* Main content: grows and scrolls */}
      <div className="flex-1 min-h-0 overflow-auto">
      <TimeDayGrid date={selectedDate} markers={markers}/>
      </div>

      {/* Fixed height chart at bottom */}
      <div className="h-[100px] bg-slate-100">
      <UsageTimelineChart onDateSelect={setSelectedDate} markers={markers}/>
      </div>
    </div>
  );

};

export default MobileVisualisation;
