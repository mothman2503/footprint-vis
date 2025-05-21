import React from 'react';
import { openDB } from 'idb';
import { parseActivityHtml } from '../utils/parser';

const InsertDataButton = () => {
  const handleClick = async () => {
    try {
      // Ask user to pick the exported Google Takeout folder
      const root = await window.showDirectoryPicker();
      const myAct = await root.getDirectoryHandle('My Activity');
      const searchDir = await myAct.getDirectoryHandle('Search');
      const fh = await searchDir.getFileHandle('MyActivity.html');
      const file = await fh.getFile();
      const htmlText = await file.text();

      // Extract individual search entries from the HTML
      const records = parseActivityHtml(htmlText);

      // Store each record in IndexedDB
      const db = await openDB('GoogleActivityApp', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('searchResults')) {
            db.createObjectStore('searchResults', {
              keyPath: 'id',
              autoIncrement: true,
            });
          }
        },
      });

      await db.clear('searchResults');

      for (let rec of records) {
        await db.add('searchResults', rec);
      }

      alert(`Stored ${records.length} search entries.`);
    } catch (err) {
      console.error(err);
      alert('Failed to import. Check if the folder structure is correct.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Insert Data
    </button>
  );
};

export default InsertDataButton;
