import { FC, MouseEventHandler } from "react";

/**
 * Props for the CancelButton component.
 * @param label - Optional label for the button.
 * @param onClick - Optional click event handler for the button.
 */
interface CancelButtonProps {
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * CancelButton component that can be used to reset or navigate away from a form.
 * @param label - Optional label for the button.
 * @param onClick - Optional click event handler for the button.
 */
export const CancelButton: FC<CancelButtonProps> = ({
  label = "Cancel",
  onClick,
}) => (
  <button
    type="button"
    className="text-sm font-semibold leading-6 text-gray-900"
    onClick={onClick}
    aria-label={label}
  >
    {label}
  </button>
);
