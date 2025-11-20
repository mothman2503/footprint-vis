import React, { useState } from "react";
import { getDB, DB_CONSTANTS } from "../../../utils/db";
import { parseActivityHtml } from "../../../utils/parser";
import { useDataset } from "../../../app/providers";

export default function Uploader() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setDataset } = useDataset();

  const storeRecords = async (records) => {
    try {
      const db = await getDB();
      await db.clear(DB_CONSTANTS.STORE_NAME);

      const tx = db.transaction(DB_CONSTANTS.STORE_NAME, "readwrite");
      const store = tx.objectStore(DB_CONSTANTS.STORE_NAME);

      for (let rec of records) {
        const { id, ...clean } = rec;
        const newId = await store.add(clean);
        rec.id = newId;
      }

      await tx.done;
      console.log(records[0]);
      setDataset({ source: "user", label: "Your Google History", records });
      setSuccess(`✅ Stored ${records.length} search entries.`);

      // Ask for dataset name and save to persistent store
      const name = prompt("Name this dataset (e.g. 'Session 1', 'May Upload'):");
      if (name?.trim()) {
        const dbSave = await getDB();
        await dbSave.put("savedDatasets", {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: name.trim(),
          records,
          date: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("DB Error:", err);
      setError("⚠️ Failed to store data in IndexedDB.");
    }
  };

  const handleFileInput = async (e) => {
    setError("");
    setSuccess("");
    const file = e.target.files?.[0];
    if (!file) {
      setError("⚠️ No file selected.");
      return;
    }

    try {
      const text = await file.text();
      const records = parseActivityHtml(text);
      if (records.length === 0) {
        setError("⚠️ No valid search records found in the file.");
        return;
      }
      await storeRecords(records);
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to parse or store the uploaded file.");
    }
  };

  return (
    <div className="space-y-4 p-4 w-full bg-gray-900 rounded-md border border-gray-700">
      <label className="block text-sm font-medium text-gray-300">
        Upload <code>MyActivity.html</code> file:
      </label>
      <input
        type="file"
        accept=".html"
        onChange={handleFileInput}
        className="w-full file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-gray-300"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}
      <p className="text-xs text-gray-400">
        Only Google Takeout "My Activity" HTML files are supported.
      </p>
    </div>
  );
}
