import { useEffect, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

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

interface TokenCounterProps {
  textForTokenCount: string;
  llm_vendor_for_instructions: string;
}

export const TokenCounter: React.FC<TokenCounterProps> = ({
  textForTokenCount,
  llm_vendor_for_instructions,
}) => {
  const [tokenCountData, setTokenCountInfo] = useState<TokenCountData | null>(
    null,
  );

  const [debouncedTextForTokenCount] = useDebounce(textForTokenCount, 50);
  const tokenUrl = "http://localhost:8000/token_count";

  const { data, error } = useSWR(
    [tokenUrl, debouncedTextForTokenCount, llm_vendor_for_instructions],
    fetchTokenCount,
  );

  useEffect(() => {
    if (data) {
      setTokenCountInfo(data);
    }
  }, [data]);

  // You can log or handle the error as required
  if (error) {
    console.error(error);
  }

  return tokenCountData ? (
    <p className="text-sm p-4">
      Tokens: {tokenCountData.token_count}, Estimated Words:{" "}
      {tokenCountData.est_words}
    </p>
  ) : null;
};
