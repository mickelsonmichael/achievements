"use client";

import { TerminalsProvider } from "./TerminalsContext";
import TerminalsFilters from "./TerminalsFilters";
import TerminalsTable from "./TerminalsTable";

const Terminals = () => (
  <TerminalsProvider>
    <TerminalsFilters />
    <TerminalsTable />
  </TerminalsProvider>
);

export default Terminals;
