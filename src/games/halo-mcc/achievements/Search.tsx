import { useAchievements } from "@/games/halo-mcc/achievements/AchievementsContext";
import Icon from "@/components/Icon";
import { useRef } from "react";

const Search = () => {
  const { search, setSearch } = useAchievements();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex bg-white/40 rounded-sm my-2 justify-items-stretch items-center">
      <Icon
        name="search"
        className="mx-4"
        onClick={() => inputRef.current?.focus()}
      />
      <input
        ref={inputRef}
        className="py-2 pr-3 flex-grow-1 focus:outline-0"
        type="text"
        onChange={({ target: { value } }) => setSearch(value)}
        value={search}
        placeholder="Search"
      />
    </div>
  );
};

export default Search;
