import React, { createContext, useContext, useState } from "react";

const DatasetContext = createContext();

export const DatasetProvider = ({ children }) => {
  const [dataset, setDataset] = useState(null); // { source: "user" | "sample", records: [] }

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => useContext(DatasetContext);
