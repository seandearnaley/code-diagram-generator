import { Field } from "formik";
import { FC } from "react";
import { Option } from "../types/types";

type Props = {
  options: Option[];
  label: string;
  name: string;
  helpText?: string;
  id: string;
  onChange?: (optionId: string) => void;
};

export const SelectField: FC<Props> = ({
  options,
  label,
  name,
  helpText,
  id,
  onChange,
}) => (
  <div className="sm:col-span-3 mt-10">
    <label
      htmlFor={`${id}`}
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
        as="select"
        name={name}
        id={id}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onChange && onChange(e.target.value)
        }
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Field>
    </div>
  </div>
);
