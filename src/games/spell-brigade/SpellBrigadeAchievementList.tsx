import Icon from "@/components/Icon";
import UserAchievement from "@/models/UserAchievement";

interface SpellBrigadeAchievementListProps {
  achievements: UserAchievement[];
}

const SpellBrigadeAchievementList = ({
  achievements,
}: SpellBrigadeAchievementListProps) => (
  <div className="table">
    {achievements.map((a) => (
      <div key={a.name} className="table-row">
        <div className="table-cell py-1 px-2 border-y text-center">
          <Icon
            name={a.unlockedTimestamp ? "check" : "lock"}
            className="inline mr-2"
          />
        </div>
        <div className="table-cell py-1 px-2 border-y">{a.name}</div>
        <div className="table-cell py-1 px-2 border-y">{a.description}</div>
      </div>
    ))}
  </div>
);

export default SpellBrigadeAchievementList;
