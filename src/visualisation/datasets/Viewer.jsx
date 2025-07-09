import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataset } from "../../DataContext";
import { getDB } from "../../utils/db";
import CategoryDropdown from "../../components/CategoryDropdown";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";

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
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const stickyRef = useRef(null);
  const PER_PAGE = 40;

  const entries = dataset?.records || [];
  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (stickyRef.current) observer.observe(stickyRef.current);
    return () => observer.disconnect();
  }, []);

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

  return (
    <div className="mt-10">
      <div ref={stickyRef}></div>

      {/* Floating dataset bar */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-0 z-40 w-full"
          >
            <div className="max-w-screen-xl mx-auto px-6">
              <div className="mx-auto bg-[#1e1f22] px-1 py-3 border-b border-l border-r border-gray-700 text-xs sm:text-sm ">
                <div className="text-green-400 font-mono mb-1 text-xl max-w-screen-xl mx-auto px-6">
                  📄 {dataset?.label || "Unnamed Dataset"}
                </div>
                <div className=" grid-cols-12 text-gray-400 font-mono text-xs max-w-screen-xl mx-auto pl-8 hidden md:grid">
                  <span className="col-span-3">Timestamp</span>
                  <span className="col-span-5">Query</span>
                  <span className="col-span-2">Category</span>
                  <span className="col-span-2">Edit</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-white">
          Search History ({dataset?.label || "Unnamed Dataset"})
        </h2>
        <motion.button
          onClick={() => downloadCSV(entries)}
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1 text-sm bg-blue-700 text-white rounded shadow hover:bg-blue-500"
        >
          Export to CSV
        </motion.button>
      </div>

      <div className="grid grid-cols-12 text-gray-400 font-mono text-xs px-2 sticky top-[104px] z-30 bg-[#1e1f22] py-1 border-b border-gray-700">
        <span className="col-span-3">Timestamp</span>
        <span className="col-span-5">Query</span>
        <span className="col-span-2">Category</span>
        <span className="col-span-2">Edit</span>
      </div>

      <div className="border border-gray-700 rounded-lg divide-y divide-gray-700">
        <AnimatePresence mode="wait">
          {paginatedEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-gray-800 p-3 grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-4 items-center"
            >
              <div className="text-sm text-gray-400 md:col-span-3">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
              <div className="text-white text-sm md:col-span-5">
                {entry.query}
              </div>
              <div className="md:col-span-2">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    //TODO: Fix ........ !!!!
                    backgroundColor: entry.category.color,
                    color: "#111",
                  }}
                >
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
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white font-mono">
          <div className="text-sm text-gray-400 text-center sm:text-left">
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
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-gray-700 hover:bg-blue-600"
                  }`}
                >
                  {page}
                </motion.button>
              )
            )}
          </div>

          <div className="text-sm text-gray-300 flex items-center gap-2 justify-center sm:justify-end">
            Jump to:
            <select
              value={currentPage}
              onChange={handleJump}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
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
  );
};

export default ActivityViewer;
