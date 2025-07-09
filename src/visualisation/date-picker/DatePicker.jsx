import { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import DayPicker from "./DayPicker";
import WeekPicker from "./WeekPicker";

const DatePicker = ({ startDate, onSelectDate, annotations = {} }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const containerRef = useRef();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (!open) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const calendarHeight = 350;
    const spaceBelow = window.innerHeight - (rect?.bottom || 0);
    setDropUp(spaceBelow < calendarHeight);
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDate = (date) => {
    onSelectDate?.(date);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="px-4 py-2 border rounded bg-white shadow-sm text-sm"
      >
        {startDate ? startDate.toDateString() : "Select Date"}
      </button>

      {open && (
        <div
          className={`absolute z-50 ${dropUp ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {isMobile ? (
            <DayPicker
              startDate={startDate}
              onSelectDate={handleSelectDate}
              annotations={annotations}
            />
          ) : (
            <WeekPicker
              startDate={startDate}
              onSelectDate={handleSelectDate}
              annotations={annotations}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
