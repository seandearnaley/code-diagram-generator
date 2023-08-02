"use client";

import { Field, Form, Formik, FormikHelpers } from "formik";
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
  includeFolderTree: boolean;
  includePythonCodeOutline: boolean;
  gitIgnoreFilePath: string;
  designInstructions: string;
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
  const handleFolderOptionChange = async (
    folder: string,
    setFieldValue: any,
  ) => {
    console.log(`Option ${folder} selected.`);
    setFieldValue("sourceFolderOption", folder);
    const response = await fetch(
      `http://localhost:8000/gitignore_file/?root_folder=${folder}`,
    );
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    setFieldValue("gitIgnoreFilePath", data || "No .gitignore file found");
  };

  return (
    <Formik<DiagramFormValues>
      initialValues={{
        sourceFolderOption: "",
        diagramCategory: defaultDiagramCategory,
        diagramOption: "",
        includeFolderTree: false,
        includePythonCodeOutline: false,
        gitIgnoreFilePath: "",
        designInstructions: "",
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
            onChange={(folder) =>
              handleFolderOptionChange(folder, setFieldValue)
            }
          />

          <div className={styles.checkboxField}>
            <Field
              type="checkbox"
              id="includeFolderTree"
              name="includeFolderTree"
            />
            <label htmlFor="includeFolderTree">Include Folder Tree</label>
          </div>

          <div className={styles.checkboxField}>
            <Field
              type="checkbox"
              id="includePythonCodeOutline"
              name="includePythonCodeOutline"
            />
            <label htmlFor="includePythonCodeOutline">
              Include Python Code Outline
            </label>
          </div>

          <div className={styles.inputField}>
            <label htmlFor="gitIgnoreFilePath">GitIgnore File Path</label>
            <Field
              component="input"
              id="gitIgnoreFilePath"
              name="gitIgnoreFilePath"
            />
          </div>

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

          <div className={styles.textareaField}>
            <label htmlFor="designInstructions">Design Instructions</label>
            <Field
              component="textarea"
              id="designInstructions"
              name="designInstructions"
            />
          </div>

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default DiagramForm;
