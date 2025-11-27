import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import Icon from "../../components/Icon";

const Unmatched = () => {
  const { unfilteredAchievements, userAchievements } = useAchievements();

  if (userAchievements.length == 0) {
    return (
      <div className="bg-white/10 mb-2 rounded-sm py-2 px-4">
        <p>
          No user achievements have been loaded. Can&apos;t check for
          duplicates.
        </p>
      </div>
    );
  }

  const unmatchedData = unfilteredAchievements
    .filter((a) => !userAchievements.map((b) => b.name).includes(a.name))
    .map((a) => a.name)
    .sort();

  const unmatchedSteam = userAchievements
    .filter((a) => !unfilteredAchievements.map((b) => b.name).includes(a.name))
    .map((a) => a.name)
    .sort();

  if (unmatchedData.length == 0 && unmatchedSteam.length == 0) {
    return (
      <div className="bg-teal-500/10 mb-2 rounded-sm py-2 px-4">
        <p>
            <Icon name="check" className="mr-2" />
            No mismatches have been found in the achievement titles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-900/50 mb-2 rounded-sm py-2 px-4 grid grid-cols-2 gap-4">
      <div className="text-right">
        <p className="text-lg strong">Unmatched from Data</p>
        <ul>
          {unmatchedData.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          <p className="text-lg strong">Unmatched from Steam</p>
          {unmatchedSteam.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Unmatched;
