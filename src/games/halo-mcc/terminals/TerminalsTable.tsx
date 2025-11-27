import React from "react";
import { useTerminals } from "./TerminalsContext";
import TerminalsTableRow from "./TerminalsTableRow";
import Icon from "@/components/Icon";

const TerminalsTable = () => {
  const { terminals } = useTerminals();

  if (terminals.length < 1) {
    return (
      <div className="bg-green-950 p-6 flex-row flex items-center rounded-sm mt-4">
        <Icon name="check" className="mr-3" />
        <p>Congratulations, you&apos;ve unlocked all the terminals! Way to go.</p>
      </div>
    );
  }

  return (
    <table className="flex flex-col md:table table-auto mt-2 border-1 w-full">
      <thead>
        <tr className="flex flex-col md:table-row *:p-2 bg-blue-500/50 border-1">
          <td>Terminal</td>
          <td>Level</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        {terminals.map((t) => (
          <TerminalsTableRow key={`${t.game}-${t.id}`} terminal={t} />
        ))}
      </tbody>
    </table>
  );
};

export default TerminalsTable;
