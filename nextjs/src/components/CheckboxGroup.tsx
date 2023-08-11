import { Field } from "formik";
import { FC } from "react";

type CheckboxOption = {
  id: string;
  label: string;
  helpText: string;
};

type CheckboxGroupProps = {
  options: CheckboxOption[];
};

export const CheckboxGroup: FC<CheckboxGroupProps> = ({ options }) => (
  <div className="mt-2 ml-4 space-y-6 mb-2">
    {options.map((option) => (
      <div className="relative flex gap-x-3" key={option.id}>
        <div className="flex h-6 items-center">
          <Field
            type="checkbox"
            id={option.id}
            name={option.id}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor={option.id} className="font-medium text-gray-900">
            {option.label}
          </label>
          <p className="text-gray-500">{option.helpText}</p>
        </div>
      </div>
    ))}
  </div>
);
