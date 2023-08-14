import React, { FC } from "react";

interface FormContentProps {
  children: React.ReactNode;
  className?: string;
}

export const FormContent: FC<FormContentProps> = ({ children, className }) => (
  <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

export default FormContent;
