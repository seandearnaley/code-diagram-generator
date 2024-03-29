"use client";
import {
  DesignDirectives,
  DiagramConfiguration,
  FormContent,
  Loading,
  MermaidDiagram,
  SourceFolderAndOptions,
  VendorModelSelector,
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

import { useDebounce } from "use-debounce";

import {
  DiagramFormProps,
  DiagramFormValues,
  validationSchema,
} from "@/types/DiagramForm.types";

const DiagramForm: FC<DiagramFormProps> = ({
  diagram_config: { diagram_categories, diagram_category_options },
  llm_config: { llm_vendors, llm_vendor_options },
  source_folder_options,
}) => {
  const [loadingValuesFromStorage, setLoadingValuesFromStorage] =
    useState(true);

  const [savingToStorage, setSavingToStorage] = useState(false);
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

        const { data, isLoading } = useDesignDirectives(values);
        const [debouncedValues] = useDebounce(values, 500);
        useEffect(() => {
          if (dirty && !isFirstMount.current) {
            setSavingToStorage(true);
            setStoredValue(debouncedValues);
            setSavingToStorage(false);
          }
        }, [debouncedValues, dirty]);
        /* eslint-enabled react-hooks/rules-of-hooks */

        return (
          <Form aria-labelledby="formTitle">
            <div className="border-b border-gray-900/10 pl-4">
              <h2 className="text-base font-semibold leading-10 text-gray-900">
                Mermaid Diagram GPT Generator
              </h2>
            </div>
            <FormContent className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>
                <SourceFolderAndOptions options={source_folder_options} />
                <DiagramConfiguration
                  selectOptions={diagram_category_options}
                  optionsObject={diagram_categories}
                  selectValue={values.diagram_category}
                  radioValue={values.diagram_option}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />

                <VendorModelSelector
                  selectOptions={llm_vendor_options}
                  optionsObject={llm_vendors}
                  selectValue={values.llm_vendor_for_instructions}
                  radioValue={values.llm_model_for_instructions}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />
              </div>
              <div>
                {/* if not loading show the design Directives */}
                {/* {!isLoading && <DesignDirectives text={data?.payload} />} */}
                <DesignDirectives text={data?.payload} />
              </div>
            </FormContent>
            <div className="pt-5">
              <MermaidDiagram values={values} text={data?.payload} />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default DiagramForm;
