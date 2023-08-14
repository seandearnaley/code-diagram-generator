import { SelectField, TextInput } from "@/components";
import useGitIgnore from "@/hooks/useGitIgnore";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Option } from "@/types/DiagramForm.types";
import { useFormikContext } from "formik";
import { FC, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { DiagramFormValues } from "../types/DiagramForm.types";

type SourceFolderSectionProps = {
  options: Option[];
};

export const SourceFolderSection: FC<SourceFolderSectionProps> = ({
  options,
}) => {
  const {
    values: { source_folder_option, git_ignore_file_path },
    setFieldValue,
  } = useFormikContext<DiagramFormValues>();
  const { fetch, loading, error } = useGitIgnore();

  const [manuallyChanged, setManuallyChanged] = useLocalStorage(
    "manuallyChanged",
    false,
  );

  const [inputValue, setInputValue] = useState(git_ignore_file_path);
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  useEffect(() => {
    if (!source_folder_option) return;
    fetch(source_folder_option).then((gitIgnoreFilePath) => {
      setFieldValue("git_ignore_file_path", gitIgnoreFilePath || "");
    });
  }, [source_folder_option, manuallyChanged]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFieldValue("git_ignore_file_path", debouncedInputValue);
  }, [debouncedInputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <SelectField
        options={options}
        label="Select Project Folder"
        name="source_folder_option"
        id="source_folder_option"
        onChange={(folder: string) => {
          setManuallyChanged(false);
          setFieldValue("source_folder_option", folder);
        }}
        value={source_folder_option}
        helpText="Select a python project to analyze..."
      />

      <TextInput
        name="git_ignore_file_path"
        label={"GitIgnore File Path" + (loading ? " (Loading...)" : "")}
        helpText="Enter the path to a file that specify files to ignore for analysis intentionally."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setManuallyChanged(true);
          setInputValue(e.target.value);
        }}
      />
      {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
    </div>
  );
};

export default SourceFolderSection;
