"use client";

import { LiHTMLAttributes, ReactNode, useMemo } from "react";
import Link from "next/link";
import Icon, { IconName } from "@/components/Icon";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  to: string;
  children: ReactNode;
  newWindow?: boolean;
  icon?: IconName;
} & LiHTMLAttributes<HTMLLIElement>;

const NavLink = ({
  to,
  children,
  className,
  icon = undefined,
  newWindow = false,
  ...props
}: NavLinkProps) => {
  const pathName = usePathname();
  const isActive = useMemo(() => pathName === to, [pathName, to]);

  const calculatedClassName = className ?? `
    flex
    items-center
    px-3
    py-2
    ${isActive ? "bg-slate-400/20 rounded-sm" : ""}
  `

  return (
    <li {...props} className={calculatedClassName}>
      <Link href={to} target={newWindow ? "_blank" : undefined}>
        {icon && <Icon name={icon} className="mr-2" />}
        {children}
      </Link>
    </li>
  );
};

export default NavLink;
