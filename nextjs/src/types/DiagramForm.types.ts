import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  source_folder_option: Yup.string().required("Project Folder is required"),
  diagram_category: Yup.string().required("Diagram Category is required"),
  diagram_option: Yup.string().required("Diagram Option is required"),
  git_ignore_file_path: Yup.string(),
  design_instructions: Yup.string(), // Note: Keeping this as is unless you provide a new name
  llm_vendor_for_instructions: Yup.string().required("Vendor is required"),
  llm_model_for_instructions: Yup.string().required("Vendor Model is required"),
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
  diagram_config: {
    diagram_categories: { [key: string]: DiagramDefinition[] };
    diagram_category_options: DiagramDefinition[];
    default_diagram_category: string;
  };
  llm_config: {
    llm_vendors: { [key: string]: ModelDefinition[] };
    llm_vendor_options: ModelDefinition[];
    default_llm_vendor: string;
  };
  source_folder_options: Option[];
  default_source_folder: string;
  initial_git_ignore_file_path: string;
};
export type DiagramFormValues = {
  source_folder_option: string;
  diagram_category: string;
  diagram_option: string;
  include_folder_tree: boolean;
  include_python_code_outline: boolean;
  git_ignore_file_path: string;
  llm_vendor_for_instructions: string;
  llm_model_for_instructions: string;
  design_instructions: string;
};
