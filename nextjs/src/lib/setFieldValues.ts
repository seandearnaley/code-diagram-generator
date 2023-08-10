const setFieldValues = (
  setFieldValue: (field: string, value: any) => void,
  fieldValues: { [key: string]: any },
) => {
  Object.entries(fieldValues).forEach(([field, value]) => {
    setFieldValue(field, value);
  });
};

export default setFieldValues;
