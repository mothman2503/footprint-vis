import DatasetDropdown from "./DatasetDropdown";
import LanguageSwitch from "../components/LanguageSwitch";
import { BookOpen } from "lucide-react";

const DatasetToolbar = ({
  datasetLabel,
  onSetDataset,
  onStartClassification,
  savedDatasets,
  sampleDatasets,
  promptOpen = false,
}) => {
  return (
    <div className="w-full bg-[#1e2626] relative z-50 py-1 pl-16 pr-4">
      <div className="flex gap-3 items-center justify-center">
        <div className="relative flex-grow group">
          <div className="transition-all duration-300 border-gray-700 text-white text-sm">
            <DatasetDropdown
              value={datasetLabel}
              datasets={[...sampleDatasets, ...savedDatasets]}
              onChange={onSetDataset}
              promptOpen={promptOpen}
              className="min-w-[200px]"
            />
          </div>
        </div>

        <LanguageSwitch />
        <div className="flex space-x-2">
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

export default DatasetToolbar;
