import React from "react";
import { ConsentProvider } from "./ConsentProvider";
import { DatasetProvider } from "./DatasetProvider";
import { CategoryFilterProvider } from "./CategoryFilterProvider";

const AppProviders = ({ children }) => (
  <ConsentProvider>
    <DatasetProvider>
      <CategoryFilterProvider>{children}</CategoryFilterProvider>
    </DatasetProvider>
  </ConsentProvider>
);

export default AppProviders;
