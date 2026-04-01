import React, { useState } from "react";
import { getDB, DB_CONSTANTS } from "../../../utils/db";
import { parseActivityHtml } from "../../../utils/parser";
import { useConsent, useDataset } from "../../../app/providers";

export default function Uploader({ onDatasetSaved }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setDataset } = useDataset();
  const { consent } = useConsent();

  const storeRecords = async (records) => {
    try {
      if (consent !== "accepted") {
        setDataset({
          source: "session",
          label: "Your Google History (not saved)",
          records,
        });
        setSuccess(
          `✅ Loaded ${records.length} entries for this session (not persisted).`
        );
        return;
      }

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
      setDataset({ source: "user", label: "Your Google History", records });
      setSuccess(`✅ Stored ${records.length} search entries.`);

      // Ask for dataset name and save to persistent store
      const name = prompt("Name this dataset (e.g. 'Session 1', 'May Upload'):");
      if (name?.trim()) {
        const label = name.trim();
        const savedEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          label,
          name: label,
          records,
          date: new Date().toISOString(),
        };

        const dbSave = await getDB();
        await dbSave.put(DB_CONSTANTS.STORE_NAME_SAVED, savedEntry);
        setDataset({ source: "saved", ...savedEntry });
        if (onDatasetSaved) {
          await onDatasetSaved(savedEntry);
        }
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
    <div className="space-y-4 p-4 w-full bg-white/5 border border-white/10 rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
      <label className="block text-sm font-semibold text-white">
        Upload <code>MyActivity.html</code> file:
      </label>
      <input
        type="file"
        accept=".html"
        onChange={handleFileInput}
        className="w-full text-sm text-white bg-[#0b1316] border border-white/10 rounded-lg px-3 py-2 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-emerald-500 file:to-cyan-500 file:text-black hover:file:from-emerald-400 hover:file:to-cyan-400"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-emerald-300 text-sm">{success}</p>}
      <p className="text-xs text-white/60">
        Only Google Takeout "My Activity" HTML files are supported.
      </p>
    </div>
  );
}
