// fetcher.ts
const fetcher = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Error fetching data");
  }
  return response.json();
};

export default fetcher;
