import React, { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

const DatasetDropdown = ({ value, onChange, datasets = [], className = "" }) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef();

  const selected = datasets.find((ds) => ds.label === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const index = datasets.findIndex((ds) => ds.label === value);
      setHighlightedIndex(index !== -1 ? index : 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, value, datasets]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % datasets.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + datasets.length) % datasets.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedDataset = datasets[highlightedIndex];
      if (selectedDataset) {
        onChange(selectedDataset.label);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className="w-full pr-2 pl-3 py-1 bg-[#131818] border-b border-gray-700 text-left flex items-center gap-2 text-sm text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate flex-1">{selected?.label || "Select dataset"}</span>
        <BookOpen className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
      </button>
      <div
        className={`absolute mt-1 w-full z-50 bg-gray-800 border border-gray-700 shadow-lg max-h-72 overflow-y-auto custom-scrollbar text-sm transition-all duration-200 origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {datasets.map((ds, index) => (
          <div
            key={ds.label}
            onClick={() => {
              onChange(ds.label);
              setOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`cursor-pointer px-3 py-2 flex items-center gap-2 text-white ${
              highlightedIndex === index ? "bg-gray-700" : ""
            }`}
          >
            <span className="truncate">{ds.label}</span>
            <span className="text-gray-500 text-xs ml-auto">{ds.records?.length ?? 0} records</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background-color 0.2s;
        }

        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default DatasetDropdown;
