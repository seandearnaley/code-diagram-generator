import { FC } from "react";

export const Error: FC<{ message: string }> = ({ message }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
    <div>Error: {message}</div>
  </div>
);

export default Error;
