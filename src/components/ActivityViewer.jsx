import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import SearchEntryCard from './SearchEntryCard';

const ActivityViewer = () => {
  const [entries, setEntries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const CHUNK = 20;

  useEffect(() => {
    const fetchEntries = async () => {
      const db = await openDB('GoogleActivityApp', 1);
      const all = await db.getAll('searchResults');
      setEntries(all);
    };
    fetchEntries();
  }, []);

  if (!entries.length) {
    return <p className="mt-4 text-gray-500">No search entries loaded.</p>;
  }

  return (
    <div className="mt-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Your Search History</h2>
      <ul className="space-y-4">
        {entries.slice(0, visibleCount).map(entry => (
          <SearchEntryCard key={entry.id} entry={entry} />
        ))}
      </ul>
      {visibleCount < entries.length && (
        <button
          onClick={() => setVisibleCount(v => v + CHUNK)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Load More ({visibleCount}/{entries.length})
        </button>
      )}
    </div>
  );
};

export default ActivityViewer;
