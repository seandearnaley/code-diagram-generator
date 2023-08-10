import { SelectField } from "./SelectField";

import { Option } from "@/types/DiagramForm.types";
import { FC } from "react";

import { useFormikContext } from "formik";

type SourceFolderFieldProps = {
  handleSourceFolderChange: (
    folder: string,
    setFieldValue: (field: string, value: any) => void,
  ) => Promise<void>;
  options: Option[];
  error: string | undefined;
};

export const SourceFolderField: FC<SourceFolderFieldProps> = ({
  handleSourceFolderChange,
  options,
  error,
}) => {
  const { setFieldValue } = useFormikContext();
  return (
    <>
      <SelectField
        options={options}
        label="Select Project Folder"
        name="sourceFolderOption"
        id="sourceFolderOption"
        onChange={(folder: string) =>
          handleSourceFolderChange(folder, setFieldValue)
        }
        helpText="Select a python project to analyze..."
      />
      {error ? <div className="text-red-500">{error}</div> : null}
    </>
  );
};
