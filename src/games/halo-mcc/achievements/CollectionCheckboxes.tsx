import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import ToggleButton from "@/components/ToggleButton";

const CollectionCheckboxes = () => {
  const {
    collections,
    toggleCollection,
    enableAllCollections,
    disableAllCollections,
    focusCollection,
  } = useAchievements();

  return (
    <>
      {collections.map(({ name, enabled }) => {
        const key = `filter-collection-${name}`;

        return (
          <ToggleButton
            key={key}
            name={key}
            enabled={enabled}
            onToggle={() => toggleCollection(name)}
            actions={[
              { icon: "crosshair", onClick: () => focusCollection(name) },
            ]}
          >
            {name}
          </ToggleButton>
        );
      })}
      <div className="grid grid-cols-2">
        <div
          onClick={enableAllCollections}
          className={
            "cursor-pointer border-1 rounded-sm p-2 m-1 select-none text-center " +
            (collections.every((x) => x.enabled) ? "bg-blue-950" : "")
          }
        >
          All
        </div>
        <div
          onClick={disableAllCollections}
          className={
            "cursor-pointer border-1 rounded-sm p-2 m-1 select-none text-center " +
            (collections.some((x) => x.enabled) ? "" : "bg-blue-950")
          }
        >
          None
        </div>
      </div>
    </>
  );
};

export default CollectionCheckboxes;
