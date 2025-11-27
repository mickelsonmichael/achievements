import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import Game from "@/models/Game";
import ToggleButton from "@/components/ToggleButton";

const GameCheckboxes = () => {
  const { games, toggleGame, focusGame, enableAllGames, disableAllGames } =
    useAchievements();

  return (
    <>
      {Object.values(Game).map((g) => {
        const enabled = games.includes(g);
        const key = `filter-game-${g}`;

        return (
          <ToggleButton
            key={key}
            name={key}
            enabled={enabled}
            onToggle={() => toggleGame(g)}
            actions={[{ icon: "crosshair", onClick: () => focusGame(g) }]}
          >
            {g}
          </ToggleButton>
        );
      })}
      <div className="grid grid-cols-2">
        <div
          onClick={enableAllGames}
          className={
            "cursor-pointer border-1 rounded-sm p-2 m-1 select-none text-center " +
            (games.length === Object.values(Game).length
              ? "bg-blue-950"
              : "")
          }
        >
          All
        </div>
        <div
          onClick={disableAllGames}
          className={
            "cursor-pointer border-1 rounded-sm p-2 m-1 select-none text-center " +
            (games.length === 0 ? "bg-blue-950" : "")
          }
        >
          None
        </div>
      </div>
    </>
  );
};

export default GameCheckboxes;
