import { Field } from "formik";
import { FC } from "react";

type TextAreaProps = {
  name: string;
  label: string;
  rows: number;
};

export const TextArea: FC<TextAreaProps> = ({ name, label, rows }) => (
  <div className="col-span-full">
    <label
      htmlFor={name}
      className="block text-sm font-medium leading-6 text-gray-900"
    >
      {label}
    </label>
    <div className="mt-2">
      <Field
        component="textarea"
        id={name}
        name={name}
        rows={rows}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>
  </div>
);
