import React from "react";

const DayCell = ({ date, annotation, isCurrentMonth, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(date)}
      className={`flex flex-col items-center justify-center border p-2 rounded-md cursor-pointer transition-all ${
        isCurrentMonth ? "bg-white text-black" : "bg-gray-100 text-gray-400"
      } hover:bg-blue-100`}
    >
      <div className="font-semibold">{date.getDate()}</div>
      {annotation && (
        <div className="text-xs text-blue-500 mt-1">{annotation}</div>
      )}
    </div>
  );
};

export default DayCell;
