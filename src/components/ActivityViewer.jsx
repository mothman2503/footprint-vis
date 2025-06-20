import React, { useState } from 'react';
import { useDataset } from '../context/DataContext';
import { getDB } from '../utils/db';
import CategorySelector from './visualisation_tools/CategorySelector';
import { IAB_CATEGORIES } from '../constants/iabCategories';

const ActivityViewer = () => {
  const { dataset, setDataset } = useDataset();
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 30;

  const entries = dataset?.records || [];
  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const updateEntryCategory = async (id, newCategory) => {
    const updatedRecords = entries.map(entry =>
      entry.id === id ? { ...entry, category: newCategory } : entry
    );

    setDataset(prev => ({ ...prev, records: updatedRecords }));

    const db = await getDB();

    if (dataset.source === 'user') {
      const entry = await db.get('searchResults', id);
      if (entry) {
        await db.put('searchResults', { ...entry, category: newCategory });
      }
    } else if (dataset.source === 'saved') {
      const allSaved = await db.getAll('savedDatasets');
      const current = allSaved.find(d => d.name === dataset.label);
      if (current) {
        const updated = {
          ...current,
          records: updatedRecords,
          date: new Date().toISOString()
        };
        await db.put('savedDatasets', updated);
      }
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  if (!entries.length) {
    return <p className="mt-4 text-gray-500">No search entries loaded.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Search History ({dataset?.label || 'Unnamed Dataset'})
      </h2>

      <ul className="space-y-4 h-[600px] overflow-y-auto pr-2">
        {paginatedEntries.map(entry => (
          <li key={entry.id} className="bg-gray-800 rounded-md p-4 shadow border border-gray-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: entry.category.color, color: '#111' }}
              >
                {entry.category.name}
              </span>
            </div>
            <p className="text-white text-base mb-2">{entry.query}</p>

            <CategorySelector
            noLabel
              value={entry.category.id}
              onChange={(newId) => {
                const newCategory = IAB_CATEGORIES.find(c => c.id === newId);
                if (newCategory) updateEntryCategory(entry.id, newCategory);
              }}
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-white">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityViewer;
