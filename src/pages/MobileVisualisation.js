import React, { useState } from "react";
import UsageTimelineChart from "../components/UsageTimelineChart";
import TimeDayGrid from "../components/TimeDayGrid";
import { format } from "date-fns";

const MobileVisualisation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Mobile View – Day Grid with Timeline</h2>

      <div className="mb-6">
        <p className="mb-1 font-medium">
          Selected Day: {format(selectedDate, "EEEE, dd MMM yyyy")}
        </p>
        <UsageTimelineChart onDateSelect={setSelectedDate} />
      </div>

      <TimeDayGrid date={selectedDate} />
    </div>
  );
};

export default MobileVisualisation;
