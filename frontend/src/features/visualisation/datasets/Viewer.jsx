import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataset } from "../../../app/providers";
import { getDB } from "../../../utils/db";
import CategoryDropdown from "../../../shared/components/CategoryDropdown";
import { IAB_CATEGORIES } from "../../../assets/constants/iabCategories";
import {
  Download,
  Filter,
  Search as SearchIcon,
  CalendarRange,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

function getPaginationRange(current, total, delta = 2) {
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  for (let i = left; i <= right; i++) range.push(i);
  if (left > 2) range.unshift("...");
  if (right < total - 1) range.push("...");
  range.unshift(1);
  if (total > 1) range.push(total);
  return [...new Set(range)];
}

function downloadCSV(data) {
  const header = ["Timestamp", "Query", "Category ID", "Category Name"];
  const rows = data.map((entry) => [
    new Date(entry.timestamp).toISOString(),
    `"${entry.query.replace(/"/g, '""')}"`,
    entry.category.id,
    entry.category.name,
  ]);
  const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "search_dataset_export.csv");
  link.click();
}

const ActivityViewer = () => {
  const { dataset, setDataset } = useDataset();
  const [currentPage, setCurrentPage] = useState(1);
  const stickyRef = useRef(null);
  const PER_PAGE = 40;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const parsedStart = startDate ? new Date(startDate) : null;
  const parsedEnd = endDate ? new Date(endDate) : null;

  const entries = (dataset?.records || []).filter((entry) => {
    const ts = new Date(entry.timestamp);

    const withinRange =
      (!parsedStart || ts >= parsedStart) &&
      (!parsedEnd || ts <= parsedEnd);

    const queryMatch =
      searchQuery === "" ||
      entry.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.name.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch =
      !selectedCategory || entry.category.id === selectedCategory;

    const yearMatch =
      !yearFilter || ts.getFullYear().toString() === yearFilter;

    return withinRange && queryMatch && categoryMatch && yearMatch;
  });


  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const updateEntryCategory = async (id, newCategory) => {
    const updatedRecords = entries.map((entry) =>
      entry.id === id ? { ...entry, category: newCategory } : entry
    );
    setDataset((prev) => ({ ...prev, records: updatedRecords }));

    const db = await getDB();
    if (dataset.source === "user") {
      const entry = await db.get("searchResults", id);
      if (entry)
        await db.put("searchResults", { ...entry, category: newCategory });
    } else if (dataset.source === "saved") {
      const allSaved = await db.getAll("savedDatasets");
      const current = allSaved.find((d) => d.name === dataset.label);
      if (current) {
        await db.put("savedDatasets", {
          ...current,
          records: updatedRecords,
          date: new Date().toISOString(),
        });
      }
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  const handleJump = (e) => {
    const page = Number(e.target.value);
    if (page >= 1 && page <= totalPages) goToPage(page);
  };

  const startIndex = (currentPage - 1) * PER_PAGE + 1;
  const endIndex = Math.min(currentPage * PER_PAGE, entries.length);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setYearFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const years = Array.from(
    new Set((dataset?.records || []).map((e) => new Date(e.timestamp).getFullYear()))
  )
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => b - a);

  return (
    <div className="mt-6 text-white">
      <div ref={stickyRef}></div>

      <div className="rounded-2xl border border-white/10 bg-[#11171b] shadow-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-[0.2em]">Table View</p>
            <h2 className="text-xl font-semibold">Search entries</h2>
            <p className="text-sm text-white/60">
              Filter by query, category, or time span. Edit categories inline.
            </p>
          </div>
          <motion.button
            onClick={() => downloadCSV(entries)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold shadow-lg"
          >
            <Download size={16} />
            Export CSV
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-5 gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="lg:col-span-2 flex items-center gap-2 bg-[#0d1316] border border-white/10 rounded-lg px-3 py-2">
            <SearchIcon size={16} className="text-white/60" />
            <input
              type="text"
              placeholder="Search queries or categories"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/40"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0d1316] border border-white/10 rounded-lg px-3 py-2">
            <Filter size={16} className="text-white/60" />
            <CategoryDropdown
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              allowEmpty
              noLabel
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0d1316] border border-white/10 rounded-lg px-3 py-2">
            <CalendarRange size={16} className="text-white/60" />
            <div className="flex flex-col gap-1 w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white text-xs border border-white/10 rounded px-2 py-1"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white text-xs border border-white/10 rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0d1316] border border-white/10 rounded-lg px-3 py-2">
            <SlidersHorizontal size={16} className="text-white/60" />
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white text-sm w-full border border-white/10 rounded px-2 py-1"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm font-semibold"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-12 text-gray-400 font-mono text-xs px-2 sticky top-[10px] z-30 bg-[#0d1316] py-1 border-b border-white/10 rounded-t-lg">
          <span className="col-span-3">Timestamp</span>
          <span className="col-span-5">Query</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Edit</span>
        </div>

        <div className="border border-white/10 rounded-lg divide-y divide-white/5 overflow-hidden bg-[#0b1013]">
          <AnimatePresence mode="wait">
            {paginatedEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-3 grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-4 items-center"
              >
                <div className="text-sm text-gray-400 md:col-span-3">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
                <div className="text-white text-sm md:col-span-5 break-words">
                  {entry.query}
                </div>
                <div className="md:col-span-2">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-2"
                    style={{
                      backgroundColor: entry.category.color || "#2c3e50",
                      color: "#0b1013",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: entry.category.color || "#6c6" }}
                    />
                    {entry.category.name}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <CategoryDropdown
                    noLabel
                    value={entry.category.id}
                    onChange={(newId) => {
                      const newCategory = IAB_CATEGORIES.find(
                        (c) => c.id === newId
                      );
                      if (newCategory) updateEntryCategory(entry.id, newCategory);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white font-mono">
            <div className="text-sm text-white/70 text-center sm:text-left">
              Showing {startIndex}–{endIndex} of {entries.length}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {getPaginationRange(currentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="px-2 text-gray-500 select-none">
                    ...
                  </span>
                ) : (
                  <motion.button
                    key={page}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? "bg-cyan-600 text-white font-bold"
                        : "bg-white/10 hover:bg-cyan-700/70"
                    }`}
                  >
                    {page}
                  </motion.button>
                )
              )}
            </div>

            <div className="text-sm text-white/70 flex items-center gap-2 justify-center sm:justify-end">
              Jump to:
              <select
                value={currentPage}
                onChange={handleJump}
                className="bg-[#0d1316] border border-white/20 rounded px-2 py-1 text-white"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Page {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityViewer;
