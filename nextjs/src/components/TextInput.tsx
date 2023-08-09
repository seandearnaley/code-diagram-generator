import { Field } from "formik";
import { FC } from "react";

type TextInputProps = {
  name: string;
  label: string;
  helpText?: string;
};

export const TextInput: FC<TextInputProps> = ({ name, label, helpText }) => (
  <div className="sm:col-span-4 mt-10">
    <label
      htmlFor={name}
      className="block text-sm font-medium leading-6 text-gray-900"
    >
      {label}
    </label>
    {helpText ? (
      <p className="mt-1 text-sm leading-6 text-gray-600  border-gray-900/10">
        {helpText}
      </p>
    ) : null}
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
