import { useEffect, useState } from "react";
import { getDB } from "../utils/db";
import { useDataset } from "../context/DataContext";

export default function SavedDatasetList() {
  const [datasets, setDatasets] = useState([]);
  const { setDataset } = useDataset();

  useEffect(() => {
    const fetch = async () => {
      try {
        const db = await getDB();
        const all = await db.getAll("savedDatasets");
        setDatasets(all.reverse()); // newest first
      } catch (err) {
        console.error("⚠️ Could not load saved datasets:", err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {datasets.length === 0 ? (
        <p className="text-gray-400 text-sm">No saved datasets yet.</p>
      ) : (
        datasets.map(ds => (
          <button
            key={ds.id}
            onClick={() =>
              setDataset({ source: "saved", label: ds.name, records: ds.records })
            }
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-md px-4 py-2 text-left"
          >
            {ds.name}
            <span className="block text-xs text-gray-400">{new Date(ds.date).toLocaleString()}</span>
          </button>
        ))
      )}
    </div>
  );
}
