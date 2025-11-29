import Icon, { IconName } from "@/components/Icon";
import { ReactNode } from "react";

interface InfoProps {
  icon: IconName;
  children: ReactNode;
}

const Info = ({ children, icon }: InfoProps) => (
  <div className="bg-cyan-800 py-4 px-8">
    <Icon name={icon} className="mr-4" />
    {children}
  </div>
);

export default Info;
