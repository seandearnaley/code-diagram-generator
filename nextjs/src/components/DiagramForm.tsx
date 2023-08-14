"use client";
import {
  DesignDirectives,
  DiagramConfiguration,
  FormContent,
  Loading,
  SourceFolderAndOptions,
  VendorConfig,
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
import { Form, Formik } from "formik";
import { FC, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";

interface TokenCountData {
  token_count: number;
  est_words: number;
}

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
            <FormContent className="grid-flow-row-dense gap-4">
              <SourceFolderAndOptions options={source_folder_options} />
              <DiagramConfiguration
                selectOptions={diagram_category_options}
                optionsObject={diagram_categories}
                selectValue={values.diagram_category}
                radioValue={values.diagram_option}
                setFieldValue={setFieldValue}
                errors={errors}
              />
              <VendorConfig
                selectOptions={llm_vendor_options}
                optionsObject={llm_vendors}
                selectValue={values.llm_vendor_for_instructions}
                radioValue={values.llm_model_for_instructions}
                setFieldValue={setFieldValue}
                errors={errors}
              />
              <DesignDirectives
                design_directive_data={design_directive_data}
                isLoading={isLoading}
                isEditable={isEditable}
                setIsEditable={setIsEditable}
                setFieldValue={setFieldValue}
                tokenCountInfo={tokenCountInfo}
              />
            </FormContent>
          </Form>
        );
      }}
    </Formik>
  );
};

export default DiagramForm;
