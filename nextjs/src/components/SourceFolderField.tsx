import { SelectField } from "./SelectField";

import { Option } from "@/types/DiagramForm.types";
import { FC } from "react";

import { useFormikContext } from "formik";

type SourceFolderFieldProps = {
  setSelectedFolder: (folder: string) => void;
  options: Option[];
  error: string | undefined;
};

export const SourceFolderField: FC<SourceFolderFieldProps> = ({
  setSelectedFolder,
  options,
  error,
}) => {
  const { setFieldValue, values } = useFormikContext();
  return (
    <>
      <SelectField
        options={options}
        label="Select Project Folder"
        name="source_folder_option"
        id="source_folder_option"
        onChange={(folder: string) => setSelectedFolder(folder)}
        helpText="Select a python project to analyze..."
      />
      {error ? <div className="text-red-500">{error}</div> : null}
    </>
  );
};
