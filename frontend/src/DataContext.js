import React, { createContext, useContext, useEffect, useState } from "react";
import { getDB, DB_CONSTANTS } from "./utils/db";

const DatasetContext = createContext();

// 🔁 One-time migration from "name" to "label"
const migrateOldSavedDatasets = async (db) => {
  const tx = db.transaction("savedDatasets", "readwrite");
  const store = tx.objectStore("savedDatasets");
  const all = await store.getAll();

  for (const entry of all) {
    if (entry.name && !entry.label) {
      entry.label = entry.name;
      delete entry.name;
      await store.put(entry);
    }
  }

  await tx.done;
};


export const DatasetProvider = ({ children }) => {
  const [dataset, setDataset] = useState(null);

  // 🔁 Load dataset from IndexedDB on startup if previously selected
  useEffect(() => {
    const loadFromStorage = async () => {
      const savedLabel = localStorage.getItem("selectedDatasetLabel");
      if (!savedLabel) return;

      try {
        const db = await getDB();
        await migrateOldSavedDatasets(db);
        const savedDatasets = await db.getAll(DB_CONSTANTS.STORE_NAME_SAVED);
        const found = savedDatasets.find((d) => d.label === savedLabel);

        if (found) {
          const normalized = {
            ...found,
            source: "saved",
          };
          setDataset(normalized);
        }

      } catch (err) {
        console.error("❌ Failed to load dataset from IndexedDB:", err);
      }
    };

    loadFromStorage();
  }, []);

  // 💾 Sync selected label to localStorage
  useEffect(() => {
    if (dataset?.label) {
      localStorage.setItem("selectedDatasetLabel", dataset.label);
    } else {
      localStorage.removeItem("selectedDatasetLabel");
    }
  }, [dataset]);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => useContext(DatasetContext);
