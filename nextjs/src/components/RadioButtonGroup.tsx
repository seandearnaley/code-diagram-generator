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
  styles: { [key: string]: string };
  label?: string;
  onChange?: (optionId: string) => void;
};

const RadioButtonGroup: FC<Props> = ({
  options,
  name,
  styles,
  label,
  onChange,
}) => (
  <FieldArray name={name}>
    {() => (
      <div className={styles.radioButtonGroup}>
        {label ? <div className={styles.radioLabel}>{label}</div> : null}
        <div className={styles.radioList}>
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
      </div>
    )}
  </FieldArray>
);

export default RadioButtonGroup;
