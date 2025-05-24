import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import SearchEntryCard from './SearchEntryCard';

const ActivityViewer = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    const fetchEntries = async () => {
      const db = await openDB('GoogleActivityApp', 1);
      const all = await db.getAll('searchResults');
      setEntries(all);
    };
    fetchEntries();
  }, []);

  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  if (!entries.length) {
    return <p className="mt-4 text-gray-500">No search entries loaded.</p>;
  }

  return (
    <div className="mt-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Your Search History</h2>

      <ul className="space-y-4 h-[600px] overflow-y-auto">
        {paginatedEntries.map(entry => (
          <SearchEntryCard key={entry.id} entry={entry} />
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityViewer;
