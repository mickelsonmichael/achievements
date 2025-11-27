import useToggle from "@/hooks/useToggle";
import Skull from "@/models/Skull";

const SkullsTableRow = ({ skull }: { skull: Skull }) => {
  const { isOn: isOpen, toggle } = useToggle();
  const youTubeUrl = `https://www.youtube.com/embed/${skull.video}`;

  return (
    <>
      <tr
        className={`
            flex
            flex-col
            md:table-row
            *:p-2
            nth-[4n+1]:bg-blue-500/25
            nth-[4n+3]:bg-blue-950/25
        `}
      >
        <td>{skull.name}</td>
        <td>{skull.game}</td>
        <td>{skull.level}</td>
        <td>{skull.difficulty}</td>
        <td className="text-right">
          <button onClick={toggle} className="cursor-pointer underline">
            { isOpen ? "Hide": "View" }
          </button>
        </td>
      </tr>
      <tr className={isOpen ? "" : "hidden"}>
        <td colSpan={4}>
          <div className="px-2 py-3">
            <p>{skull.location}</p>

            <div className="flex flex-col items-center px-2 py-4">
              <iframe
                loading="lazy"
                className="w-full max-w-[720px] aspect-video"
                src={youTubeUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default SkullsTableRow;
