import React, { useRef, useEffect } from "react";
import clsx from "clsx";
import { format } from "date-fns";

export default function OverviewStrip({ monthSummaries, currentMonth, onClick }) {
  const maxCount = Math.max(
    ...Object.values(monthSummaries).map((m) => m.searchCount || 0)
  );

  const scrollRef = useRef();
  const currentRef = useRef();

  useEffect(() => {
    if (scrollRef.current && currentRef.current) {
      const container = scrollRef.current;
      const target = currentRef.current;
      const offset =
        target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
    }
  }, [currentMonth]);

  return (
    <div className="relative z-40 bg-[#1b1f24] border-b border-[#333] px-2 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-fit" ref={scrollRef}>
        {Object.entries(monthSummaries).map(([key, summary]) => {
          const count = summary.searchCount;
          const intensity = count > 0 ? 0.2 + 0.7 * (count / maxCount) : 0.1;
          const bg = `rgba(34, 197, 94, ${intensity.toFixed(2)})`;
          const label =
            format(summary.date, "MMM").charAt(0) + format(summary.date, "yy");

          return (
            <button
              key={key}
              ref={key === currentMonth ? currentRef : null}
              onClick={() => onClick?.(key)}
              className={clsx(
                "text-xs font-bold px-2 py-1 rounded transition text-center min-w-[36px]",
                key === currentMonth ? "bg-white text-black shadow" : "text-white"
              )}
              style={{
                backgroundColor: key === currentMonth ? undefined : bg,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
