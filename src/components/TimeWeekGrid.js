// components/TimeWeekGrid.js
import React from "react";
import { format, startOfWeek, addDays } from "date-fns";

const TimeWeekGrid = ({ selectedDate }) => {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    addDays(startDate, i)
  );

  return (
    <div className="border p-4">
      <div className="grid grid-cols-8 gap-2">
        {/* Time rows */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2">{`${hour
              .toString()
              .padStart(2, "0")}:00`}</div>
            {daysOfWeek.map((_, i) => (
              <div
                key={`${hour}-${i}`}
                className="h-4 border bg-gray-100"
              ></div>
            ))}
          </React.Fragment>
        ))}

        {/* Bottom labels */}
        <div></div>
        {daysOfWeek.map((day) => (
          <div key={day.toISOString()} className="text-center font-medium">
            {format(day, "EEE dd.MM")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeWeekGrid;
