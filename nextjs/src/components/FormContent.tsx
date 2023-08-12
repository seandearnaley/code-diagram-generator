import React, { FC } from "react";

interface FormContentProps {
  title: string;
  children: React.ReactNode;
}

export const FormContent: FC<FormContentProps> = ({ title, children }) => (
  <div>
    <div className="border-b border-gray-900/10 pl-4">
      <h2 className="text-base font-semibold leading-10 text-gray-900">
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-2 gap-4 pl-4">{children}</div>
  </div>
);

export default FormContent;
