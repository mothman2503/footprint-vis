import React from "react";
import clsx from "clsx";
import ProportionalBarChartDiv from "../../../../charts/ProportionalBarChart";
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
      categoryData,
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

    const bounceDelay = isSelected ? (index % 10) * 0.09 : 0;

    return (
      <motion.div
        ref={ref}
        className={clsx(
          "flex flex-col items-start justify-between aspect-[16/8] min-h-[80px] w-full p-2 cursor-pointer border-t border-b border-t-[#98a34d] border-b-[#98a34d] border-r-[0.5px] border-r-[#444]",
          showMonthLabel ? " border-l-[4px] border-l-[#aaa]" : " border-l-[0.5px] border-l-[#444]",
        )}
        onClick={() => {onSelect?.(date);}}
        animate={isSelected ? { y: [0, -2, -0.4] } : { y: 0 }}
        transition={
          isSelected
            ? {
                repeat: Infinity,
                repeatType: "loop",
                duration: 1,
                delay: bounceDelay,
                ease: "easeInOut",
              }
            : {}
        }
        {...props}
      >
        {!(isSelected || isCurrentMonth) && (
          <div className="absolute inset-0 z-10 backdrop-blur-[4px]" />
        )}

        <div className="flex items-center justify-between w-full">
          <button
            className={clsx(
              "text-base h-[25px] p-auto  aspect-square rounded-full font-semibold flex items-center justify-center z-10",
              isSelected
                ? "bg-white text-black"
                : isCurrentMonth
                ? "text-white"
                : "text-gray-600"
            )}
          >
            {date.getDate()}
          </button>

          {showMonthLabel && (
            <span className="text-sm font-bold text-gray-100 transition-opacity duration-300 pr-2 z-10">
              {format(date, "MMM")}
            </span>
          )}
        </div>

        {count > 0 && (
          <p className="flex gap-2 text-xs items-center text-[#aaa] z-10 w-full truncate">
            <div
              className="w-2 h-2 aspect-square rounded-full"
              style={bgColor ? { background: bgColor } : undefined}
            />
            {count + " Searches"}
          </p>
        )}

        {(isCurrentMonth || isSelected) && (
          <div className="opacity-90 w-full mb-1 z-0" style={!isCurrentMonth? {opacity: "0.6"} : {}}>
            <ProportionalBarChartDiv data={categoryData} height={5} />
          </div>
        )}
      </motion.div>
    );
  }
);

export default DayCell;
