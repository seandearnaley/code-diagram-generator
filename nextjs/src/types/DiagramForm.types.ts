import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  sourceFolderOption: Yup.string().required("Project Folder is required"),
  diagramOption: Yup.string().required("Diagram Option is required"),
  diagramCategory: Yup.string().required("Diagram Category is required"),
  gitIgnoreFilePath: Yup.string(),
  designInstructions: Yup.string(),
  llmVendorForInstructions: Yup.string().required("Vendor is required"),
  llmModelForInstructions: Yup.string().required("Vendor Model is required"),
});

export type Option = {
  id: string;
  name: string;
};

export type DiagramDefinition = {
  id: string;
  name: string;
  description: string;
};

export type ModelDefinition = {
  id: string;
  name: string;
  description: string;
  max_token_length: number;
};

export type DiagramFormProps = {
  diagramConfig: {
    diagramCategories: { [key: string]: DiagramDefinition[] };
    diagramCategoryOptions: DiagramDefinition[];
    defaultDiagramCategory: string;
  };
  llmConfig: {
    llmVendors: { [key: string]: ModelDefinition[] };
    llmVendorOptions: ModelDefinition[];
    defaultLlmVendor: string;
  };
  sourceFolderOptions: Option[];
  defaultSourceFolder: string;
  initialGitIgnoreFilePath: string;
};

export type DiagramFormValues = {
  sourceFolderOption: string;
  diagramCategory: string;
  diagramOption: string;
  includeFolderTree: boolean;
  includePythonCodeOutline: boolean;
  gitIgnoreFilePath: string;
  designInstructions: string;
  llmVendorForInstructions: string;
  llmModelForInstructions: string;
};
