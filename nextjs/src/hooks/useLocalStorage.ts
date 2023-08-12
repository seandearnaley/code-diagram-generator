import { useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  initialValue: T,
  omitFields: string[] = [],
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const savedValue = window.localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : initialValue;
    }
    return initialValue; // Ensure the initial value is returned on the server
  });

  const setValue = (value: T) => {
    const valueToStore: Partial<T> = { ...value };
    omitFields.forEach((field) => {
      delete valueToStore[field as keyof typeof valueToStore];
    });
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
    setStoredValue(value);
  };

  return [storedValue, setValue];
}
