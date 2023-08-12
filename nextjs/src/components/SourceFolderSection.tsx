import { SelectField, TextInput } from "@/components";
import useGitIgnore from "@/hooks/useGitIgnore";
import { Option } from "@/types/DiagramForm.types";
import { useFormikContext } from "formik";
import { FC, useEffect, useState } from "react";
import { handleSourceFolderChange } from "../lib/diagramFormHandlers";
import { DiagramFormValues } from "../types/DiagramForm.types";

type SourceFolderSectionProps = {
  options: Option[];
};

export const SourceFolderSection: FC<SourceFolderSectionProps> = ({
  options,
}) => {
  const [selectedFolder, setSelectedFolder] = useState("");
  const { values, setFieldValue } = useFormikContext<DiagramFormValues>();
  const { fetch, loading, error } = useGitIgnore();

  useEffect(() => {
    if (selectedFolder) {
      handleSourceFolderChange(fetch)(
        selectedFolder,
        setFieldValue,
        values.source_folder_option,
      );
    }
  }, [selectedFolder]);

  return (
    <div>
      <SelectField
        options={options}
        label="Select Project Folder"
        name="source_folder_option"
        id="source_folder_option"
        onChange={(folder: string) => setSelectedFolder(folder)}
        helpText="Select a python project to analyze..."
      />

      <div className="relative">
        <TextInput
          name="git_ignore_file_path"
          label={"GitIgnore File Path" + (loading ? " (Loading...)" : "")}
          helpText="Enter the path to a file that specify files to ignore for analysis intentionally."
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default SourceFolderSection;
