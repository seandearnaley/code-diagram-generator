import { Field } from "formik";
import { FC } from "react";

type TextInputProps = {
  name: string;
  label: string;
};

export const TextInput: FC<TextInputProps> = ({ name, label }) => (
  <div className="sm:col-span-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium leading-6 text-gray-900"
    >
      {label}
    </label>
    <div className="mt-2">
      <Field
        component="input"
        id={name}
        name={name}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>
  </div>
);
