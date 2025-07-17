// components/Toolbar.jsx
import DatasetDropdown from "./DatasetDropdown";

import { BookOpen } from "lucide-react";

const Toolbar = ({
  datasetLabel,
  datasets,
  onSelectDataset,
  onStartClassification,
}) => {

  return (
    <div
      className="w-full bg-[black] relative z-50 py-1 pl-16 pr-4 shadow-lg"
      style={{
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.7)",
  }}
    >
      <div className="flex gap-3 items-center justify-center">
        <div className="relative flex-grow group">
          <div
            className={`transition-all duration-300   border-gray-700 text-white text-sm `}
          >
            <DatasetDropdown
              value={datasetLabel}
              datasets={datasets}
              onChange={onSelectDataset}
              className="min-w-[200px]"
            />
          </div>
        </div>

        <div className="flex space-x-2">
            <button
          onClick={onStartClassification}
          className="rounded-full p-2 bg-gradient-to-br from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white shadow-lg transition-all duration-200"
          title="Classify queries"
        >
          <BookOpen className="h-4 w-4" />
        </button>

  <button
          onClick={onStartClassification}
          className="rounded-full p-2 bg-gradient-to-br from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white shadow-lg transition-all duration-200"
          title="Classify queries"
        >
          <BookOpen className="h-4 w-4" />
        </button>


        </div>

      </div>
    </div>
  );
};

export default Toolbar;
