import { FC } from "react";

export const Loading: FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
    <div className="animate-spin">{message}</div>
  </div>
);

export default Loading;
