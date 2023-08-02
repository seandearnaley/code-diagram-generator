"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { FC } from "react";
import { Option } from "../types/types";
import RadioButtonGroup from "./RadioButtonGroup";
import SelectField from "./SelectField";

type DiagramDefinition = {
  id: string;
  name: string;
  description: string;
};

type DiagramCategories = {
  [key: string]: DiagramDefinition[];
};

type Props = {
  diagramConfig: {
    diagramCategories: DiagramCategories;
    diagramOptions: Option[];
    defaultDiagramCategory: string;
  };
  styles: { [key: string]: string };
};

type Values = {
  diagramCategory: string;
  diagramOption: string;
};

const DiagramForm: FC<Props> = ({
  diagramConfig: { diagramCategories, diagramOptions, defaultDiagramCategory },
  styles,
}) => {
  const handleSubmit = (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik<Values>
      initialValues={{
        diagramCategory: defaultDiagramCategory,
        diagramOption: "",
      }}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={styles.diagramForm}>
          <SelectField
            options={diagramOptions}
            label="Diagram Category"
            name="diagramCategory"
            id="diagramCategory"
          />

          <RadioButtonGroup
            options={diagramCategories[values.diagramCategory] || []}
            name="diagramOption"
            className={styles.radioButtonGroup}
            onChange={(optionId) => {
              console.log(`Option ${optionId} selected.`);
              setFieldValue("diagramOption", optionId);
            }}
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default DiagramForm;
