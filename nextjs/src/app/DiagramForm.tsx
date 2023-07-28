import { Field, FieldArray, Form, Formik, FormikHelpers } from "formik";
import { GetServerSideProps } from "next";
import { FC } from "react";

type Option = {
  id: string;
  name: string;
};

type Options = {
  [key: string]: Option[];
};

type Values = {
  diagramType: string;
  diagramOption: string;
};

type Props = {
  options: Options;
};

const DiagramForm: FC<Props> = ({ options }) => {
  const handleSubmit = (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik<Values>
      initialValues={{ diagramType: "", diagramOption: "" }}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <label>
            Diagram Type
            <Field as="select" name="diagramType" id="diagramType">
              {Object.keys(options).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Field>
          </label>

          <FieldArray name="diagramOption">
            {() => (
              <div>
                {options[values.diagramType]?.map((option) => (
                  <label key={option.id}>
                    <Field
                      type="radio"
                      name="diagramOption"
                      value={option.name}
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            )}
          </FieldArray>

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch("http://localhost:8000/diagram_types"); // replace with your API endpoint
  const options: Options = await res.json();

  return {
    props: {
      options,
    },
  };
};

export default DiagramForm;
