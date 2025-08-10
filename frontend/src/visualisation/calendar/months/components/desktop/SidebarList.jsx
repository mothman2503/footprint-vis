import React, { useRef, useEffect } from "react";
import clsx from "clsx";
import { format } from "date-fns";

const SidebarList = ({ monthSummaries, currentMonth, onClick }) => {
  const maxCount = Math.max(
    ...Object.values(monthSummaries).map((m) => m.searchCount || 0)
  );

  const scrollRef = useRef();
  const currentRef = useRef();

  // Center current month on mount/update
  useEffect(() => {
    if (scrollRef.current && currentRef.current) {
      const container = scrollRef.current;
      const target = currentRef.current;
      const offset =
        target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
      container.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [currentMonth]);

  return (
    <div className="relative">
      {/* Vignette Overlays */}
      <div className="absolute top-0 left-0 w-full h-6 pointer-events-none bg-gradient-to-b from-[#1b1f24] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-6 pointer-events-none bg-gradient-to-t from-[#1b1f24] to-transparent z-10" />

      <div
        ref={scrollRef}
        className="flex flex-col pr-1 py-4 border-r border-[#444] bg-[#1b1f24] max-h-full overflow-y-auto scrollbar-hide relative z-0"
      >
        {Object.entries(monthSummaries).map(([key, summary]) => {
          const count = summary.searchCount;
          const intensity = count > 0 ? 0.1 + 0.9 * (count / maxCount) : 0.01;
          const bg = `rgba(255, 255, 255, ${intensity.toFixed(2)})`;
          const label =
            format(summary.date, "MMM").charAt(0) + format(summary.date, "yy");

          return (
            <button
              key={key}
              ref={key === currentMonth ? currentRef : null}
              onClick={() => onClick?.(key)}
              className={clsx(
                `text-xs font-bold pr-1 py-1 rounded-tr rounded-br transition text-center flex gap-1 justify-between`,
                key === currentMonth
                  ? "bg-white text-black shadow"
                  : "text-white"
              )}
            >
              <div className="w-4 h-4 rounded-full relative right-2 bg-[#1b1f24]">
                <div
                  className="w-4 h-4 rounded-full right-2 border-[0.5px] border-[#1b1f24]"
                  style={{ backgroundColor: bg }}
                />
              </div>
              <p
                className={clsx(
                  "text-xs font-bold text-center  justify-between",
                  key === currentMonth ? "text-black shadow" : "text-white"
                )}
              >
                {label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarList;
