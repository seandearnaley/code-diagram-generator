"use client";
import { ClipboardIcon } from "@heroicons/react/24/solid";

import {
  CancelButton,
  CheckboxGroup,
  CodeComponent,
  Error,
  Loading,
  RadioButtonGroup,
  SelectField,
  SourceFolderField,
  SubmitButton,
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
import { FC, useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";
import ReactMarkdown from "react-markdown";
import {
  createOptionChangeHandler,
  handleSourceFolderChange,
} from "../lib/diagramFormHandlers";

const components = {
  code: CodeComponent,
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagram_config: {
    diagram_categories,
    diagram_category_options,
    default_diagram_category,
  },
  llm_config: { llm_vendors, llm_vendor_options, default_llm_vendor },
  source_folder_options,
  default_source_folder,
  initial_git_ignore_file_path,
}) => {
  const { fetch: fetchGitIgnore, loading, error } = useGitIgnore();
  const [fullText, setFullText] = useState("");

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
      setFieldValue("design_instructions", payload.payload);
    }

    setSubmitting(false);
  };

  const handleDiagramCategoryChange = createOptionChangeHandler(
    "diagram_category",
    "diagram_option",
  );

  const handleLlmVendorChange = createOptionChangeHandler(
    "llm_vendor_for_instructions",
    "llm_model_for_instructions",
  );

  return (
    <Formik<DiagramFormValues>
      initialValues={{
        source_folder_option: default_source_folder || DEFAULT_SOURCE_FOLDER,
        diagram_category: default_diagram_category || DEFAULT_DIAGRAM_CATEGORY,
        diagram_option: DEFAULT_DIAGRAM_OPTION,
        include_folder_tree: true,
        include_python_code_outline: true,
        git_ignore_file_path: initial_git_ignore_file_path || "",
        llm_vendor_for_instructions: DEFAULT_LLM_VENDOR,
        llm_model_for_instructions: DEFAULT_LLM_MODEL,
        design_instructions: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors }) => {
        // Whenever the payload changes, update the fullText state variable
        useEffect(() => {
          setFullText(values.design_instructions);
        }, [values.design_instructions]);

        const processedInstructions = values.design_instructions;

        const diagramOptions = useMemo(() => {
          return diagram_categories[values.diagram_category] || [];
        }, [values.diagram_category, diagram_categories]);

        const modelOptions = useMemo(() => {
          return llm_vendors[values.llm_vendor_for_instructions] || [];
        }, [values.llm_vendor_for_instructions, llm_vendors]);

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
                    handleSourceFolderChange={handleSourceFolderChange(
                      fetchGitIgnore,
                    )}
                    options={source_folder_options}
                    error={errors.source_folder_option}
                  />

                  <TextInput
                    name="git_ignore_file_path"
                    label="GitIgnore File Path"
                    helpText={
                      "Enter the path to a file that specify files to ignore for analysis intentionally."
                    }
                  />

                  <CheckboxGroup
                    options={[
                      {
                        id: "include_folder_tree",
                        label: "Include Folder Tree",
                        helpText:
                          "Whether to include the project's folder tree.",
                      },
                      {
                        id: "include_python_code_outline",
                        label: "Include Python Code Outline",
                        helpText:
                          "Whether to include a simple outline of the project's python code",
                      },
                    ]}
                  />

                  <SelectField
                    options={diagram_category_options}
                    label="Select Diagram Category"
                    name="diagram_category"
                    id="diagram_category"
                    aria-label="Select a diagram category from the list"
                    onChange={(selected_option) =>
                      handleDiagramCategoryChange(
                        selected_option,
                        diagram_categories,
                        setFieldValue,
                      )
                    }
                  />

                  <RadioButtonGroup
                    options={diagramOptions}
                    name="diagram_option"
                    onChange={(optionId) => {
                      setFieldValue("diagram_option", optionId);
                    }}
                  />

                  {errors.diagram_option ? (
                    <div className="text-red-500">{errors.diagram_option}</div>
                  ) : null}

                  <SelectField
                    options={llm_vendor_options}
                    label="Select LLM Vendor for Instructions"
                    name="llm_vendor_for_instructions"
                    id="llm_vendor_for_instructions"
                    onChange={(vendor) =>
                      handleLlmVendorChange(vendor, llm_vendors, setFieldValue)
                    }
                  />
                  <RadioButtonGroup
                    options={modelOptions}
                    name="llm_model_for_instructions"
                    onChange={(optionId) => {
                      setFieldValue("llm_model_for_instructions", optionId);
                    }}
                  />

                  {errors.llm_model_for_instructions ? (
                    <div className="text-red-500">
                      {errors.llm_model_for_instructions}
                    </div>
                  ) : null}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="design_instructions"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Design Instructions
                  </label>
                  <ReactMarkdown
                    components={components}
                    className="p-2 prose max-w-[700px] mt-1 text-sm text-gray-500 max-h-[500px] overflow-y-auto border border-gray-300"
                  >
                    {processedInstructions}
                  </ReactMarkdown>
                  <div className="p-2">
                    <CopyToClipboard text={fullText}>
                      <button
                        className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer"
                        type="button"
                        onClick={() =>
                          alert("All content copied to clipboard!")
                        }
                      >
                        <ClipboardIcon className="h-5 w-5 mr-2" />
                        Copy All Content
                      </button>
                    </CopyToClipboard>
                  </div>
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
