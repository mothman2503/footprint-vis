import React from "react";
import { format} from "date-fns";

const TimeDayGrid = ({ date }) => {
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0 to 24

  const dayName = format(date, "EEEE");
  const dayLabel = format(date, "dd MMM");

  return (
    <div className="border rounded shadow overflow-hidden w-[200px]">
      <div className="flex">
        {/* Y Axis */}
        <div className="flex flex-col items-end pr-2 text-sm text-gray-500">
          {hours.map((h) => (
            <div key={h} className="h-[24px] leading-[24px] pr-2">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 border-l">
          
          {/* Grid cells */}
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="h-[24px] border-b border-gray-200 hover:bg-blue-50 transition"
              />
            ))}
          </div>

          {/* Header */}
          <div className="text-center font-semibold border-b bg-gray-100 py-1">
            {dayName}, {dayLabel}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimeDayGrid;
