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
  sourceFolderOptions: Option[];
  styles: { [key: string]: string };
};

type DiagramFormValues = {
  sourceFolderOption: string;
  diagramCategory: string;
  diagramOption: string;
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagramConfig: {
    diagramCategories,
    diagramCategoryOptions,
    defaultDiagramCategory,
  },
  sourceFolderOptions,
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
        sourceFolderOption: "",
        diagramCategory: defaultDiagramCategory,
        diagramOption: "",
      }}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={styles.diagramForm}>
          <RadioButtonGroup
            options={sourceFolderOptions}
            name="sourceFolderOption"
            styles={styles}
            label={"Select Source Folder to Analyze"}
            onChange={(optionId) => {
              console.log(`Option ${optionId} selected.`);
              setFieldValue("sourceFolderOption", optionId);
            }}
          />

          <SelectField
            options={diagramCategoryOptions}
            styles={styles}
            label="Select Diagram Category"
            name="diagramCategory"
            id="diagramCategory"
          />

          <RadioButtonGroup
            options={diagramCategories[values.diagramCategory] || []}
            name="diagramOption"
            styles={styles}
            label="Select Diagram"
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
