"use client";

import { useEffect, useRef, useState } from "react";

import Icon from "@/components/Icon";
import type IconName from "@/components/Icon/IconName";

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  icon: IconName;
  renderOptionIcon?: (option: string) => React.ReactNode;
}

// Generic single-select dropdown shared by the Civilization and DLC filters.
// The selected value falls back to `icon` whenever `renderOptionIcon` isn't
// given (DLC) or returns nothing for the current value (Civilization's "All
// Civilizations" state).
const FilterDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  renderOptionIcon,
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const selectedIcon = value ? renderOptionIcon?.(value) : null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-zinc-800 border-1 border-amber-800/30 rounded flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer min-w-40"
      >
        {selectedIcon ?? (
          <Icon name={icon} size={1} className="text-zinc-400 shrink-0" />
        )}
        <span className="mr-auto truncate">{value || placeholder}</span>
        <Icon
          name="chevron-down"
          size={1}
          className={`text-zinc-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-72 w-56 overflow-y-auto rounded border-1 border-amber-800/40 bg-zinc-900 py-1">
          <li>
            <button
              type="button"
              onClick={() => select("")}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                value === "" ? "text-amber-400" : ""
              }`}
            >
              <Icon name={icon} size={1} className="shrink-0" />
              {placeholder}
            </button>
          </li>
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => select(option)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                  value === option ? "text-amber-400" : ""
                }`}
              >
                {renderOptionIcon?.(option)}
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
