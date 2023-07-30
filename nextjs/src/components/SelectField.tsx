import { Field } from "formik";
import { FC } from "react";

type Option = {
  id: string;
  name: string;
};

type Props = {
  options: Option[];
  label: string;
  name: string;
  id: string;
};

const SelectField: FC<Props> = ({ options, label, name, id }) => (
  <label>
    {label}
    <Field as="select" name={name} id={id}>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </Field>
  </label>
);

export default SelectField;
