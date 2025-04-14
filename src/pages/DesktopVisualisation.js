// DesktopVisualisation.js
import React, { useState } from "react";
import TimeWeekGrid from "../components/TimeWeekGrid";
import UsageTimelineChart from "../components/UsageTimelineChart";

function DesktopVisualisation() {
    const [selectedDate, setSelectedDate] = useState(new Date());
  
    return (
      <div className="h-[calc(100dvh-80px)] w-full flex flex-col">
        {/* Main content: grows and scrolls */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TimeWeekGrid selectedDate={selectedDate} />
        </div>
  
        {/* Fixed height chart at bottom */}
        <div className="h-[100px] bg-slate-100">
          <UsageTimelineChart onDateSelect={setSelectedDate} selectedDate={selectedDate} />
        </div>
      </div>
    );
  }
  

export default DesktopVisualisation;
