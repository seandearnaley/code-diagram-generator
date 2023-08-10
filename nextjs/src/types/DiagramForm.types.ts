import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  sourceFolderOption: Yup.string().required("Project Folder is required"),
  diagramOption: Yup.string().required("Diagram Option is required"),
  diagramCategory: Yup.string().required("Diagram Category is required"),
  gitIgnoreFilePath: Yup.string(),
  designInstructions: Yup.string(),
});
