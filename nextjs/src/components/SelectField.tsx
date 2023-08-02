import { Field } from "formik";
import { FC } from "react";
import { Option } from "../types/types";

type Props = {
  options: Option[];
  label: string;
  name: string;
  id: string;
  styles: { [key: string]: string };
};

const SelectField: FC<Props> = ({ options, label, name, id, styles }) => (
  <label>
    <div className={styles.selectField}>
      {label}
      <Field as="select" name={name} id={id} className={styles.selectDropdown}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Field>
    </div>
  </label>
);

export default SelectField;
