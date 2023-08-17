import { DiagramFormValues } from "@/types/DiagramForm.types";
import { useEffect } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import fetcher from "../lib/fetcher";

export const useDesignDirectives = (values: DiagramFormValues | null) => {
  const [debouncedValues] = useDebounce(values, 500); // ms

  useEffect(() => {
    console.log("values changed");
  }, [debouncedValues]);

  const shouldFetch =
    debouncedValues &&
    Object.values(debouncedValues).every((value) => value !== "");

  let queryParams = "";
  if (debouncedValues) {
    const {
      source_folder_option,
      diagram_category,
      diagram_option,
      include_folder_tree = false,
      include_python_code_outline = false,
      git_ignore_file_path,
      llm_vendor_for_instructions,
      llm_model_for_instructions,
    } = debouncedValues;

    queryParams = new URLSearchParams({
      source_folder_option,
      diagram_category,
      diagram_option,
      include_folder_tree: include_folder_tree.toString(),
      include_python_code_outline: include_python_code_outline.toString(),
      git_ignore_file_path,
      llm_vendor_for_instructions,
      llm_model_for_instructions,
    }).toString();
  }

  // Construct the URL with the query parameters
  const url = shouldFetch
    ? `http://localhost:8000/generate_diagram_instructions/?${queryParams}`
    : null;

  const { data, error, mutate } = useSWR(
    url,
    fetcher,
    { revalidateOnFocus: false }, // Disable revalidation on focus to prevent unnecessary calls
  );

  const isLoading = shouldFetch && !error && !data;

  return {
    data,
    error,
    mutate,
    isLoading,
  };
};
