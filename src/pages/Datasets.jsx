import InsertDataButton from "../components/InsertDataButton";
import ActivityViewer from "../components/ActivityViewer";
import SampleDatasetList from "../components/visualisation_tools/SampleDatasetList";
import SavedDatasetList from "../components/SavedDatasetList";
import { useState } from "react";
import { useDataset } from "../context/DataContext";

function Datasets() {
  const [expanded, setExpanded] = useState(false);
  const { dataset } = useDataset();

  return (
    <div className="max-w-screen-xl py-2 px-6 mx-auto">
      <div className="flex flex-col space-y-2 text-white">
        <h1 className="font-mono font-semibold my-4">Choose a Dataset:</h1>

        <h2 className="font-mono font-semibold mt-4">Sample Datasets</h2>
        <SampleDatasetList />


        <h1 className="font-mono font-semibold my-4">OR</h1>


        <h2 className="font-mono font-semibold mt-4">Your Saved Datasets</h2>
        <SavedDatasetList />

        <div className="bg-gray-800 rounded-lg shadow-md">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left px-5 py-3 font-mono font-semibold text-white bg-gray-900 rounded-t-lg hover:bg-gray-700 transition"
          >
            {expanded ? "▼ Use your own Google History (Hide)" : "▶ Use your own Google History"}
          </button>

          {expanded && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                Download your activity from{" "}
                <a href="https://takeout.google.com" className="underline text-blue-400">
                  Google Takeout
                </a>{" "}
                and select only "Search" history in HTML format.
              </p>

              <InsertDataButton />
            </div>
          )}
        </div>

        

        {dataset?.label && (
          <p className="text-sm text-green-400 font-mono mt-4">
            ✅ Currently selected: <span className="italic">{dataset.label}</span>
          </p>
        )}

        <ActivityViewer />
      </div>
    </div>
  );
}

export default Datasets;
