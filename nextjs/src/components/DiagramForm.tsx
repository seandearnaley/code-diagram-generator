"use client";

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
import {
  DEFAULT_DIAGRAM_CATEGORY,
  DEFAULT_DIAGRAM_OPTION,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_VENDOR,
  DEFAULT_SOURCE_FOLDER,
} from "@/config/formDefaults";
import useGitIgnore from "@/hooks/useGitIgnore";
import { Form, Formik, FormikHelpers } from "formik";
import { FC, useCallback, useMemo } from "react";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";

const setFieldValues = (
  setFieldValue: (field: string, value: any) => void,
  fieldValues: { [key: string]: any },
) => {
  Object.entries(fieldValues).forEach(([field, value]) => {
    setFieldValue(field, value);
  });
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagramConfig: {
    diagramCategories,
    diagramCategoryOptions,
    defaultDiagramCategory,
  },
  llmConfig: { llmVendors, llmVendorOptions, defaultLlmVendor },
  sourceFolderOptions,
  defaultSourceFolder,
  initialGitIgnoreFilePath,
}) => {
  const { fetch: fetchGitIgnore, loading, error } = useGitIgnore();
  const handleSubmit = async (
    values: DiagramFormValues,
    { setSubmitting, setFieldValue }: FormikHelpers<DiagramFormValues>,
  ) => {
    const postUrl = "http://localhost:8000/generate_diagram/";

    const response = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      console.error("There was an error posting the data");
      return;
    }

    const payload = await response.json();

    if (payload) {
      setFieldValue("designInstructions", payload.payload);
    }

    setSubmitting(false);
  };

  const createOptionChangeHandler =
    (fieldForOption: string, fieldForDefault: string) =>
    (
      selectedOption: string,
      options: any,
      setFieldValue: (field: string, value: any) => void,
    ) => {
      const defaultOption = options[selectedOption]?.[0]?.id || "";
      setFieldValues(setFieldValue, {
        [fieldForOption]: selectedOption,
        [fieldForDefault]: defaultOption,
      });
    };

  const handleDiagramCategoryChange = createOptionChangeHandler(
    "diagramCategory",
    "diagramOption",
  );

  const handleLlmVendorChange = createOptionChangeHandler(
    "llmVendorForInstructions",
    "llmModelForInstructions",
  );
  const handleSourceFolderChange = useCallback(
    async (
      folder: string,
      setFieldValue: (field: string, value: any) => void,
    ): Promise<void> => {
      const gitIgnorePath = await fetchGitIgnore(folder); // using renamed fetch
      setFieldValues(setFieldValue, {
        sourceFolderOption: folder,
        gitIgnoreFilePath: gitIgnorePath || "",
      });
    },
    [fetchGitIgnore],
  );

  return (
    <Formik<DiagramFormValues>
      initialValues={{
        sourceFolderOption: defaultSourceFolder || DEFAULT_SOURCE_FOLDER,
        diagramCategory: defaultDiagramCategory || DEFAULT_DIAGRAM_CATEGORY,
        diagramOption: DEFAULT_DIAGRAM_OPTION,
        includeFolderTree: true,
        includePythonCodeOutline: true,
        gitIgnoreFilePath: initialGitIgnoreFilePath || "",
        llmVendorForInstructions: DEFAULT_LLM_VENDOR,
        llmModelForInstructions: DEFAULT_LLM_MODEL,
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors }) => {
        const diagramOptions = useMemo(() => {
          return diagramCategories[values.diagramCategory] || [];
        }, [values.diagramCategory, diagramCategories]);

        const modelOptions = useMemo(() => {
          return llmVendors[values.llmVendorForInstructions] || [];
        }, [values.llmVendorForInstructions, llmVendors]);

        return (
          <Form aria-labelledby="formTitle">
            <div className={loading || error ? "relative" : ""}>
              {loading && <Loading message="Loading gitignore file..." />}
              {error && <Error message={error} />}
              <div className="border-b border-gray-900/10 pl-4">
                <h2 className="text-base font-semibold leading-10 text-gray-900">
                  Mermaid Diagram GPT Generator
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 p-3">
                <div className="col-span-1">
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
                        helpText:
                          "Whether to include the project's folder tree.",
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
                    aria-label="Select a diagram category from the list"
                    onChange={(selectedOption) =>
                      handleDiagramCategoryChange(
                        selectedOption,
                        diagramCategories,
                        setFieldValue,
                      )
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

                  <SelectField
                    options={llmVendorOptions}
                    label="Select LLM Vendor for Instructions"
                    name="llmVendorForInstructions"
                    id="llmVendorForInstructions"
                    onChange={(vendor) =>
                      handleLlmVendorChange(vendor, llmVendors, setFieldValue)
                    }
                  />
                  <RadioButtonGroup
                    options={modelOptions}
                    name="llmModelForInstructions"
                    onChange={(optionId) => {
                      setFieldValue("llmModelForInstructions", optionId);
                    }}
                  />

                  {errors.llmModelForInstructions ? (
                    <div className="text-red-500">
                      {errors.llmModelForInstructions}
                    </div>
                  ) : null}
                </div>
                <div className="col-span-1">
                  <TextArea
                    name="designInstructions"
                    label="Design Instructions"
                    rows={30}
                    aria-label="Enter design instructions"
                  />

                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <CancelButton />
                    <SubmitButton />
                  </div>
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
