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

type DiagramFormProps = {
  diagramConfig: {
    diagramCategories: { [key: string]: DiagramDefinition[] };
    diagramCategoryOptions: Option[];
    defaultDiagramCategory: string;
  };
  styles: { [key: string]: string };
};

type DiagramFormValues = {
  diagramCategory: string;
  diagramOption: string;
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagramConfig: {
    diagramCategories,
    diagramCategoryOptions,
    defaultDiagramCategory,
  },
  styles,
}) => {
  const handleSubmit = (
    values: DiagramFormValues,
    { setSubmitting }: FormikHelpers<DiagramFormValues>,
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik<DiagramFormValues>
      initialValues={{
        diagramCategory: defaultDiagramCategory,
        diagramOption: "",
      }}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={styles.diagramForm}>
          <SelectField
            options={diagramCategoryOptions}
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
