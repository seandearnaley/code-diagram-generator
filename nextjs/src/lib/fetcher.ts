const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (response.status === 422) {
    const errorDetail = await response.json();
    console.error(`Error 422: `, errorDetail);
    throw new Error(`Unprocessable Entity: ${JSON.stringify(errorDetail)}`);
  }

  if (response.status === 500) {
    const errorDetail = await response.json();
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
