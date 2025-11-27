import React from "react";
import { useSkulls } from "./SkullsContext";
import SkullsTableRow from "./SkullsTableRow";
import Icon from "@/components/Icon";

const SkullsTable = () => {
  const { skulls } = useSkulls();

  if (skulls.length < 1) {
    return (
      <div className="bg-green-950 p-6 flex-row flex items-center rounded-sm mt-4">
        <Icon name="check" className="mr-3" />
        <p>Congratulations, you&apos;ve unlocked all the skulls! Way to go.</p>
      </div>
    );
  }

  return (
    <table className="flex flex-col md:table table-auto mt-2 border-1 w-full">
      <thead>
        <tr className="flex flex-col md:table-row *:p-2 bg-blue-500/50 border-1">
          <td>Name</td>
          <td>Game</td>
          <td>Level</td>
          <td>Min. Difficulty</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        {skulls.map((s) => (
          <SkullsTableRow key={`${s.game}-${s.name}`} skull={s} />
        ))}
      </tbody>
    </table>
  );
};

export default SkullsTable;
