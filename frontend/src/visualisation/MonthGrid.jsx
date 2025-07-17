import { useState } from "react";
import clsx from "clsx";
import * as d3 from "d3";
import DonutChart from "../visualisation/donut/DonutChart"; // or adjust path as needed
import { IAB_CATEGORIES } from "../assets/constants/iabCategories";
import DonutDialog from "../visualisation/donut/DonutDialog"; // adjust path


const getOpacityScale = (searchCounts) => {
  const values = Object.values(searchCounts).filter((v) => v > 0);
  if (!values.length) return () => 0;

  const sorted = [...values].sort((a, b) => a - b);
  const min = Math.min(...values);
  const cap = d3.quantileSorted(sorted, 0.95) || Math.max(...values);

  return d3.scaleLinear().domain([min, cap]).range([0.2, 0.9]).clamp(true);
};

const MonthGrid = ({
  monthStart,
  startDate,
  numDays,
  annotations,
  onSelectDate,
  searchCounts = {},
  records = [],
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dialogOpen, setDialogOpen] = useState(false);

  const month = monthStart.getMonth();
  const year = monthStart.getFullYear();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const firstDayIndex = start.getDay();

  const days = [];

  const monthRecords = records.filter((rec) => {
    const date = new Date(rec.timestamp);
    return (
      date.getFullYear() === monthStart.getFullYear() &&
      date.getMonth() === monthStart.getMonth()
    );
  });

  const categoryCounts = Object.entries(
    monthRecords.reduce((acc, rec) => {
      const key = rec.category?.id || "uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([id, value]) => {
    const cat = IAB_CATEGORIES.find((c) => c.id === id);
    return {
      label: cat?.name || "Uncategorized",
      color: cat?.color || "#888",
      value,
    };
  });

  for (let i = firstDayIndex; i > 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= end.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push({ date: next, isCurrentMonth: false });
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (numDays - 1));

  const opacityScale = getOpacityScale(searchCounts);

  return (
    <div className="bg-[#1e2626] p-1 text-white">
      <div className="font-semibold mb-1 flex w-full bg-[#1e2626] justify-between ">
        <div className="flex-col flex-grow bg-[#131818] p-2">
          <p className="font-semibold">
            {start.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <p className="font-normal text-xs">
            {monthRecords.length + " Searches"}
          </p>
        </div>

        <div className={`my-1 ${categoryCounts?.length !== 0 ? " mx-3" : ""} h-[60px] max-w-[60px]`}>
          {categoryCounts?.length !== 0 && (
            <DonutChart
                data={categoryCounts}
                size={60}
                strokeWidth={12}
                onClick={() => setDialogOpen(true)}
              />
          )}
          <DonutDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            data={categoryCounts}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-indigo-300 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div className="p-1 text-center" key={`${d}-${i}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(({ date, isCurrentMonth }, i) => {
          const key = date.toISOString().split("T")[0];
          const isStart = date === startDate;
          const isEnd = date === endDate;
          const inRange = date >= startDate && date <= endDate;
          const strength = annotations[key]?.strength ?? 0;
          const count = searchCounts[key] || 0;
          const opacity = opacityScale(count);

          const selectedStyle = (inRange
            ? ("border-t border-[green] shadow-[inset_0_6px_6px_-4px_rgba(68,239,68,0.7)]" + (isStart?" border-l ":isEnd?" border-r ":""))
            : "") ;

          

          const backgroundColor =
            count > 0
              ? `rgba(96, 165, 250, ${opacity.toFixed(2)})`
              : strength
              ? `rgba(79, 70, 229, ${Math.min(strength, 1)})`
              : undefined;

          return (
            <div key={i} className="aspect-square w-full">
              <button
                onClick={() => onSelectDate(date)}
                disabled={date > today || date < new Date(2020, 0, 1)}
                className={clsx(
                  "text-sm w-full h-full p-1 text-center transition font-semibold",
                  {
                    invisible: !isCurrentMonth,
                  },
                  selectedStyle
                )}
                style={{ backgroundColor }}
              >
                <div className="relative flex flex-col items-center justify-center w-full h-full">
                  <span>{date.getDate()}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthGrid;
