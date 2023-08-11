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
    setFieldValues(setFieldValue, {
      [field_for_option]: selected_option,
      [field_for_default]: default_option,
    });
  };

export const handleSourceFolderChange =
  (fetchGitIgnore: Function) =>
  async (
    folder: string,
    setFieldValue: (field: string, value: any) => void,
    values: any,
  ): Promise<void> => {
    const currentFolder = values.source_folder_option;
    if (folder !== currentFolder) {
      const git_ignore_path = await fetchGitIgnore(folder);
      setFieldValues(setFieldValue, {
        source_folder_option: folder,
        git_ignore_file_path: git_ignore_path || "",
      });
    }
  };
