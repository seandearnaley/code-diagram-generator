import { FC, MouseEventHandler } from "react";

interface GenericButtonProps {
  label: string;
  type: "submit" | "button";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const GenericButton: FC<GenericButtonProps> = ({
  label,
  type,
  onClick,
  className,
}) => (
  <button
    type={type}
    className={`rounded-md text-sm font-semibold leading-6 ${className}`}
    onClick={onClick}
    aria-label={label}
  >
    {label}
  </button>
);
