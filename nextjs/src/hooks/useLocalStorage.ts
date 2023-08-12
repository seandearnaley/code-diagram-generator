import { useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const savedValue = window.localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : initialValue;
    }
    return initialValue; // Ensure the initial value is returned on the server
  });

  const setValue = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    setStoredValue(value);
  };

  return [storedValue, setValue];
}
