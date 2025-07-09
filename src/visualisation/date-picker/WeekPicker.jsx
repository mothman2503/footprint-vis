import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const areSameDay = (a, b) => a?.toDateString() === b?.toDateString();

const WeekPicker = ({ startDate, onSelectDate, annotations = {} }) => {
  const today = getToday();
  const [currentMonth, setCurrentMonth] = useState(new Date(today));
  const [selectedStart, setSelectedStart] = useState(startDate || null);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const days = [];

  const firstDayIndex = startOfMonth.getDay();
  const prevMonthDays = firstDayIndex;
  for (let i = prevMonthDays; i > 0; i--) {
    const d = new Date(startOfMonth);
    d.setDate(d.getDate() - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    days.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i), isCurrentMonth: true });
  }

  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(endOfMonth);
    d.setDate(endOfMonth.getDate() + i);
    days.push({ date: d, isCurrentMonth: false });
  }

  const isInSelectedRange = (date) => {
    if (!selectedStart) return false;
    const end = new Date(selectedStart);
    end.setDate(end.getDate() + 6);
    return date >= selectedStart && date <= end;
  };

  const handleSelect = (date) => {
    const isSameWeekStart = areSameDay(date, selectedStart);

    if (isSameWeekStart) {
      onSelectDate?.(date); // this is the signal to close (handled in parent)
    } else {
      setSelectedStart(date);
    }
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const weekStart = selectedStart;
  const weekEnd = weekStart ? new Date(weekStart.getTime() + 6 * 86400000) : null;

  return (
    <div className="w-max bg-white p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => changeMonth(-1)}><ChevronLeft /></button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={() => changeMonth(1)}><ChevronRight /></button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, i) => {
          const key = date.toISOString().split("T")[0];
          const strength = annotations[key]?.strength ?? 0;
          const isSelected = areSameDay(date, selectedStart);
          const inRange = isInSelectedRange(date);

          const glow = weekStart && date >= weekStart && date <= weekEnd;

          return (
            <button
              key={i}
              onClick={() => handleSelect(date)}
              disabled={date > today || date < new Date(today.getFullYear() - 100, 0, 1)}
              className={clsx(
                "relative text-xs rounded p-2 border text-center transition",
                {
                  "bg-indigo-100 text-indigo-900": inRange,
                  "ring-2 ring-indigo-500 shadow-md": glow,
                  "bg-indigo-500 text-white": isSelected,
                  "text-gray-400": !isCurrentMonth,
                  "hover:bg-indigo-200": isCurrentMonth && !isSelected,
                  "cursor-pointer": true,
                }
              )}
              style={{
                backgroundColor: strength
                  ? `rgba(79, 70, 229, ${Math.min(strength, 1)})`
                  : undefined,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekPicker;
