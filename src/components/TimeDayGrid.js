

import React from "react";
import { format,} from "date-fns";

const TimeDayGrid = ({ date }) => {

  return (
    <div className="h-full w-full border flex-1 overflow-y-auto">
      {/* Scrollable wrapper */}
      <div
        className="relative overflow-y-auto h-full"
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: "80px repeat(1, 1fr)",
          }}
        >
          {/* Time rows - 48 intervals (30 min) */}
          {Array.from({ length: 48 }).map((_, index) => {
            const hour = Math.floor(index / 2);
            const isFullHour = index % 2 === 0;
            return (
              <React.Fragment key={index}>
                <div
                  className="text-center pr-2 text-sm font-medium border-r"
                  style={{
                    height: "40px",
                    lineHeight: "40px",
                  }}
                >
                  {isFullHour ? `${hour.toString().padStart(2, "0")}:00` : ""}
                </div>
                
                <div
                    key={index}
                    className="bg-gray-100 flex flex-col justify-center"
                    style={{ height: "40px" }}

                  >
                    <div className="h-px w-full bg-gray-300" />
                  </div>
              </React.Fragment>
            );
          })}

          {/* Sticky Bottom Labels */}
          <div className="border-r" />
          <div
              key={date.toISOString()}
              className="text-center font-medium bg-white sticky bottom-[-2px] z-10 border-t border-gray-300 py-2"
            >
              {format(date, "EEE dd.MM")}
            </div>
        </div>
      </div>
    </div>
  );
};


export default TimeDayGrid;
