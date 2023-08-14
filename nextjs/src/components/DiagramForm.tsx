"use client";
import {
  CheckboxGroup,
  CodeComponent,
  FormContent,
  Loading,
  MermaidDiagram,
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
import { useDesignDirectives } from "@/hooks/useDesignDirectives";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { Field, Form, Formik } from "formik";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import rehypeRaw from "rehype-raw";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";
import ReactMarkdown from "react-markdown";

interface TokenCountData {
  token_count: number;
  est_words: number;
}

const components = {
  code: CodeComponent,
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-bold mt-5 text-lg" {...props} />
  ),
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-bold mt-5" {...props} />
  ),
};

async function fetchTokenCount([url, text, llm_vendor]: [
  string,
  string,
  string,
]): Promise<TokenCountData> {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ text, llm_vendor }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
const DiagramForm: FC<DiagramFormProps> = ({
  diagram_config: { diagram_categories, diagram_category_options },
  llm_config: { llm_vendors, llm_vendor_options },
  source_folder_options,
}) => {
  const [tokenCountInfo, setTokenCountInfo] = useState<TokenCountData | null>(
    null,
  );
  const [textForTokenCount, setTextForTokenCount] = useState("");
  const [debouncedTextForTokenCount] = useDebounce(textForTokenCount, 50);

  const [loadingValuesFromStorage, setLoadingValuesFromStorage] =
    useState(true);

  const [savingToStorage, setSavingToStorage] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
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
    if (storedValue && !savingToStorage) {
      setLoadingValuesFromStorage(false);
    }
  }, [storedValue, savingToStorage]);

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      if (storedValue) {
        setLoadingValuesFromStorage(false);
      }
      isFirstMount.current = false;
    }
  }, [storedValue]);

  const { data: design_directive_data, isLoading } =
    useDesignDirectives(storedValue);

  useEffect(() => {
    if (design_directive_data && design_directive_data.payload) {
      setTextForTokenCount(design_directive_data.payload);
    }
  }, [design_directive_data]);

  if (loadingValuesFromStorage) {
    return <Loading message="Loading local storage state..." />;
  }

  return (
    <Formik<DiagramFormValues>
      initialValues={storedValue}
      validationSchema={validationSchema}
      validateOnChange={true}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue, errors, dirty }) => {
        /* eslint-disable react-hooks/rules-of-hooks */
        const [debouncedValues] = useDebounce(values, 500);

        const tokenUrl = "http://localhost:8000/token_count";

        const { data: tokenData, error } = useSWR(
          [
            tokenUrl,
            debouncedTextForTokenCount,
            values.llm_vendor_for_instructions,
          ],
          fetchTokenCount,
        );
        useEffect(() => {
          if (dirty && !isFirstMount.current) {
            setSavingToStorage(true);
            setStoredValue(debouncedValues);
            setSavingToStorage(false);
          }
        }, [debouncedValues, dirty]);

        useEffect(() => {
          if (tokenData) {
            setTokenCountInfo(tokenData);
          }
        }, [tokenData]);

        /* eslint-enabled react-hooks/rules-of-hooks */

        // You can log or handle the error as required
        if (error) {
          console.error(error);
        }

        return (
          <Form aria-labelledby="formTitle">
            <div className="border-b border-gray-900/10 pl-4">
              <h2 className="text-base font-semibold leading-10 text-gray-900">
                Mermaid Diagram GPT Generator
              </h2>
            </div>
            <FormContent className="grid grid-flow-row-dense gap-4">
              {/* Panel 1: SourceFolderSection + CheckboxGroup */}
              {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
              <details open className="mb-4">
                <summary className="cursor-pointer text-lg font-medium text-gray-700">
                  Source Folder and Options
                </summary>
                <div className="mb-2">
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
                </div>
              </details>
              {/* Panel 2: Diagram Category */}
              <details open className="mb-4">
                <summary className="cursor-pointer text-lg font-medium text-gray-700">
                  Diagram Configuration
                </summary>
                <div className="mt-2">
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
                </div>
              </details>
              {/* Panel 3: LLM Vendors */}
              <details className="mb-4">
                <summary className="cursor-pointer text-lg font-medium text-gray-700">
                  Vendor Config
                </summary>
                <div className="mt-2">
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
              </details>
              {/* Panel 4: Design Instructions */}
              <details className="mb-4">
                <summary className="cursor-pointer text-lg font-medium text-gray-700">
                  Design Directives
                </summary>
                {design_directive_data &&
                design_directive_data.payload &&
                !isLoading ? (
                  <>
                    <p className="mt-1 text-sm leading-6 text-gray-600  border-gray-900/10 p-4">
                      This will be used to generate design instructions, which
                      will then be used to generate the diagram. Spreading out
                      the design instructions over multiple lines will help the
                      model generate more coherent instructions.
                    </p>

                    {isEditable ? (
                      <div>
                        <Field
                          as="textarea"
                          name="design_instructions"
                          className="ml-0 p-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md resize-none w-full max-h-[700px] h-[700px]"
                          value={design_directive_data.payload}
                          onChange={(e: any) => {
                            setFieldValue(
                              "design_instructions",
                              e.target.value,
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <ReactMarkdown
                        components={components}
                        rehypePlugins={[rehypeRaw]}
                        className=" ml-0 p-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md max-h-[700px]"
                      >
                        {design_directive_data.payload}
                      </ReactMarkdown>
                    )}

                    <div className="p-2">
                      <CopyToClipboard text={design_directive_data.payload}>
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
                      <button
                        className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200 mt-2"
                        type="button"
                        onClick={() => setIsEditable(!isEditable)}
                      >
                        Toggle Edit Mode
                      </button>
                      {tokenCountInfo && (
                        <p className="text-sm p-4">
                          Tokens: {tokenCountInfo.token_count}, Estimated Words:{" "}
                          {tokenCountInfo.est_words}
                        </p>
                      )}
                    </div>
                  </>
                ) : null}

                <div className="p-2 flex flex-col items-center">
                  <MermaidDiagram />
                </div>
              </details>
            </FormContent>
          </Form>
        );
      }}
    </Formik>
  );
};

export default DiagramForm;
