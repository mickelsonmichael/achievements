import Image from "next/image";

const games = [
  {
    src: "/img/halo-mcc/halo-mcc.jpg",
    alt: "Halo: The MasterChief Collection",
    href: "/games/halo-mcc",
  },
  {
    src: "/img/spell-brigade/spell-brigade.png",
    alt: "The Spell Brigade",
    href: "/games/spell-brigade",
  },
  {
    src: "/img/battlefield-6/battlefield-6.jpg",
    alt: "Battlefield 6",
    href: "/games/battlefield-6",
  },
];

interface GameGridProps {
  size?: number;
}

const GameGrid = ({ size = 120 }: GameGridProps) => (
  <ul className="flex">
    {games.map((g) => (
      <li className="m-1" key={g.alt}>
        <a href={g.href}>
          <Image src={g.src} alt={g.alt} height={size} width={size} />
        </a>
      </li>
    ))}
  </ul>
);

export default GameGrid;
