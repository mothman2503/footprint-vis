import React, { useState, useEffect, useRef } from "react";
import FileViewer from "./FileViewer";
import { openDB } from "idb";
import { VscFile, VscArrowCircleUp } from "react-icons/vsc";

const dbPromise = openDB("fileStorage", 1, {
  upgrade(db) {
    db.createObjectStore("files");
  },
});

const FileUploader = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing file from IndexedDB
  const loadCachedFile = async () => {
    const db = await dbPromise;
    const file = await db.get("files", "History.json");
    if (file) setSelectedFile(file);
  };

  useEffect(() => {
    loadCachedFile();
  }, []);

  const saveToIndexedDB = async (key, value) => {
    const db = await dbPromise;
    await db.put("files", value, key);
  };

  const deleteFileFromIndexedDB = async (key) => {
    const db = await dbPromise;
    await db.delete("files", key);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    fileInputRef.current.value = null;

    if (!files.length) return;

    const file = files[0];
    if (file.name !== "History.json") {
      alert("Only a file named 'History.json' is allowed.");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const jsonData = JSON.parse(content);

        if (
          !jsonData.hasOwnProperty("Browser History") ||
          !Array.isArray(jsonData["Browser History"])
        ) {
          throw new Error("Invalid structure: Missing 'Browser History' array.");
        }

        const requiredKeys = [
          "favicon_url",
          "page_transition_qualifier",
          "title",
          "url",
          "time_usec",
          "client_id",
        ];

        const isValidEntry = (entry) =>
          requiredKeys.every((key) => entry.hasOwnProperty(key));

        const allValid = jsonData["Browser History"].every(isValidEntry);

        if (!allValid) {
          throw new Error("Invalid structure: Some entries are missing required fields.");
        }

        const newFile = {
          name: file.name,
          type: file.type,
          data: jsonData,
          fileData: content,
        };

        setSelectedFile(newFile);
        saveToIndexedDB("History.json", newFile);
      } catch (err) {
        console.error("Invalid JSON file:", err);
        alert("Failed to parse History.json: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const clearFile = async () => {
    await deleteFileFromIndexedDB("History.json");
    setSelectedFile(null);
  };

  return (
    <div>
      {!selectedFile && (
        <div
          className="w-full h-36 bg-slate-50 flex flex-col items-center justify-center cursor-pointer border-dashed border-slate-300 border-2 box-border rounded hover:bg-slate-200 hover:border-slate-500"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <VscFile className="h-12 w-8" />
          <div className="relative -top-6 left-3 rounded-full p-0 bg-indigo-300/90">
            <VscArrowCircleUp />
          </div>
          <p className="text-sm text-slate-800">
            Drag and drop your <strong>History.json</strong> file here or{" "}
            <span className="hover:underline hover:text-indigo-800">Choose File</span>
          </p>
        </div>
      )}

      {loading && <p className="mt-4">Loading file...</p>}

      {selectedFile && (
        <div className="mt-4">
          <FileViewer fileName={selectedFile.name} data={selectedFile.data} />
          <button
            onClick={clearFile}
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
