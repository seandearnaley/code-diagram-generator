// useDiagramInstructions.ts
import { DiagramFormValues } from "@/types/DiagramForm.types";
import useSWR from "swr";
import fetcher from "../lib/fetcher";

export const useDiagramInstructions = (payload: DiagramFormValues | null) => {
  const { data, error, mutate } = useSWR(
    payload ? "http://localhost:8000/generate_diagram_instructions/" : null,
    (url) => fetcher(url, payload),
    { revalidateOnFocus: false }, // Disable revalidation on focus to prevent unnecessary calls
  );

  return {
    data,
    error,
    mutate,
  };
};
