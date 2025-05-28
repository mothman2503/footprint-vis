import React, { useState } from 'react';
import { getDB, DB_CONSTANTS } from '../utils/db';
import { parseActivityHtml } from '../utils/parser';

export default function InsertDataButton() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const storeRecords = async (records) => {
    try {
      const db = await getDB();
      await db.clear(DB_CONSTANTS.STORE_NAME);

      const tx = db.transaction(DB_CONSTANTS.STORE_NAME, 'readwrite');
      const store = tx.objectStore(DB_CONSTANTS.STORE_NAME);

      for (let rec of records) {
        await store.add(rec);
      }

      await tx.done;
      setSuccess(`✅ Stored ${records.length} search entries.`);
    } catch (err) {
      console.error('DB Error:', err);
      setError('⚠️ Failed to store data in IndexedDB.');
    }
  };

  const handleFileInput = async (e) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) {
      setError('⚠️ No file selected.');
      return;
    }

    try {
      const text = await file.text();
      const records = parseActivityHtml(text);
      if (records.length === 0) {
        setError('⚠️ No valid search records found in the file.');
        return;
      }
      await storeRecords(records);
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to parse or store the uploaded file.');
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <label className="block text-sm font-medium text-gray-700">
        Upload <code>MyActivity.html</code> file:
      </label>
      <input
        type="file"
        accept=".html"
        onChange={handleFileInput}
        className="w-full file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-gray-700"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <p className="text-xs text-gray-500">
        Only Google Takeout "My Activity" HTML files are supported.
      </p>
    </div>
  );
}
