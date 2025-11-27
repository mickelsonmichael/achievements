import { SkullsProvider } from "./SkullsContext";
import SkullsFilters from "./SkullsFilters";
import SkullsTable from "./SkullsTable";

const SkullsPage = () => (
  <SkullsProvider>
    <SkullsFilters />
    <SkullsTable />
  </SkullsProvider>
);

export default SkullsPage;
