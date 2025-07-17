import { useState } from "react";
import { useDataset } from "../DataContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Uploader from "../visualisation/datasets/Uploader";
import Viewer from "../visualisation/datasets/Viewer";
import SampleDatasetList from "../visualisation/datasets/SampleDatasetList";
import SavedDatasetList from "../visualisation/datasets/SavedDatasetList";

import { FolderInput, Save, History, BarChart3 } from "lucide-react";

function Datasets() {
  const [expanded, setExpanded] = useState(false);
  const { dataset } = useDataset();
  const showVisualizeButton = !!dataset?.label;

  return (
    <div className="max-w-screen-xl py-6 px-6 mx-auto relative text-white">
      {/* Floating visualize button */}
      <AnimatePresence>
        {showVisualizeButton && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50"
          >
            <Link
              to="/visualise"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-mono px-4 py-2 rounded-full shadow-lg shadow-blue-900 transition"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Visualize Dataset</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col space-y-8">
        {/* Sample Datasets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="px-2 md:px-0"
        >
          <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold text-lg">
            <FolderInput className="w-5 h-5" />
            Sample Datasets
          </div>
          <SampleDatasetList />
        </motion.div>

        <div className="w-full bg-gray-700 h-[1px]" />

        {/* Saved Datasets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="px-2 md:px-0"
        >
          <div className="flex items-center gap-2 mb-2 text-green-300 font-bold text-lg">
            <Save className="w-5 h-5" />
            Saved Datasets
          </div>
          <SavedDatasetList />
        </motion.div>

        <div className="w-full bg-gray-700 h-[1px]" />

        {/* Google History Upload */}
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="bg-gray-800 rounded-lg shadow-md overflow-hidden px-2 md:px-0"
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left px-5 py-3 font-mono font-semibold bg-gray-900 hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-yellow-300" />
              {expanded
                ? "\u25BC Use your own Google History (Hide)"
                : "\u25B6 Use your own Google History"}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                key="expanded-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="overflow-hidden px-5 py-4 border-t border-gray-700"
              >
                <p className="text-sm text-gray-400 mb-3">
                  Download your search activity from{" "}
                  <a
                    href="https://takeout.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400"
                  >
                    Google Takeout
                  </a>{" "}
                  \u2014 select only the <strong>"Search"</strong> history in{" "}
                  <strong>HTML format</strong>.
                </p>
                <Uploader />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Currently selected info */}
        <AnimatePresence>
          {dataset?.label && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-green-400 font-mono mt-2 px-2 md:px-0"
            >
              \u2705 Currently selected: <span className="italic">{dataset.label}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Viewer */}
        <div className="px-2 md:px-0">
          <Viewer />
        </div>
      </div>
    </div>
  );
}

export default Datasets;