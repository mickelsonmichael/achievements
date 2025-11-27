import { useLogin } from "@/hooks/LoginContext";
import { useSkulls } from "./SkullsContext";

const SkullsFilters = () => {
  const { skulls, lockedOnly, toggleLockedOnly } = useSkulls();
  const { isLoggedIn } = useLogin();

  return (
    <>
      <div className="flex flex-col gap-1 md:flex-row">
        <div className="mr-auto">{skulls.length} total skull(s)</div>
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
                  className="mr-1"
                  checked={!lockedOnly}
                  onChange={toggleLockedOnly}
                />
                Show unlocked
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SkullsFilters;
