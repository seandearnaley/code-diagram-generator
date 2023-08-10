"use client";

import useGitIgnore from "@/hooks/useGitIgnore";
import { Form, Formik, FormikHelpers } from "formik";
import { FC, useCallback, useMemo } from "react";

import { DiagramFormProps, DiagramFormValues } from "../types/types";

import {
  CancelButton,
  CheckboxGroup,
  Error,
  Loading,
  RadioButtonGroup,
  SelectField,
  SourceFolderField,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components";

import { validationSchema } from "@/types/DiagramForm.types";

const DiagramForm: FC<DiagramFormProps> = ({
  diagramConfig: {
    diagramCategories,
    diagramCategoryOptions,
    defaultDiagramCategory,
  },
  sourceFolderOptions,
  defaultSourceFolder,
  initialGitIgnoreFilePath,
}) => {
  const { fetch, loading, error } = useGitIgnore();

  const handleSourceFolderChange = useCallback(
    async (
      folder: string,
      setFieldValue: (field: string, value: any) => void,
    ) => {
      const gitIgnorePath = await fetch(folder);
      setFieldValue("sourceFolderOption", folder);
      setFieldValue("gitIgnoreFilePath", gitIgnorePath || "");
    },
    [fetch],
  );

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
        sourceFolderOption: defaultSourceFolder || "",
        diagramCategory: defaultDiagramCategory,
        diagramOption: "",
        includeFolderTree: true,
        includePythonCodeOutline: true,
        gitIgnoreFilePath: initialGitIgnoreFilePath || "",
        designInstructions: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors }) => {
        const diagramOptions = useMemo(() => {
          return diagramCategories[values.diagramCategory] || [];
        }, [values.diagramCategory, diagramCategories]);

        return (
          <Form aria-labelledby="formTitle">
            <div className={loading || error ? "relative" : ""}>
              {loading && <Loading message="Loading gitignore file..." />}
              {error && <Error message={error} />}

              <div className="p-3">
                <div className="border-b border-gray-900/10">
                  <h2 className="text-base font-semibold leading-10 text-gray-900">
                    Mermaid Diagram GPT Generator
                  </h2>
                </div>
                <SourceFolderField
                  handleSourceFolderChange={(folder) =>
                    handleSourceFolderChange(folder, setFieldValue)
                  }
                  options={sourceFolderOptions}
                  error={errors.sourceFolderOption}
                />

                <TextInput
                  name="gitIgnoreFilePath"
                  label="GitIgnore File Path"
                  helpText={
                    "Enter the path to a file that specify files to ignore for analysis intentionally."
                  }
                />

                <CheckboxGroup
                  options={[
                    {
                      id: "includeFolderTree",
                      label: "Include Folder Tree",
                      helpText: "Whether to include the project's folder tree.",
                    },
                    {
                      id: "includePythonCodeOutline",
                      label: "Include Python Code Outline",
                      helpText:
                        "Whether to include a simple outline of the project's python code",
                    },
                  ]}
                />

                <SelectField
                  options={diagramCategoryOptions}
                  label="Select Diagram Category"
                  name="diagramCategory"
                  id="diagramCategory"
                  onChange={(category) =>
                    setFieldValue("diagramCategory", category)
                  }
                />

                <RadioButtonGroup
                  options={diagramOptions}
                  name="diagramOption"
                  onChange={(optionId) => {
                    setFieldValue("diagramOption", optionId);
                  }}
                />

                {errors.diagramOption ? (
                  <div className="text-red-500">{errors.diagramOption}</div>
                ) : null}

                <TextArea
                  name="designInstructions"
                  label="Design Instructions"
                  rows={3}
                  aria-label="Enter design instructions"
                />
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <CancelButton />
                  <SubmitButton />
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default DiagramForm;
