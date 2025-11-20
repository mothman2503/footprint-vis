import React from "react";
import { DatasetProvider } from "./DatasetProvider";
import { CategoryFilterProvider } from "./CategoryFilterProvider";

const AppProviders = ({ children }) => (
  <DatasetProvider>
    <CategoryFilterProvider>{children}</CategoryFilterProvider>
  </DatasetProvider>
);

export default AppProviders;
