import { DiagramFormValues } from "@/types/DiagramForm.types";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import fetcher from "../lib/fetcher";

export const useDiagramInstructions = (payload: DiagramFormValues | null) => {
  const [debouncedPayload] = useDebounce(payload, 500); // Debounce payload by 500ms

  const shouldFetch =
    debouncedPayload && debouncedPayload.source_folder_option !== "";

  // Construct the query parameters from the debounced payload
  const queryParams = new URLSearchParams({
    source_folder_option: debouncedPayload?.source_folder_option || "",
    diagram_category: debouncedPayload?.diagram_category || "",
    diagram_option: debouncedPayload?.diagram_option || "",
    include_folder_tree:
      debouncedPayload?.include_folder_tree?.toString() || "false",
    include_python_code_outline:
      debouncedPayload?.include_python_code_outline?.toString() || "false",
    git_ignore_file_path: debouncedPayload?.git_ignore_file_path || "",
    llm_vendor_for_instructions:
      debouncedPayload?.llm_vendor_for_instructions || "",
    llm_model_for_instructions:
      debouncedPayload?.llm_model_for_instructions || "",
  }).toString();

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
