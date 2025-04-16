import React, { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";

const TimeWeekGrid = ({ selectedDate, markers = [] }) => {
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });

    const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
        addDays(startDate, i)
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
            <div className="relative overflow-y-auto h-full">
                <div
                    className="grid gap-0"
                    style={{
                        gridTemplateColumns: "80px 30px repeat(7, 1fr) 30px",
                    }}
                >
                    {/* Time rows - 48 intervals (30 min) */}
                    {Array.from({ length: 48 }).map((_, index) => {
                        const hour = Math.floor(index / 2);
                        const isFullHour = index % 2 === 0;
                        return (
                            <React.Fragment key={index}>
                                <div
                                    className="text-center pr-2 text-sm font-medium border-r h-6"
                                    style={{
                                        lineHeight: "40px",
                                    }}
                                >
                                    {isFullHour ? `${hour.toString().padStart(2, "0")}:00` : ""}
                                </div>

                                <div className="bg-gray-100" />
                                {daysOfWeek.map((_, colIndex) => {
                                    const key = `${index}-${colIndex}`;

                                    return (
                                        <div
                                            key={key}
                                            className="border-r px-2 bg-gray-100 flex justify-center items-center overflow-hidden h-6"
                                        >
                                            <div className="flex overflow-y-hidden justify-start box-content overflow-x-scroll scrollbar-hide h-full w-full items-center space-x-1">
                                                {(() => {
                                                    const dateKey = daysOfWeek[colIndex].toISOString().split("T")[0];
                                                    console.log("Cell dateKey:", dateKey, "row index:", index);

                                                    const hits = groupedByDateAndRow[dateKey]?.[index] || [];

                                                    return hits.map((hit, idx) => (
                                                        (hit.favicon) ? (<img
                                                            key={`${dateKey}-${index}-${idx}`}
                                                            src={hit.favicon}
                                                            title={hit.title}
                                                            alt=""
                                                            className="w-3 h-3" />
                                                        )
                                                            :

                                                            (<div
                                                                key={`${dateKey}-${index}-${idx}`}
                                                                className="w-2 h-2 bg-indigo-500 rounded-full" />
                                                            )
                                                    ));
                                                })()}
                                            </div>


                                        </div>
                                    );
                                })}
                                <div className="bg-gray-100" />

                            </React.Fragment>
                        );
                    })}

                    {/* Sticky Bottom Labels */}
                    <div className="border-r" />
                    <div className="text-center font-medium bg-white sticky bottom-0 z-10 border-t border-gray-300 py-2"> ◀ </div>

                    {daysOfWeek.map((day) => (
                        <div
                            key={day.toISOString()}
                            className="text-center font-medium bg-white sticky bottom-0 z-10 border-t border-gray-300 py-2"
                        >
                            {format(day, "EEE dd.MM")}
                        </div>
                    ))}
                    <div className="text-center font-medium bg-white sticky bottom-0 z-10 border-t border-gray-300 py-2">
                        ▶
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TimeWeekGrid;
