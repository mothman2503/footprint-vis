// DesktopVisualisation.js
import React, { useState } from "react";
import TimeWeekGrid from "../components/TimeWeekGrid";
import UsageTimelineChart from "../components/UsageTimelineChart";

function DesktopVisualisation() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-6">
      <TimeWeekGrid selectedDate={selectedDate} />
      <div className="mb-4 sticky bottom-0 bg-slate-100">
        <UsageTimelineChart onDateSelect={setSelectedDate} />
      </div>
    </div>
  );
}

export default DesktopVisualisation;
