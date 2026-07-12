"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onToggle: () => unknown;
}

const Modal = ({
  isOpen,
  children,
  title = undefined,
  onToggle,
}: ModalProps) => (
  <div
    className={`
        fixed
        top-0
        right-0
        left-0
        bottom-0
        z-100
        bg-black/80
        backdrop-blur-xs
        ${isOpen ? "block" : "hidden"}
    `}
  >
    <div
      className={`
        bg-zinc-900
        border-1
        border-zinc-700
        rounded-lg
        shadow-2xl
        shadow-black/60
        fixed
        top-1/10
        left-1/10
        right-1/10
        max-h-8/10
        flex
        flex-col
        md:max-w-[50vw]
        md:left-1/2
        md:right-unset
        md:-translate-x-1/2
    `}
    >
      <div
        className={`
        flex
        items-center
        shrink-0
        border-zinc-700
        px-4
        ${title ? "py-3" : "py-1"}
        ${title ? "border-b-1" : ""}
        `}
      >
        {title && (
          <div className="text-lg font-semibold text-zinc-100">{title}</div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="cursor-pointer ml-auto text-zinc-400 hover:text-zinc-100 text-xl leading-none"
          >
            &times;
          </button>
        )}
      </div>
      <div className="p-4 overflow-y-auto">{children}</div>
    </div>
  </div>
);

export default Modal;
