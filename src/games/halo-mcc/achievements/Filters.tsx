import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import CollectionCheckboxes from "@/games/halo-mcc/achievements/CollectionCheckboxes";
import Icon from "@/components/Icon";
import GameCheckboxes from "@/games/halo-mcc/achievements/GameCheckboxes";
import useCachedToggle from "@/hooks/useCachedToggle";
import { useLogin } from "@/hooks/LoginContext";

const Filters = () => {
  const { isOn: showFilters, toggle: toggleFilters } =
    useCachedToggle("FILTERS_ON");
  const { achievements, collections, lockedOnly, toggleLockedOnly } =
    useAchievements();
  const { isLoggedIn } = useLogin();

  return (
    <>
      <div className="flex flex-col gap-1 md:flex-row">
        <div className="mr-auto">
          {achievements.length} total achievement(s)
        </div>
        <div className="flex gap-1">
          {isLoggedIn && (
            <div className="mr-auto md:mx-3">
              <label
                htmlFor="lockedOnlyToggle"
                className="cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="lockedOnlyToggle"
                  onChange={toggleLockedOnly}
                  checked={!lockedOnly}
                  className="mr-1"
                />
                Show unlocked
              </label>
            </div>
          )}
          <div
            className={`inline-flex flex-col align-middle p-1 cursor-pointer rounded-sm max-w-auto ${
              showFilters && "bg-white/10"
            }`}
            onClick={toggleFilters}
          >
            <Icon name="filter" />
          </div>
        </div>
      </div>

      <div
        className={
          "overflow-hidden " +
          (showFilters ? "h-auto border-1 rounded-sm p-2 mt-2" : "h-0")
        }
      >
        <div className="">
          <div>
            <p className="text-lg my-2">Games</p>
            <div className="grid grid-cols-2 md:grid-cols-4">
              <GameCheckboxes />
            </div>
          </div>
          <div>
            <p className="text-lg my-2">Collections</p>
            {collections.length > 0 ? (
              <div className="grid md:grid-cols-4">
                <CollectionCheckboxes />
              </div>
            ) : (
              <p className="bg-gray-500/30 p-3 rounded-md text-gray-300">
                <Icon name="info" className="mr-2" />
                Narrow your filter to a single game to filter further by
                collection.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Filters;
