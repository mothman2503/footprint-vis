import React, { useState } from "react";
import { addWeeks, format } from "date-fns";
import TimeWeekGrid from "./TimeWeekGrid";

const WeekSlider = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date(); // today
  const startDate = format(addWeeks(baseDate, weekOffset), "yyyy-MM-dd");

  return (
    <div className="p-6">
      <div className="mb-4">
        <label className="block mb-2 font-medium">Week Offset: {weekOffset}</label>
        <input
          type="range"
          min={-10}
          max={10}
          value={weekOffset}
          onChange={(e) => setWeekOffset(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <TimeWeekGrid startDate={startDate} />
    </div>
  );
};

export default WeekSlider;
