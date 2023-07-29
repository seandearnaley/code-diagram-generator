"use client";

import { Form, Formik, FormikHelpers } from "formik";
// import { GetServerSideProps } from "next";
import { FC } from "react";
import RadioButtonGroup from "./RadioButtonGroup";
import SelectField from "./SelectField";

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
          <SelectField
            options={Object.keys(options)}
            label="Diagram Type"
            name="diagramType"
            id="diagramType"
          />

          <RadioButtonGroup
            options={options[values.diagramType] || []}
            name="diagramOption"
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

// export const getServerSideProps: GetServerSideProps = async () => {
//   const res = await fetch("http://localhost:8000/diagram_types"); // replace with your API endpoint
//   const options: Options = await res.json();

//   return {
//     props: {
//       options,
//     },
//   };
// };

export default DiagramForm;
