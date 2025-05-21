import React, { useState } from 'react';
import { openDB } from 'idb';
import { parseActivityHtml } from '../utils/parser';

/**
 * InsertDataButton allows the user to upload their Google Takeout 'MyActivity.html'
 * file and processes it to extract search queries, timestamps, and coordinates.
 * Parsed records are stored in IndexedDB under the 'searchResults' store.
 */
export default function InsertDataButton() {
  const [error, setError] = useState('');

  // Shared function to store parsed records into IndexedDB
  const storeRecords = async (records) => {
    const db = await openDB('GoogleActivityApp', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('searchResults')) {
          db.createObjectStore('searchResults', { keyPath: 'id', autoIncrement: true });
        }
      },
    });

    // Clear any existing entries before saving new ones
    await db.clear('searchResults');

    const tx = db.transaction('searchResults', 'readwrite');
    const store = tx.objectStore('searchResults');
    for (let rec of records) {
      await store.add(rec);
    }
    await tx.done;

    alert(`Stored ${records.length} search entries.`);
  };

  /**
   * Handle selection of the HTML file via input element.
   * Reads the file, parses it, and stores the results.
   */
  const handleFileInput = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) {
      setError('No file selected.');
      return;
    }

    try {
      const text = await file.text();
      const records = parseActivityHtml(text);
      await storeRecords(records);
    } catch (err) {
      console.error(err);
      setError('Failed to parse or store uploaded file.');
    }
  };

  return (
    <div className="space-y-2">
      {/* File input for MyActivity.html */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Upload MyActivity.html</span>
        <input
          type="file"
          accept=".html"
          onChange={handleFileInput}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </label>

      {error && (
        <p className="text-red-600 text-sm">⚠️ {error}</p>
      )}
    </div>
  );
}
