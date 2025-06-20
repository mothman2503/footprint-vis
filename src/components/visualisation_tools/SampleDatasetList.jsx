import { useDataset } from "../../context/DataContext";
import sampleDataset from "../../constants/sample-datasets/classified_records_OvGU.json";

const samples = [
  { name: "OvGU Sample Dataset", data: sampleDataset },
];

export default function SampleDatasetList() {
  const { setDataset, dataset } = useDataset();

  const loadSample = (data, label) => {
    setDataset({ source: "sample", label, records: data });
  };

  return (
    <div className="flex flex-col gap-2">
      {samples.map((file) => (
        <button
          key={file.name}
          onClick={() => loadSample(file.data, file.name)}
          className={`p-2 rounded text-white font-mono transition ${
            dataset?.label === file.name
              ? "bg-blue-700 ring-2 ring-blue-400"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          {file.name}
        </button>
      ))}
    </div>
  );
}
