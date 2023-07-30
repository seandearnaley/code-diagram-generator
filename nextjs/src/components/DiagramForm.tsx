"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { FC } from "react";
import RadioButtonGroup from "./RadioButtonGroup";
import SelectField from "./SelectField";

type DiagramType = {
  id: string;
  name: string;
};

type DiagramTypes = {
  [key: string]: DiagramType[];
};

type DiagramTypeNames = {
  [key: string]: string;
};

type Props = {
  options: {
    types: DiagramTypes;
    diagramTypeNames: DiagramTypeNames;
  };
};

type Values = {
  diagramType: string;
  diagramOption: string;
};

const DiagramForm: FC<Props> = ({ options: { types, diagramTypeNames } }) => {
  const diagramOptions = Object.keys(types).map((key) => ({
    id: key,
    name: diagramTypeNames[key] || key,
  }));

  const defaultDiagramType = diagramOptions[0]?.id || "";

  const handleSubmit = (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik<Values>
      initialValues={{ diagramType: defaultDiagramType, diagramOption: "" }}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <SelectField
            options={diagramOptions}
            label="Diagram Type"
            name="diagramType"
            id="diagramType"
          />

          <RadioButtonGroup
            options={types[values.diagramType] || []}
            name="diagramOption"
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default DiagramForm;
