import React, { useState, useEffect, useRef } from "react";
import DayCell from "./DayCell";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DatePicker = ({ annotations = {}, onSelectDate }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const ref = useRef();


  const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const handleDocumentClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const generateCalendarGrid = () => {
    const start = getStartOfMonth(currentMonth);
    const end = getEndOfMonth(currentMonth);

    const startDay = start.getDay(); // 0 (Sun) to 6 (Sat)
    const days = [];

    // Previous month's filler
    for (let i = 0; i < startDay; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() - startDay + i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= end.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's filler
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      days.push({ date: next, isCurrentMonth: false });
    }

    return days;
  };

  const handleSelect = (date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
    setOpen(false);
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="relative w-64" ref={ref}>
       <div className="absolute bottom-full mb-[30px] w-full bg-white border shadow-lg rounded z-50 p-4">
          {/* Month & Year Controls */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <div className="font-semibold">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button onClick={() => changeMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarGrid().map(({ date, isCurrentMonth }, i) => {
              const key = date.toISOString().split("T")[0];
              return (
                <DayCell
                  key={i}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  annotation={annotations[key]}
                  onClick={handleSelect}
                />
              );
            })}
          </div>
        </div>
    </div>
  );
};

export default DatePicker;
