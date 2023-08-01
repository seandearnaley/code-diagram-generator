"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { FC } from "react";
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

type DiagramCategoryNames = {
  [key: string]: string;
};

type Props = {
  diagramConfig: {
    diagramCategories: DiagramCategories;
    diagramCategoryNames: DiagramCategoryNames;
  };
};

type Values = {
  diagramCategory: string;
  diagramOption: string;
};

const DiagramForm: FC<Props> = ({
  diagramConfig: { diagramCategories, diagramCategoryNames },
}) => {
  const diagramOptions = Object.keys(diagramCategories).map((key) => ({
    id: key,
    name: diagramCategoryNames[key] || key,
  }));

  const defaultDiagramCategory = diagramOptions[0]?.id || "";

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
      {({ values }) => (
        <Form>
          <SelectField
            options={diagramOptions}
            label="Diagram Category"
            name="diagramCategory"
            id="diagramCategory"
          />

          <RadioButtonGroup
            options={diagramCategories[values.diagramCategory] || []}
            name="diagramOption"
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default DiagramForm;
