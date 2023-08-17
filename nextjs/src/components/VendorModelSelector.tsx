import { SelectorWithRadioOptions } from "@/components";

interface VendorConfigProps {
  selectOptions: any[];
  optionsObject: any;
  selectValue: any;
  radioValue: any;
  setFieldValue: any;
  errors: any;
}

export const VendorModelSelector: React.FC<VendorConfigProps> = ({
  selectOptions,
  optionsObject,
  selectValue,
  radioValue,
  setFieldValue,
  errors,
}) => {
  return (
    <details className="mb-4">
      <summary className="cursor-pointer text-lg font-medium text-gray-700">
        Vendor Config
      </summary>

      <div className="mt-2">
        <SelectorWithRadioOptions
          selectOptions={selectOptions}
          optionsObject={optionsObject}
          selectLabel="Select LLM Vendor for Instructions"
          selectName="llm_vendor_for_instructions"
          selectId="llm_vendor_for_instructions"
          radioName="llm_model_for_instructions"
          selectValue={selectValue}
          radioValue={radioValue}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </div>
    </details>
  );
};

export default VendorModelSelector;
