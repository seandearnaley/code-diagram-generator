import { DiagramFormValues } from "@/types/DiagramForm.types";
import useSWR from "swr";
import fetcher from "../lib/fetcher";

export const useDiagramInstructions = (payload: DiagramFormValues | null) => {
  const shouldFetch = payload && payload.source_folder_option !== "";

  const { data, error, mutate } = useSWR(
    shouldFetch ? "http://localhost:8000/generate_diagram_instructions/" : null,
    (url) => fetcher(url, payload),
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
