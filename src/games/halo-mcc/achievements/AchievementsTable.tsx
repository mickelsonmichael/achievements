import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import { useLogin } from "@/hooks/LoginContext";
import AchievementsTableRow from "./AchievementsTableRow";

const AchievementsTable = () => {
  const { achievements } = useAchievements();
  const { isLoggedInWithXbox } = useLogin();

  return (
    <table className="flex flex-col md:table table-auto mt-2 border-1 w-full">
      <thead>
        <tr className="flex flex-col md:table-row *:p-2 bg-blue-500/50 border-1">
          <td>Title</td>
          <td>Description</td>
          <td>Game</td>
          <td>Collection</td>
          {isLoggedInWithXbox && <td>Progress</td>}
          <td />
        </tr>
      </thead>
      <tbody>
        {achievements.map((achievement) => (
          <AchievementsTableRow
            key={`${achievement.game}-${achievement.name}`}
            achievement={achievement}
          />
        ))}
      </tbody>
    </table>
  );
};

export default AchievementsTable;
