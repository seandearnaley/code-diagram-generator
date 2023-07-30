import { Field, FieldArray } from "formik";
import { FC } from "react";

type Option = {
  id: string;
  name: string;
  description: string;
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
          <div key={option.id} style={{ marginBottom: "10px" }}>
            <label>
              <Field type="radio" name={name} value={option.id} />
              <span style={{ fontWeight: "bold" }}>{option.name}</span>
            </label>
            <p style={{ marginTop: "5px", marginLeft: "20px" }}>
              {option.description}
            </p>
          </div>
        ))}
      </div>
    )}
  </FieldArray>
);

export default RadioButtonGroup;
