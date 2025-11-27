import { useLogin } from "@/hooks/LoginContext";
import AchievementWithProgress from "@/models/AchievementWithProgress";
import ProgressBar from "@/components/ProgressBar";
import Icon from "../../../components/Icon";

const AchievementsTableRow = ({
  achievement,
}: {
  achievement: AchievementWithProgress;
}) => {
  const { isLoggedInWithXbox } = useLogin();

  const AchievementProgress = () =>
    achievement.progress !== null &&
    typeof achievement.progress !== "boolean" &&
    achievement.progress.target > 1 ? (
      <td className="md:w-100">
        <ProgressBar {...achievement.progress} />
      </td>
    ) : (
      <td />
    );

  return (
    <tr className="flex flex-col md:table-row *:p-3 even:bg-blue-500/25">
      <td className="col-sm">{achievement.name}</td>
      <td className="md:w-100">{achievement.description}</td>
      <td className="col-sm">{achievement.game}</td>
      <td className="col-sm">{achievement.collection}</td>
      {isLoggedInWithXbox && <AchievementProgress />}
      <td className="col-sm">
        <a href={achievement.url} target="_blank" className="hover:underline">
          Guide
          <Icon name="external-link" aria-label="Guide" className="ml-1" />
        </a>
      </td>
    </tr>
  );
};

export default AchievementsTableRow;
