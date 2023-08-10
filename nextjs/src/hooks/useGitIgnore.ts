import { useState } from "react";

const fetchGitIgnoreFile = async (folder: string) => {
  const response = await fetch(
    `http://localhost:8000/gitignore_file/?root_folder=${folder}`,
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export default function useGitIgnore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGitIgnoreFilePath = async (
    folder: string,
  ): Promise<string | null> => {
    try {
      const data = await fetchGitIgnoreFile(folder);
      return data || null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const fetch = async (folder: string) => {
    setLoading(true);
    setError(null);
    try {
      const git_ignore_path = await fetchGitIgnoreFilePath(folder);
      setLoading(false);
      return git_ignore_path;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return { fetch, loading, error };
}
