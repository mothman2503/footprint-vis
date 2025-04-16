import React, { useMemo } from "react";
import { format, addDays } from "date-fns";

const TimeDayGrid = ({ date, markers = [] }) => {
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    addDays(date, i)
  );

  const groupedByDateAndRow = useMemo(() => {
    const grouped = {};

    markers.forEach(({ row, date, ...rest }) => {
      const dateKey = new Date(date).toISOString().split("T")[0];

      if (!grouped[dateKey]) grouped[dateKey] = {};
      if (!grouped[dateKey][row]) grouped[dateKey][row] = [];

      grouped[dateKey][row].push(rest);
    });

    return grouped;
  }, [markers]);

  return (
    <div className="h-full w-full border flex-1 overflow-y-auto">
      {/* Scrollable wrapper */}
      <div
        className="relative overflow-y-auto h-full"
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: "80px 20px repeat(1, 1fr) 20px",
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
                <div className="bg-gray-100" />

                <div
                  key={index}
                  className="bg-gray-100 flex flex-col justify-center"
                  style={{ height: "40px" }}
                >
                  {(() => {
                    const dateKey = daysOfWeek[0].toISOString().split("T")[0];
                    const hits = groupedByDateAndRow[dateKey]?.[index] || [];

                    return (
                      <div
                        className="border-r px-2 bg-gray-100 flex justify-center items-center overflow-hidden h-full"
                      >
                        <div className="flex overflow-y-hidden justify-start box-content overflow-x-scroll scrollbar-hide h-full w-full items-center space-x-1">
                          {hits.map((hit, idx) =>
                            <img
                              key={`${dateKey}-${index}-${idx}`}
                              src={hit.favicon}
                              title={hit.title}
                              alt=""
                              className="w-3 h-3 bg-indigo-500"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-gray-100" />

              </React.Fragment>
            );
          })}

          {/* Sticky Bottom Labels */}
          <div className="border-r" />
          <div className="text-center font-medium bg-white sticky bottom-[-2px] z-10 border-t border-gray-300 py-2"> ◀ </div>
          <div
            key={date.toISOString()}
            className="text-center font-medium bg-white sticky bottom-[-2px] z-10 border-t border-gray-300 py-2"
          >
            {format(date, "EEE dd.MM")}
          </div>
          <div className="text-center font-medium bg-white sticky bottom-[-2px] z-10 border-t border-gray-300 py-2">
            ▶
          </div>

        </div>
      </div>
    </div>
  );
};


export default TimeDayGrid;
