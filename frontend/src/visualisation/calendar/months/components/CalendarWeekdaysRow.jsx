import React from "react";

const CalendarWeekdaysRow = () => {
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="grid grid-cols-7 text-sm font-medium text-indigo-200 border-b border-[#777] bg-[#1e2626] z-30">
      {weekdayLabels.map((d) => (
        <div key={d} className="p-2 text-center">
          {d}
        </div>
      ))}
    </div>
  );
};

export default CalendarWeekdaysRow;
