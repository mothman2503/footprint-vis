import React, { useState, useEffect } from "react";
import FileViewer from "./FileViewer";
import Papa from "papaparse"; // CSV parsing library
import { openDB } from "idb"; // To use IndexedDB for cache storage
import { VscFile, VscArrowCircleUp } from "react-icons/vsc";


// Open IndexedDB for caching
const dbPromise = openDB("fileStorage", 1, {
  upgrade(db) {
    db.createObjectStore("files");
  },
});

const FileUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Save to IndexedDB
  const saveToIndexedDB = async (key, value) => {
    const db = await dbPromise;
    await db.put("files", value, key);
  };

  // Get all files from IndexedDB
  const loadCachedFiles = async () => {
    const db = await dbPromise;
    const keys = await db.getAllKeys("files");
    const files = await Promise.all(keys.map((key) => db.get("files", key)));
    setUploadedFiles(files);
  };

  // Load cached files when the component mounts
  useEffect(() => {
    loadCachedFiles();
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setLoading(true);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;

        // Process CSV file using PapaParse
        if (file.type === "text/csv") {
          Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const newFile = {
                name: file.name,
                type: file.type,
                data: result.data,
                fileData: content, // Store raw content for caching
              };
              setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
              saveToIndexedDB(file.name, newFile);
              setLoading(false);
            },
          });
        } else if (file.type === "application/json") {
          const jsonData = JSON.parse(content);
          const newFile = {
            name: file.name,
            type: file.type,
            data: jsonData,
            fileData: content, // Store raw content for caching
          };
          setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
          saveToIndexedDB(file.name, newFile);
          setLoading(false);
        }
      };
      reader.readAsText(file);
    });
  };

  // Handle clicking on a file to display its contents
  const handleFileClick = (file) => {
    setSelectedFile(file); // Set the selected file to display in FileViewer
  };

  // Render FileViewer if a file is selected
  const renderFileViewer = () => {
    if (selectedFile) {
      return (
        <div className="mt-4">
          <FileViewer fileName={selectedFile.name} data={selectedFile.data} />
          <button
            onClick={() => setSelectedFile(null)}
            className="mt-2 p-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close Viewer
          </button>
        </div>
      );
    }
    return null;
  };

  // Handle removing a file from the state and IndexedDB
  const clearFile = (fileName) => {
    if(fileName === selectedFile?.name){
        setSelectedFile(null);
    }
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    deleteFileFromIndexedDB(fileName);
    
  };

  // Remove file from IndexedDB cache
  const deleteFileFromIndexedDB = async (key) => {
    const db = await dbPromise;
    await db.delete("files", key);
  };

  // Handle clearing the cache (IndexedDB)
  const clearCache = () => {
    uploadedFiles.forEach((file) => deleteFileFromIndexedDB(file.name));
    setUploadedFiles([]); // Clear the files from the state
    setSelectedFile(null);
  };

  return (
    <>
      {/* File upload input */}
      <div className="w-full h-36 bg-slate-50 flex flex-col items-center justify-center cursor-pointer border-dashed border-slate-300 border-2 box-border rounded hover:bg-slate-200 hover:border-slate-500" onClick={() => document.querySelector('input[type="file"]').click()}>
      <input type="file" accept=".csv,.json" multiple onChange={handleFileUpload} className="max-w-screen-2xl opacity-0 hidden"/>

<VscFile className="h-12 w-8"/>
<div className="relative -top-6 left-3 rounded-full p-0 bg-indigo-300/90">
<VscArrowCircleUp />
</div>
        <p className=" text-sm text-slate-800 ">
            Drag and Drop file here or <span 
              className="hover:underline hover:text-indigo-800 "
              
            >
              Choose File
            </span>
        </p>
      </div>

      {loading && <p>Loading files...</p>}

      <div className="mt-4">
        {uploadedFiles.length > 0 && (
          <>
            <h3 className="font-bold mb-2">Uploaded Files:</h3>
            <ul>
              {uploadedFiles.map((file, index) => (
                <li key={index} className="mb-2">
                  <div className="flex justify-between items-end">

                    
                    <button
                      onClick={() => handleFileClick(file)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                        <VscFile className="mr-2 h-9 w-6"/>
                      {file.name}
                    </button>
                    <button
                      onClick={() => clearFile(file.name)}
                      className="ml-2 text-red-600"
                    >
                      Clear
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Clear Cache Button */}
        <button
          onClick={clearCache}
          className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>

      {/* Render FileViewer if a file is selected */}
      {renderFileViewer()}
    </>
  );
};

export default FileUploader;
