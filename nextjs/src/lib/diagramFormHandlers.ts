// diagramFormHandlers.ts
import setFieldValues from "@/lib/setFieldValues";

export const createOptionChangeHandler =
  (field_for_option: string, field_for_default: string) =>
  (
    selected_option: string,
    options: any,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const default_option = options[selected_option]?.[0]?.id || "";
    setFieldValue(field_for_option, selected_option);
    setFieldValue(field_for_default, default_option);
  };

export const handleSourceFolderChange =
  (fetchGitIgnore: Function) =>
  async (
    folder: string,
    setFieldValue: (field: string, value: any) => void,
    currentFolder: string,
  ): Promise<void> => {
    console.log("Input values:", folder, currentFolder);
    if (folder !== currentFolder) {
      const git_ignore_path = await fetchGitIgnore(folder);
      setFieldValues(setFieldValue, {
        source_folder_option: folder,
        git_ignore_file_path: git_ignore_path || "",
      });
    }
    console.log("Output values:", folder, currentFolder);
  };