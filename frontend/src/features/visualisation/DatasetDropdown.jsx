import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BookOpen, Database, Loader2, Plus, RefreshCw, Search } from "lucide-react";
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
  onRefresh,
  onDatasetSaved,
  className = "",
  promptOpen = false,
}) => {
  const [open, setOpen] = useState(promptOpen);
  const [showDialog, setShowDialog] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(null);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // applying state + React 18 transition to keep UI responsive
  const [, startTransition] = useTransition();
  const [applying, setApplying] = useState(null); // label of dataset being applied
  const triggerRefresh = useCallback(
    async () => {
      if (!onRefresh) return;
      setSyncing(true);
      try {
        await onRefresh();
      } catch (err) {
        console.error("Dataset refresh failed:", err);
      } finally {
        setSyncing(false);
      }
    },
    [onRefresh]
  );

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
    const handlePointerOutside = (e) => {
      if (!dropdownRef.current) return;
      const target = e.target;
      if (target && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const canUsePointerEvents =
      typeof window !== "undefined" && "PointerEvent" in window;

    if (canUsePointerEvents) {
      document.addEventListener("pointerdown", handlePointerOutside);
      return () => document.removeEventListener("pointerdown", handlePointerOutside);
    }

    document.addEventListener("mousedown", handlePointerOutside);
    document.addEventListener("touchstart", handlePointerOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerOutside);
      document.removeEventListener("touchstart", handlePointerOutside);
    };
  }, []);

  useEffect(() => {
    if (!open || !onRefresh) return;
    triggerRefresh();
  }, [open, onRefresh, triggerRefresh]);

  // Match panel width to trigger width
  useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setPanelWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
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

  const handleDatasetSaved = async () => {
    if (onDatasetSaved) {
      await onDatasetSaved();
    } else {
      await triggerRefresh();
    }
    setShowDialog(false);
    setOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="dataset-dropdown-list"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        className="w-full text-left rounded-sm border border-white/10 bg-[#0c1316] px-3 py-1.5 min-h-[34px] flex items-center gap-3 hover:border-emerald-300/40 transition focus:outline-none focus:ring-1 focus:ring-emerald-300/60 touch-manipulation"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5 border border-white/10 text-emerald-200">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
            Dataset
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {selected?.label || "Select dataset"}
          </p>
        </div>
        <div className="flex flex-col items-end text-[10px] text-white/70 min-w-[60px]">
          <span className="text-emerald-300">{selected?.records?.length ?? 0} rows</span>
          <span className="text-white/50">open ▾</span>
        </div>
      </button>

      <div
        className={`absolute mt-2 right-0 z-50 transition-all duration-150 origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
        style={{ width: panelWidth || "100%" }}
        role="dialog"
        aria-modal="true"
        aria-busy={applying || syncing ? "true" : "false"}
      >
        <div className="rounded-md bg-[#0b1013] border border-white/10 shadow-lg overflow-hidden">
          {(applying || syncing) && (
            <div className="h-1 bg-emerald-500/60 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/30 animate-[dd-slide_1.4s_linear_infinite]" />
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0f1619]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-emerald-200">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  IndexedDB
                </p>
                <p className="text-sm text-white">Dataset library</p>
              </div>
            </div>
            <button
              onClick={triggerRefresh}
              disabled={syncing || disabled}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/20 text-white text-xs bg-[#0f1619] hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync
            </button>
          </div>

          <div className="px-4 pt-3 pb-4 border-b border-white/10 space-y-2 bg-[#0b1013]">
            <div className="flex items-center gap-2 bg-[#0f1619] border border-white/10 rounded-md px-3 py-2">
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

            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span className="ml-auto truncate">
                Active: {selected?.label || "None selected"}
              </span>
            </div>

            <button
              onClick={() => {
                if (disabled) return;
                setOpen(false);
                setShowDialog(true);
              }}
              className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md border border-dashed border-white/15 bg-[#0f1619] hover:bg-white/10 text-white text-sm font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add dataset
              </span>
              <span className="text-[11px] text-white/70">Upload & sync</span>
            </button>
          </div>

          <div
            id="dataset-dropdown-list"
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-[20rem] overflow-y-auto custom-scrollbar px-3 py-3 space-y-2"
            aria-activedescendant={
              filtered[highlightedIndex]
                ? `dataset-opt-${highlightedIndex}`
                : undefined
            }
          >
            {Object.entries(filteredGrouped).length === 0 && (
              <div className="px-3 py-6 text-center text-gray-400 rounded-md border border-white/10 bg-[#0f1619]">
                No results{query ? ` for “${query}”` : ""}.
              </div>
            )}

            {Object.entries(filteredGrouped).map(([source, list]) => (
              <div key={source} className="space-y-2">
                <div className="flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>{sourceLabels[source] || source}</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                {list.map((ds) => {
                  const idx = filtered.findIndex((d) => d.label === ds.label);
                  const active = highlightedIndex === idx;
                  const recordCount = ds.records?.length ?? 0;
                  return (
                    <div
                      id={`dataset-opt-${idx}`}
                      key={ds.label}
                      role="option"
                      aria-selected={active}
                      ref={(el) => setItemRef(el, idx)}
                      onClick={() => !disabled && applySelection(ds)}
                      onPointerDown={(event) => {
                        if (disabled) return;
                        if (event.pointerType === "touch" || event.pointerType === "pen") {
                          event.preventDefault();
                          applySelection(ds);
                        }
                      }}
                      onPointerEnter={() => setHighlightedIndex(idx)}
                      className={`group relative cursor-pointer border px-3 py-2 transition ${
                        active
                          ? "border-emerald-400/60 bg-emerald-900/20"
                          : "border-white/10 bg-[#0f1619] hover:border-emerald-300/50"
                      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            
                          </div>
                          <div className="text-sm font-semibold text-white truncate">
                            {highlightMatch(ds.label || "", query)}
                          </div>

                            <span className="text-[11px] text-white/70">
                              {recordCount} records
                            </span>
                          <div className="text-[11px] text-white/60 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                            <span>
                              {ds.date
                                ? `Updated ${new Date(ds.date).toLocaleDateString()}`
                                : "No timestamp"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDialog && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowDialog(false);
          }}
        >
          <div className="relative w-full max-w-[460px]">
            <div className="relative w-full bg-[#0f1417] border border-white/10 shadow-2xl rounded-md text-white p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">Add a new dataset</p>
                  <p className="text-sm text-white/70">
                    Upload your MyActivity export and save it for quick switching.
                  </p>
                </div>
            <button
              onClick={() => setShowDialog(false)}
                    className="text-gray-400 hover:text-white rounded-md h-8 w-8 flex items-center justify-center bg-white/5 border border-white/10"
              aria-label="Close"
            >
              ✕
            </button>
              </div>
              <Uploader onDatasetSaved={handleDatasetSaved} />
            </div>
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
