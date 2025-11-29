import { ButtonHTMLAttributes } from "react";
import Icon, { IconName } from "./Icon";

type SquareButtonProps = {
  size?: number;
  name: IconName;
  className?: string;
  color?: string;
  isActive?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const SquareButton = ({
  size,
  name,
  className,
  color,
  isActive,
  ...props
}: SquareButtonProps) => (
  <button
    type="button"
    className={`${
      isActive ? "bg-white/10" : ""
    } hover:bg-black/20 p-1 rounded cursor-pointer flex ${className || ""}`}
    {...props}
  >
    <Icon name={name} size={size} className={color && `text-${color}`} />
  </button>
);

export default SquareButton;
