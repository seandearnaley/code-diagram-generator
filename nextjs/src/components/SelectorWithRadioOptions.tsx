import { DiagramFormValues, Option } from "@/types/DiagramForm.types";
import { FormikHelpers } from "formik";
import { FC } from "react";
import { RadioButtonGroup } from "./RadioButtonGroup";
import { SelectField } from "./SelectField";

type Props = {
  selectOptions: Option[];
  optionsObject: Record<string, Option[]>;
  selectLabel: string;
  selectName: keyof DiagramFormValues;
  selectId: string;
  radioName: keyof DiagramFormValues;
  selectValue: string;
  radioValue: string;
  setFieldValue: FormikHelpers<DiagramFormValues>["setFieldValue"];
  errors: Record<string, string>;
};

export const SelectorWithRadioOptions: FC<Props> = ({
  selectOptions,
  optionsObject,
  selectLabel,
  selectName,
  selectId,
  radioName,
  selectValue,
  radioValue,
  setFieldValue,
  errors,
}) => {
  const handleSelectorChange = (selectedOption: string) => {
    setFieldValue(selectName, selectedOption);
    // setFieldValue(radioName, "");
  };

  const radioOptions = optionsObject[selectValue] || [];

  return (
    <>
      <SelectField
        options={selectOptions}
        label={selectLabel}
        name={selectName}
        id={selectId}
        onChange={handleSelectorChange}
        value={selectValue}
      />

      {selectValue && (
        <RadioButtonGroup
          options={radioOptions}
          name={radioName}
          categoryKey={selectValue}
          value={radioValue}
        />
      )}

      {errors[radioName] ? (
        <div className="text-red-500 text-sm font-bold ml-5">
          &gt; {errors[radioName]}
        </div>
      ) : null}
    </>
  );
};
