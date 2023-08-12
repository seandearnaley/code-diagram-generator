"use client";
import { useDiagramInstructions } from "@/hooks/useDiagramInstructions";
import { ClipboardIcon } from "@heroicons/react/24/solid";

import {
  CheckboxGroup,
  CodeComponent,
  FormContent,
  GenericButton,
  Loading,
  RadioButtonGroup,
  SelectField,
  SourceFolderSection,
} from "@/components";
import {
  DEFAULT_DIAGRAM_CATEGORY,
  DEFAULT_DIAGRAM_OPTION,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_VENDOR,
  DEFAULT_SOURCE_FOLDER,
} from "@/config/formDefaults";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Form, Formik, FormikHelpers } from "formik";
import { FC, useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";
import ReactMarkdown from "react-markdown";
import { createOptionChangeHandler } from "../lib/diagramFormHandlers";

const components = {
  code: CodeComponent,
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagram_config: {
    diagram_categories,
    diagram_category_options,
    default_diagram_category,
  },
  llm_config: { llm_vendors, llm_vendor_options },
  source_folder_options,
}) => {
  const [fullText, setFullText] = useState<string | undefined>(undefined);
  const [loadingValuesFromStorage, setLoadingValuesFromStorage] =
    useState(true);
  const [storedValue, setStoredValue] = useLocalStorage(
    "formValues",
    {
      source_folder_option: DEFAULT_SOURCE_FOLDER,
      git_ignore_file_path: "",
      diagram_category: default_diagram_category || DEFAULT_DIAGRAM_CATEGORY,
      diagram_option: DEFAULT_DIAGRAM_OPTION,
      include_folder_tree: true,
      include_python_code_outline: true,
      llm_vendor_for_instructions: DEFAULT_LLM_VENDOR,
      llm_model_for_instructions: DEFAULT_LLM_MODEL,
      design_instructions: "",
    },
    ["design_instructions"],
  );

  const { data, error, mutate } = useDiagramInstructions(storedValue);

  useEffect(() => {
    if (storedValue) {
      setLoadingValuesFromStorage(false);
    }
  }, [storedValue]);

  const handleSubmit = async (
    values: DiagramFormValues,
    { setSubmitting, setFieldValue }: FormikHelpers<DiagramFormValues>,
  ) => {
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

  if (loadingValuesFromStorage) {
    return <Loading message="Loading local storage state..." />;
  }

  return (
    <Formik<DiagramFormValues>
      initialValues={storedValue}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors, handleReset, dirty }) => {
        useEffect(() => {
          if (dirty) {
            console.log("Saving to local storage:", values);
            setStoredValue(values);
          }
        }, [values, dirty]);

        useEffect(() => {
          setFullText(values.design_instructions); // for copy to clipboard
        }, [values.design_instructions]);

        useEffect(() => {
          if (data) {
            setFieldValue("design_instructions", data.payload);
          }
        }, [data]);

        const handlePrepareDesignInstructions = () => {
          // Trigger revalidation to fetch new data
          mutate();
        };

        const diagram_options = useMemo(() => {
          return diagram_categories[values.diagram_category] || [];
        }, [values.diagram_category, diagram_categories]);

        const model_options = useMemo(() => {
          return llm_vendors[values.llm_vendor_for_instructions] || [];
        }, [values.llm_vendor_for_instructions, llm_vendors]);

        return (
          <Form aria-labelledby="formTitle">
            <FormContent title="Mermaid Diagram GPT Generator">
              <div className="col-span-1">
                <SourceFolderSection options={source_folder_options} />

                <CheckboxGroup
                  options={[
                    {
                      id: "include_folder_tree",
                      label: "Include Folder Tree",
                      helpText: "Whether to include the project's folder tree.",
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
                  options={diagram_options}
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
                  options={model_options}
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

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <GenericButton
                    label="Prepare Design Instructions"
                    type="button"
                    className="bg-blue-600 px-3 py-2 text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    onClick={handlePrepareDesignInstructions}
                  />

                  <GenericButton
                    label="Cancel"
                    type="button"
                    className="text-gray-900 pl-2 py-2"
                    onClick={handleReset}
                  />

                  {error ? <div>Error fetching instructions</div> : null}
                  {data ? (
                    <div>hello</div>
                  ) : (
                    <Loading message="Loading design instructions..." />
                  )}
                </div>
              </div>
              <div className="col-span-1 pt-2">
                {values.design_instructions ? (
                  <>
                    <label
                      htmlFor="design_instructions"
                      className="block text-sm text-gray-700 font-medium leading-6"
                    >
                      Design Instructions
                    </label>

                    <ReactMarkdown
                      components={components}
                      className=" m-0 p-4 max-w-[600px] overflow-y-auto bg-slate-300 text-slate-500 rounded-md font-bold"
                    >
                      {values.design_instructions}
                    </ReactMarkdown>

                    <div className="p-2">
                      <CopyToClipboard text={fullText || ""}>
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
                  </>
                ) : null}
              </div>
            </FormContent>
          </Form>
        );
      }}
    </Formik>
  );
};

export default DiagramForm;
