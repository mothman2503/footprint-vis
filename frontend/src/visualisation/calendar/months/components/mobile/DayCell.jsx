import React from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";

const DayCell = React.forwardRef(
  (
    {
      date,
      count = 0,
      bgColor = "",
      selectedStartDate,
      selectedEndDate,
      onSelect,
      isCurrentMonth = true,
      showMonthLabel = false,
      index = 0,
      ...props
    },
    ref
  ) => {
    const isSelected =
      selectedStartDate &&
      selectedEndDate &&
      date.getTime() >= selectedStartDate.getTime() &&
      date.getTime() <= selectedEndDate.getTime();

    return (
      <motion.div
        ref={ref}
        className={clsx(
          "flex flex-col items-end justify-between h-full w-full cursor-pointer border-t-[0.5px] border-[#777] bg-[#222]"
        )}
        title={format(date, "yyyy-MM-dd")}
        onClick={() => onSelect?.(date)}
        {...props}
      >
        <div
          className="flex items-center justify-between w-full p-1"
          style={bgColor ? { background: bgColor } : undefined}
        >
          <button
            className={clsx(
              "text-base w-[30px] aspect-square rounded-full font-semibold flex items-center justify-center",
              isSelected
                ? "bg-white text-black shadow-lg"
                : isCurrentMonth
                ? "text-white"
                : "text-gray-500"
            )}
          >
            {date.getDate()}
          </button>
        </div>
        {showMonthLabel && (
          <span className="text-xs font-bold text-gray-400 transition-opacity duration-300 w-full p-2">
            {format(date, "MMM")}
          </span>
        )}
      </motion.div>
    );
  }
);

export default DayCell;
