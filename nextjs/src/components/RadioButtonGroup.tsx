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
  className?: string;
  onChange?: (optionId: string) => void;
};

/**
 * A radio button group component.
 *
 * @param options - The options of the radio button group
 * @param name - The name of the radio button group
 * @param className - The CSS class of the radio button group
 * @param onChange - The function to call when an option is selected
 * @returns The RadioButtonGroup component
 */
const RadioButtonGroup: FC<Props> = ({
  options,
  name,
  className,
  onChange,
}) => (
  <FieldArray name={name}>
    {() => (
      <div className={className}>
        {options.map((option) => (
          <div key={option.id}>
            <label>
              <Field
                type="radio"
                name={name}
                value={option.id}
                onChange={() => onChange && onChange(option.id)}
              />
              <span>{option.name}</span>
            </label>
            {option.description ? <p>{option.description}</p> : null}
          </div>
        ))}
      </div>
    )}
  </FieldArray>
);

export default RadioButtonGroup;
