"use client";
import {
  CheckboxGroup,
  CodeComponent,
  FormContent,
  Loading,
  SelectorWithRadioOptions,
  SourceFolderSection,
} from "@/components";
import { Toast, ToastProps } from "@/components/Toast";
import {
  DEFAULT_DIAGRAM_CATEGORY,
  DEFAULT_DIAGRAM_OPTION,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_VENDOR,
  DEFAULT_SOURCE_FOLDER,
} from "@/config/formDefaults";
import { useDiagramInstructions } from "@/hooks/useDiagramInstructions";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { Form, Formik } from "formik";
import { FC, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useDebounce } from "use-debounce";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";
import ReactMarkdown from "react-markdown";

const components = {
  code: CodeComponent,
};

const DiagramForm: FC<DiagramFormProps> = ({
  diagram_config: { diagram_categories, diagram_category_options },
  llm_config: { llm_vendors, llm_vendor_options },
  source_folder_options,
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null); // Add a state for managing toast
  const [loadingValuesFromStorage, setLoadingValuesFromStorage] =
    useState(true);
  const [storedValue, setStoredValue] = useLocalStorage("formValues", {
    source_folder_option: DEFAULT_SOURCE_FOLDER,
    git_ignore_file_path: "",
    diagram_category: DEFAULT_DIAGRAM_CATEGORY,
    diagram_option: DEFAULT_DIAGRAM_OPTION,
    include_folder_tree: true,
    include_python_code_outline: true,
    llm_vendor_for_instructions: DEFAULT_LLM_VENDOR,
    llm_model_for_instructions: DEFAULT_LLM_MODEL,
  });

  useEffect(() => {
    if (storedValue) {
      setLoadingValuesFromStorage(false);
    }
  }, [storedValue]);

  const {
    data: diagram_instruction_data,
    error: diagram_instruction_data_error,
    isLoading,
  } = useDiagramInstructions(storedValue);

  useEffect(() => {
    if (diagram_instruction_data_error) {
      setToast({
        message: `Error fetching instructions: ${diagram_instruction_data_error.message}`,
        type: "error",
      });
    }
  }, [diagram_instruction_data_error]);

  if (loadingValuesFromStorage) {
    return <Loading message="Loading local storage state..." />;
  }

  return (
    <>
      {toast && <Toast {...toast} />}
      <Formik<DiagramFormValues>
        initialValues={storedValue}
        validationSchema={validationSchema}
        onSubmit={() => {}} // do nothing
      >
        {({ values, setFieldValue, errors, dirty }) => {
          /* eslint-disable react-hooks/rules-of-hooks */
          const [debouncedValues] = useDebounce(values, 500); // 500ms

          useEffect(() => {
            if (dirty) {
              console.log("Saving to local storage:", debouncedValues);
              setStoredValue(debouncedValues);
            }
          }, [debouncedValues, dirty]);

          /* eslint-enable react-hooks/rules-of-hooks */

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

                  <SelectorWithRadioOptions
                    selectOptions={diagram_category_options}
                    optionsObject={diagram_categories}
                    selectLabel="Select Diagram Category"
                    selectName="diagram_category"
                    selectId="diagram_category"
                    radioName="diagram_option"
                    selectValue={values.diagram_category}
                    radioValue={values.diagram_option}
                    setFieldValue={setFieldValue}
                    errors={errors}
                  />

                  <SelectorWithRadioOptions
                    selectOptions={llm_vendor_options}
                    optionsObject={llm_vendors}
                    selectLabel="Select LLM Vendor for Instructions"
                    selectName="llm_vendor_for_instructions"
                    selectId="llm_vendor_for_instructions"
                    radioName="llm_model_for_instructions"
                    selectValue={values.llm_vendor_for_instructions}
                    radioValue={values.llm_model_for_instructions}
                    setFieldValue={setFieldValue}
                    errors={errors}
                  />
                </div>
                <div className="col-span-1 pt-2">
                  {isLoading ? (
                    <Loading message="Loading design instructions..." />
                  ) : diagram_instruction_data &&
                    diagram_instruction_data.payload ? (
                    <>
                      <label
                        htmlFor="design_instructions"
                        className="block text-sm text-gray-700 font-medium leading-6"
                      >
                        Design Instructions
                      </label>

                      <ReactMarkdown
                        components={components}
                        className=" ml-0 p-4 mr-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md"
                      >
                        {diagram_instruction_data.payload}
                      </ReactMarkdown>

                      <div className="p-2">
                        <CopyToClipboard
                          text={diagram_instruction_data.payload}
                        >
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
    </>
  );
};

export default DiagramForm;
