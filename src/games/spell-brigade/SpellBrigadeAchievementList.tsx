import Icon from "@/components/Icon";
import UserAchievement from "@/models/UserAchievement";

interface SpellBrigadeAchievementListProps {
  achievements: UserAchievement[];
}

const SpellBrigadeAchievementList = ({
  achievements,
}: SpellBrigadeAchievementListProps) => {
  const sortedAchievements = achievements
    .filter((a) => !a.description?.startsWith("As "))
    .sort((a, b) => {
      const aUnlocked = a.unlockedTimestamp != null ? 1 : 0;
      const bUnlocked = b.unlockedTimestamp != null ? 1 : 0;
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
      return a.description?.localeCompare(b.description || "") || 0;
    });

  return (
    <div className="bg-zinc-800 rounded py-3 px-5">
      <div className="text-2xl mb-3">Non-Hero Achievements</div>
      <div className="table w-full">
        {sortedAchievements.map((a) => (
          <div
            key={a.name}
            className={`table-row hover:bg-zinc-700 cursor-pointer ${
              a.unlockedTimestamp != null ? "bg-zinc-900" : ""
            }`}
          >
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
    </div>
  );
};

export default SpellBrigadeAchievementList;
