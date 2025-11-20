// components/calendar/months/mobile/DayCell.jsx
import React from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ProportionalBarChartDiv from "../../../../charts/ProportionalBarChart";

const DayCell = React.forwardRef(
  (
    {
      date,
      barSize = 50,
      count = 0,
      bgColor = "",
      selectedStartDate,
      selectedEndDate,
      onSelect,
      isCurrentMonth = true,
      showMonthLabel = false,
      index = 0,
      categoryData,
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
          "flex flex-col border-l-[0.5px] border-l-[#444] items-start justify-between h-full w-full cursor-pointer border-t ",
          isCurrentMonth ? " border-t-[#98a34d] " : "  border-t-[#4c5226] "
        )}
        title={format(date, "yyyy-MM-dd")}
        onClick={() => {
          onSelect?.(date);
        }}
        {...props}
      >
        <div className="flex items-center justify-between w-full p-1">
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
        {count !== 0 && isCurrentMonth && (
          <div className="w-full py-0 ">
            <motion.div
              className=" min-w-[50%] pb-2"
              style={{ width: `${barSize}%`, originX: 0 }}
              initial={{ opacity: 0, scaleX: 0 }} // start invisible and collapsed horizontally
              animate={{ opacity: 1, scaleX: 1 }} // fade in and grow to full width
              exit={{ opacity: 0, scaleX: 0 }} // optional for AnimatePresence
              transition={{ duration: 0.4, ease: "easeOut" }} // smooth timing
            >
              <ProportionalBarChartDiv leftFlat data={categoryData} height={5} />
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }
);

export default DayCell;
