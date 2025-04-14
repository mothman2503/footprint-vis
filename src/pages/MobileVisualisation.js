import React, { useState } from "react";
import UsageTimelineChart from "../components/UsageTimelineChart";
import TimeDayGrid from "../components/TimeDayGrid";

const MobileVisualisation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-4 overflow-x-auto">
      <TimeDayGrid date={selectedDate} />
      <div className="mb-6 sticky bottom-0 bg-slate-100 overflow-x-auto">
        <UsageTimelineChart onDateSelect={setSelectedDate} />
      </div>
    </div>
  );
};

export default MobileVisualisation;
