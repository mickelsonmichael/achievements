"use client";

import { DataPadsProvider } from "./DataPadsContext";
import DataPadsFilters from "./DataPadsFilters";
import DataPadsTable from "./DataPadsTable";

const DataPads = () => (
  <DataPadsProvider>
    <DataPadsFilters />
    <DataPadsTable />
  </DataPadsProvider>
);

export default DataPads;
