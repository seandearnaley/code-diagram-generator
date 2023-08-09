"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { FC } from "react";
import { Option } from "../types/types";
import { CheckboxGroup } from "./CheckboxGroup";
import { RadioButtonGroup } from "./RadioButtonGroup";
import { SelectField } from "./SelectField";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

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
        <Form>
          <div className="p-3">
            <div className="border-b border-gray-900/10">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Mermaid Diagram GPT Generator
              </h2>
            </div>

            <RadioButtonGroup
              options={sourceFolderOptions}
              name="sourceFolderOption"
              label={"Source Folder"}
              helpText={"Select the project folder to analyze"}
              onChange={(folder) =>
                handleFolderOptionChange(folder, setFieldValue)
              }
            />

            <TextInput name="gitIgnoreFilePath" label="GitIgnore File Path" />

            <CheckboxGroup
              options={[
                {
                  id: "includeFolderTree",
                  label: "Include Folder Tree",
                  helpText: "Placeholder help text for Include Folder Tree.",
                },
                {
                  id: "includePythonCodeOutline",
                  label: "Include Python Code Outline",
                  helpText:
                    "Placeholder help text for Include Python Code Outline.",
                },
              ]}
            />

            <SelectField
              options={diagramCategoryOptions}
              label="Select Diagram Category"
              name="diagramCategory"
              id="diagramCategory"
            />

            <RadioButtonGroup
              options={diagramCategories[values.diagramCategory] || []}
              name="diagramOption"
              onChange={(optionId) => {
                console.log(`Option ${optionId} selected.`);
                setFieldValue("diagramOption", optionId);
              }}
            />

            <TextArea
              name="designInstructions"
              label="Design Instructions"
              rows={3}
            />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Submit
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default DiagramForm;
