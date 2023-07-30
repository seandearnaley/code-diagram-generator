import { Field, FieldArray } from "formik";
import { FC } from "react";

type Option = {
  id: string;
  name: string;
};

type Props = {
  options: Option[];
  name: string;
};

const RadioButtonGroup: FC<Props> = ({ options, name }) => (
  <FieldArray name={name}>
    {() => (
      <div>
        {options.map((option) => (
          <label key={option.id}>
            <Field type="radio" name={name} value={option.id} />
            {option.name}
          </label>
        ))}
      </div>
    )}
  </FieldArray>
);

export default RadioButtonGroup;
