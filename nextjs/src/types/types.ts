export type Option = {
  id: string;
  name: string;
};

export type DiagramDefinition = {
  id: string;
  name: string;
  description: string;
};

export type DiagramFormProps = {
  diagramConfig: {
    diagramCategories: { [key: string]: DiagramDefinition[] };
    diagramCategoryOptions: Option[];
    defaultDiagramCategory: string;
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
};

export interface DiagramFormState {
  loading: boolean;
  error: string | null;
}
