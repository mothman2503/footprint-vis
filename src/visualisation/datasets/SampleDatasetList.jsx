import { useDataset } from "../../DataContext";
import sampleDataset from "../../assets/constants/sample-datasets/classified_records_OvGU.json";
import { BookOpen } from "lucide-react";

const samples = [
  {
    name: "OvGU Sample Dataset",
    data: sampleDataset,
    description: "Contains IAB-labeled search queries from the OvGU batch collection.",
  },
];

export default function SampleDatasetList() {
  const { setDataset, dataset } = useDataset();

  const loadSample = (data, label) => {
    setDataset({ source: "sample", label, records: data });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {samples.map((file) => (
        <button
          key={file.name}
          onClick={() => loadSample(file.data, file.name)}
          className={`p-4 rounded-md text-white transition shadow-sm text-left border ${
            dataset?.label === file.name
              ? "bg-blue-700 border-blue-400 ring-2"
              : "bg-gray-800 hover:bg-gray-700 border-gray-700"
          }`}
        >
          <div className="flex items-center mb-2">
            <BookOpen className="h-5 w-5 text-blue-300 mr-2" />
            <span className="text-lg font-semibold">{file.name}</span>
          </div>
          <p className="text-sm text-gray-400">{file.description}</p>
          <div className="mt-3 text-xs text-blue-300 font-mono">📁 Source: Sample</div>
          <div className="text-xs text-gray-500">🧾 {file.data.length} records</div>
        </button>
      ))}
    </div>
  );
}
