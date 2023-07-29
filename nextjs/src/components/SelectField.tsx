import { Field } from "formik";
import { FC } from "react";

type Props = {
  options: string[];
  label: string;
  name: string;
  id: string;
};

const SelectField: FC<Props> = ({ options, label, name, id }) => (
  <label>
    {label}
    <Field as="select" name={name} id={id}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Field>
  </label>
);

export default SelectField;
