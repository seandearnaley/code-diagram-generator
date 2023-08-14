import { CheckboxGroup, SourceFolderSection } from "@/components";

interface SourceFolderAndOptionsProps {
  options: any[];
}

export const SourceFolderAndOptions: React.FC<SourceFolderAndOptionsProps> = ({
  options,
}) => {
  return (
    <details open className="mb-4">
      <summary className="cursor-pointer text-lg font-medium text-gray-700">
        Source Folder and Options
      </summary>

      <div className="mb-2">
        <SourceFolderSection options={options} />
        <CheckboxGroup
          options={[
            {
              id: "include_folder_tree",
              label: "Include Folder Tree",
              helpText: "Whether to include the project's folder tree.",
            },
            {
              id: "include_python_code_outline",
              label: "Include Python Code Outline",
              helpText:
                "Whether to include a simple outline of the project's python code",
            },
          ]}
        />
      </div>
    </details>
  );
};
