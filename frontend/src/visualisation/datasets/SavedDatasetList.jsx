import { useEffect, useState } from "react";
import { getDB } from "../../utils/db";
import { useDataset } from "../../DataContext";
import { Save, Clock } from "lucide-react";

export default function SavedDatasetList() {
  const [datasets, setDatasets] = useState([]);
  const { setDataset, dataset } = useDataset();

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {datasets.length === 0 ? (
        <p className="text-gray-400 text-sm">No saved datasets yet.</p>
      ) : (
        datasets.map((ds) => (
          <button
            key={ds.id}
            onClick={() =>
              setDataset({ source: "saved", label: ds.name, records: ds.records })
            }
            className={`p-4 rounded-md text-white transition shadow-sm text-left border ${
              dataset?.label === ds.name
                ? "bg-blue-700 border-blue-400 ring-2"
                : "bg-gray-800 hover:bg-gray-700 border-gray-700"
            }`}
          >
            <div className="flex items-center mb-2">
              <Save className="h-5 w-5 text-green-300 mr-2" />
              <span className="text-lg font-semibold">{ds.name}</span>
            </div>
            <p className="text-sm text-gray-400">
              Your custom labeled dataset. Loaded from local DB.
            </p>
            <div className="mt-3 text-xs text-green-300 font-mono">📁 Source: Saved</div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(ds.date).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">🧾 {ds.records.length} records</div>
          </button>
        ))
      )}
    </div>
  );
}
