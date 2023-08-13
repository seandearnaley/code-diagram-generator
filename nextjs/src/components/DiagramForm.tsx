"use client";
import { useDiagramInstructions } from "@/hooks/useDiagramInstructions";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { useDebounce } from "use-debounce";

import {
  CheckboxGroup,
  CodeComponent,
  FormContent,
  GenericButton,
  Loading,
  SelectorWithRadioOptions,
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
import { Form, Formik } from "formik";
import { FC, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
    design_instructions: "",
  });

  useEffect(() => {
    if (storedValue) {
      setLoadingValuesFromStorage(false);
    }
  }, [storedValue]);

  const { data, error, mutate, isLoading } =
    useDiagramInstructions(storedValue);

  if (loadingValuesFromStorage) {
    return <Loading message="Loading local storage state..." />;
  }

  return (
    <Formik<DiagramFormValues>
      initialValues={storedValue}
      validationSchema={validationSchema}
      onSubmit={() => {}} // do nothing
    >
      {({ values, setFieldValue, errors, handleReset, dirty }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [debouncedValues] = useDebounce(values, 500); // 500ms

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (dirty) {
            console.log("Saving to local storage:", debouncedValues);
            setStoredValue(debouncedValues);
          }
        }, [debouncedValues, dirty]);

        const fullText = values.design_instructions; // for copy to clipboard

        const handlePrepareDesignInstructions = async () => {
          try {
            const data = await mutate();
            if (data && data.payload) {
              setFieldValue("design_instructions", data.payload);
            } else {
              console.error("Unexpected response structure", data);
            }
          } catch (error) {
            console.error("Error fetching instructions:", error);
          }
        };

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

                  {error ? (
                    <div>Error fetching instructions: {error.message}</div>
                  ) : data ? (
                    <div>hello</div>
                  ) : isLoading ? (
                    <Loading message="Loading design instructions..." />
                  ) : null}
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
