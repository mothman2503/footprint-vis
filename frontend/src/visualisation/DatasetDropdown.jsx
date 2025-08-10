import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import Uploader from "./datasets/Uploader"; // Adjust path if needed

const groupBySource = (datasets) => {
  const groups = {};
  for (const ds of datasets) {
    const source = ds.source || "other";
    if (!groups[source]) groups[source] = [];
    groups[source].push(ds);
  }
  return groups;
};

const sourceLabels = {
  sample: "📁 Sample Datasets",
  saved: "💾 Saved Datasets",
};

const DatasetDropdown = ({ value, onChange, datasets = [], className = "", promptOpen = false }) => {
  const [open, setOpen] = useState(promptOpen); // 👈 Start open if needed
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const dropdownRef = useRef();

  const grouped = groupBySource(datasets);
  const flatList = Object.entries(grouped).flatMap(([source, list]) =>
    list.map((ds) => ({ ...ds, _source: source }))
  );

  const selected = flatList.find((ds) => ds.label === value);

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
      const index = flatList.findIndex((ds) => ds.label === value);
      setHighlightedIndex(index !== -1 ? index : 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, value, flatList]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % flatList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedDataset = flatList[highlightedIndex];
      if (selectedDataset) {
        onChange(selectedDataset);
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
        className="w-full pr-2 pl-3 py-1 bg-[#202e30] border-b border-gray-700 text-left flex items-center gap-2 text-sm text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate flex-1">{selected?.label || "Select dataset"}</span>
        <BookOpen className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
      </button>

      <div
        className={`absolute mt-1 w-full z-50 bg-gray-800 border border-gray-700 shadow-lg max-h-72 overflow-y-auto custom-scrollbar text-sm transition-all duration-200 origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {Object.entries(grouped).map(([source, list]) => (
          <div key={source}>
            <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase sticky top-0 z-10">
              {sourceLabels[source] || source}
            </div>
            {list.map((ds, idx) => {
              const flatIndex = flatList.findIndex((d) => d.label === ds.label);
              return (
                <div
                  key={ds.label}
                  onClick={() => {
                    onChange(ds);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(flatIndex)}
                  className={`cursor-pointer pl-6 pr-3 py-2 flex items-center gap-2 text-white ${
                    highlightedIndex === flatIndex ? "bg-gray-700" : ""
                  }`}
                >
                  <span className="truncate">{ds.label}</span>
                  <span className="text-gray-500 text-xs ml-auto">{ds.records?.length ?? 0} records</span>
                </div>
              );
            })}
          </div>
        ))}

        {/* ➕ Add new dataset option */}
        <div
          onClick={() => {
            setOpen(false);
            setShowDialog(true);
          }}
          className="cursor-pointer px-3 py-2 flex items-center gap-2 text-green-400 hover:bg-gray-700 border-t border-gray-700"
        >
          <Plus className="w-4 h-4" />
          <span className="truncate">Add Dataset</span>
        </div>
      </div>

      {/* Modal/Dialog for uploader */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-4 relative">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <Uploader />
          </div>
        </div>
      )}

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
