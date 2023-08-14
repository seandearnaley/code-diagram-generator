import { SelectorWithRadioOptions } from "@/components";
import React from "react";

interface DiagramConfigurationProps {
  selectOptions: any[];
  optionsObject: any;
  selectValue: any;
  radioValue: any;
  setFieldValue: any;
  errors: any;
}

export const DiagramConfiguration: React.FC<DiagramConfigurationProps> = ({
  selectOptions,
  optionsObject,
  selectValue,
  radioValue,
  setFieldValue,
  errors,
}) => {
  return (
    <details open className="mb-4">
      <summary className="cursor-pointer text-lg font-medium text-gray-700">
        Diagram Configuration
      </summary>
      <div className="mt-2">
        <SelectorWithRadioOptions
          selectOptions={selectOptions}
          optionsObject={optionsObject}
          selectLabel="Select Diagram Category"
          selectName="diagram_category"
          selectId="diagram_category"
          radioName="diagram_option"
          selectValue={selectValue}
          radioValue={radioValue}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </div>
    </details>
  );
};

export default DiagramConfiguration;
