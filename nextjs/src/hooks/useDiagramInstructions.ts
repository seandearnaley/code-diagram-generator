import { DiagramFormValues } from "@/types/DiagramForm.types";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import fetcher from "../lib/fetcher";

export const useDiagramInstructions = (payload: DiagramFormValues | null) => {
  const [debouncedPayload] = useDebounce(payload, 500); // Debounce payload by 500ms

  const shouldFetch =
    debouncedPayload && debouncedPayload.source_folder_option !== "";

  const { data, error, mutate } = useSWR(
    shouldFetch ? "http://localhost:8000/generate_diagram_instructions/" : null,
    (url) => fetcher(url, debouncedPayload),
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
