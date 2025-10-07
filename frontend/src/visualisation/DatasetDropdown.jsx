import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import Uploader from "./datasets/Uploader"; // Adjust path if needed

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
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
  other: "📦 Other",
};

const highlightMatch = (text, q) => {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-yellow-600/40 text-yellow-100 rounded px-0.5">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const DatasetDropdown = ({
  value,
  onChange,
  datasets = [],
  className = "",
  promptOpen = false,
}) => {
  const [open, setOpen] = useState(promptOpen);
  const [showDialog, setShowDialog] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // applying state + React 18 transition to keep UI responsive
  const [isPending, startTransition] = useTransition();
  const [applying, setApplying] = useState(null); // label of dataset being applied

  // Group + flatten
  const grouped = useMemo(() => groupBySource(datasets), [datasets]);
  const flatList = useMemo(
    () =>
      Object.entries(grouped).flatMap(([source, list]) =>
        list.map((ds) => ({ ...ds, _source: source }))
      ),
    [grouped]
  );

  // selected can be a label string or full object; normalize
  const selected =
    typeof value === "string"
      ? flatList.find((ds) => ds.label === value)
      : (value && flatList.find((ds) => ds.label === value?.label)) || null;

  // Filter by search
  const filtered = useMemo(() => {
    if (!query.trim()) return flatList;
    const q = query.trim().toLowerCase();
    return flatList.filter(
      (ds) =>
        ds.label?.toLowerCase().includes(q) ||
        ds._source?.toLowerCase().includes(q)
    );
  }, [flatList, query]);

  // Build grouped view of filtered items for headers
  const filteredGrouped = useMemo(() => {
    const g = {};
    for (const ds of filtered) {
      if (!g[ds._source]) g[ds._source] = [];
      g[ds._source].push(ds);
    }
    return g;
  }, [filtered]);

  // Keep item refs length in sync
  itemRefs.current = [];
  const setItemRef = (el, idx) => (itemRefs.current[idx] = el);

  // Outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll while open; set initial highlight to selected/first
  useEffect(() => {
    if (open) {
      const idx = filtered.findIndex((ds) => ds.label === selected?.label);
      setHighlightedIndex(idx !== -1 ? idx : 0);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [open]); // eslint-disable-line

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (!open) return;
    const node = itemRefs.current[highlightedIndex];
    if (node && listRef.current) {
      const list = listRef.current;
      const { top: lt, bottom: lb } = list.getBoundingClientRect();
      const { top: it, bottom: ib } = node.getBoundingClientRect();
      if (it < lt || ib > lb) node.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  // Keyboard navigation on the whole dropdown (trigger + search input share this)
  const handleKeyDown = (e) => {
    if (!open) return;

    const max = filtered.length;
    if (max === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => (p + 1) % max);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => (p - 1 + max) % max);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlightedIndex(max - 1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.min(p + 10, max - 1));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.max(p - 10, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ds = filtered[highlightedIndex];
      if (ds) applySelection(ds);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Apply selection with visible feedback and non-blocking UI
  const applySelection = (ds) => {
    setApplying(ds.label);

    const maybePromise = onChange?.(ds);

    // If parent returns a Promise, keep loader until it settles
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.finally(() => {
        setApplying(null);
        setOpen(false);
      });
      return;
    }

    // If sync: use transition so rendering heavy work doesn't freeze the dropdown
    startTransition(() => {
      onChange(ds);
    });

    // Allow spinner to render a moment, then close
    requestAnimationFrame(() => {
      setTimeout(() => {
        setApplying(null);
        setOpen(false);
      }, 120);
    });
  };

  const disabled = Boolean(applying);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="dataset-dropdown-list"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className="w-full pr-2 pl-3 py-1 bg-[#202e30] border-b border-gray-700 text-left flex items-center gap-2 text-sm text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate flex-1">{selected?.label || "Select dataset"}</span>
        <BookOpen className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
      </button>

      {/* Panel */}
      <div
        className={`absolute mt-1 w-full z-50 bg-gray-800 border border-gray-700 shadow-lg max-h-[22rem] overflow-hidden text-sm transition-all duration-150 origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-busy={applying ? "true" : "false"}
      >
        {/* Top progress bar while applying */}
        {applying && (
          <div className="h-0.5 bg-blue-500/60 relative overflow-hidden">
            <div className="absolute inset-y-0 w-1/3 bg-blue-400 animate-[dd-slide_1s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Search */}
        <div className="p-2 border-b border-gray-700 bg-gray-800 sticky top-0 z-20">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-2 py-1">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search datasets…"
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
              aria-label="Search datasets"
            />
          </div>
        </div>

        {/* List */}
        <div
          id="dataset-dropdown-list"
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="max-h-[18rem] overflow-y-auto custom-scrollbar"
          aria-activedescendant={
            filtered[highlightedIndex]
              ? `dataset-opt-${highlightedIndex}`
              : undefined
          }
        >
          {Object.entries(filteredGrouped).length === 0 && (
            <div className="px-3 py-6 text-center text-gray-400">
              No results{query ? ` for “${query}”` : ""}.
            </div>
          )}

          {Object.entries(filteredGrouped).map(([source, list]) => (
            <div key={source}>
              <div className="px-3 py-1 text-gray-400 text-[10px] tracking-wide font-semibold uppercase sticky top-0 bg-gray-800/95 backdrop-blur z-10">
                {sourceLabels[source] || source}
              </div>
              {list.map((ds) => {
                const idx = filtered.findIndex((d) => d.label === ds.label);
                const active = highlightedIndex === idx;
                return (
                  <div
                    id={`dataset-opt-${idx}`}
                    key={ds.label}
                    role="option"
                    aria-selected={active}
                    ref={(el) => setItemRef(el, idx)}
                    onClick={() => !disabled && applySelection(ds)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`cursor-pointer pl-6 pr-3 py-2 flex items-center gap-2 text-white ${
                      active ? "bg-gray-700" : "hover:bg-gray-750"
                    } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <span className="truncate">{highlightMatch(ds.label || "", query)}</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {ds.records?.length ?? 0} records
                    </span>
                    {applying === ds.label && (
                      <svg className="w-4 h-4 ml-2 dd-spin" viewBox="0 0 24 24" fill="none" aria-label="Loading">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3"/>
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Add new dataset */}
          <div
            onClick={() => {
              if (disabled) return;
              setOpen(false);
              setShowDialog(true);
            }}
            className="cursor-pointer px-3 py-2 flex items-center gap-2 text-green-400 hover:bg-gray-700 border-t border-gray-700"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">Add Dataset</span>
          </div>
        </div>
      </div>

      {/* Modal/Dialog for uploader */}
      {showDialog && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center px-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowDialog(false);
          }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-4 relative">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <Uploader />
          </div>
        </div>
      )}

      {/* Tiny scrollbar + animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.18);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.35);
        }
        @keyframes dd-spin { to { transform: rotate(360deg); } }
        .dd-spin { animation: dd-spin 0.9s linear infinite; }
        @keyframes dd-slide {
          0% { left: -33%; }
          50% { left: 50%; }
          100% { left: 110%; }
        }
      `}</style>
    </div>
  );
};

export default DatasetDropdown;
