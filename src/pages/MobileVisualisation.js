import React, { useState } from "react";
import UsageTimelineChart from "../components/UsageTimelineChart";
import TimeDayGrid from "../components/TimeDayGrid";

const MobileVisualisation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());


  return (
    <div className="h-[calc(100dvh-100px)] w-full flex flex-col">
      {/* Main content: grows and scrolls */}
      <div className="flex-1 min-h-0 overflow-auto">
      <TimeDayGrid date={selectedDate} />
      </div>

      {/* Fixed height chart at bottom */}
      <div className="h-[100px] bg-slate-100">
      <UsageTimelineChart onDateSelect={setSelectedDate} />
      </div>
    </div>
  );

};

export default MobileVisualisation;
