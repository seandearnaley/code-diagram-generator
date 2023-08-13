import { FC, useEffect, useState } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number; // Time in milliseconds
}

export const Toast: FC<ToastProps> = ({ message, type, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${getBgColor()}`}
    >
      {message}
    </div>
  );
};
