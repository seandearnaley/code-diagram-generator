import { Field, FieldArray } from "formik";
import { FC } from "react";

type Option = {
  id: string;
  name: string;
  description?: string;
};

type Props = {
  options: Option[];
  name: string;
  label?: string;
  helpText?: string;
  onChange?: (optionId: string) => void;
};

export const RadioButtonGroup: FC<Props> = ({
  options,
  name,
  label,
  helpText,
  onChange,
}) => (
  <FieldArray name={name}>
    <div className="border-b border-gray-900/10 pb-6">
      <div className="mt-2 space-y-10">
        <fieldset>
          {label ? (
            <legend className="text-sm font-semibold leading-6 text-gray-900">
              <div>{label}</div>
            </legend>
          ) : null}

          {helpText ? (
            <p className="mt-1 text-sm leading-6 text-gray-600  border-gray-900/10">
              {helpText}
            </p>
          ) : null}
          <div className="mt-6 space-y-6 overflow-y-auto max-h-[300px]">
            {options.map((option) => (
              <div key={option.id} className="flex flex-col">
                <label
                  htmlFor={`push-everything-${option.id}`}
                  className="flex items-center text-sm font-medium leading-6 text-gray-900"
                >
                  <Field
                    type="radio"
                    id={`push-everything-${option.id}`}
                    name={name}
                    value={option.id}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 my-auto mr-2 ml-4"
                    onChange={() => onChange && onChange(option.id)}
                  />
                  <span className="my-auto">{option.name}</span>
                </label>
                {option.description ? (
                  <p className="ml-10 text-sm leading-6 text-gray-600">
                    {option.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </FieldArray>
);
