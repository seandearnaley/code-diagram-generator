import { SelectField } from "./SelectField";

import { FC } from "react";

import { Option } from "../types/types";

type SourceFolderFieldProps = {
  handleSourceFolderChange: (folder: string) => void;
  options: Option[];
  error: string | undefined;
};

export const SourceFolderField: FC<SourceFolderFieldProps> = ({
  handleSourceFolderChange,
  options,
  error,
}) => (
  <>
    <SelectField
      options={options}
      label="Select Project Folder"
      name="sourceFolderOption"
      id="sourceFolderOption"
      onChange={handleSourceFolderChange}
      helpText="Select a python project to analyze..."
    />
    {error ? <div className="text-red-500">{error}</div> : null}
  </>
);
