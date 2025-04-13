// DesktopVisualisation.js
import React, { useState } from "react";
import TimeWeekGrid from "../components/TimeWeekGrid";
import UsageTimelineChart from "../components/UsageTimelineChart";

function DesktopVisualisation() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-6">
      <TimeWeekGrid selectedDate={selectedDate} />
      <div className="mb-4">
        <h2 className="font-medium mb-2">Usage Timeline (Click to Select Week)</h2>
        <UsageTimelineChart onDateSelect={setSelectedDate} />
      </div>
    </div>
  );
}

export default DesktopVisualisation;
