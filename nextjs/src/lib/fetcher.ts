// fetcher.ts
const fetcher = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 500) {
    // Extract the details if the status code is 500
    const errorDetail = await response.json(); // You can change this to .json() if the details are in JSON format
    throw new Error(`Server error 500: ${errorDetail.detail}`);
  }

  if (!response.ok) {
    throw new Error(
      `Error fetching data: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export default fetcher;
