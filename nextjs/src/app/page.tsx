import DiagramForm from "@/components/DiagramForm";
import MermaidTest from "@/components/MermaidTest";

async function getDiagramConfig() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagram_config`, {
    next: { revalidate: 500 },
  });
  const json = await res.json();

  const diagramCategoryOptions = Object.keys(json.diagramCategories).map(
    (key) => ({
      id: key,
      name: json.diagramCategoryNames[key] || key,
    }),
  );

  const defaultDiagramCategory = diagramCategoryOptions[0]?.id || "";

  return {
    ...json,
    diagramCategoryOptions,
    defaultDiagramCategory,
  };
}

async function getLlmConfig() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/llm_config`, {
    cache: "no-store",
  });
  const json = await res.json();

  const llmVendorOptions = Object.keys(json.llmVendors).map((key) => ({
    id: key,
    name: json.llmVendorNames[key] || key,
  }));

  const defaultLlmVendor = llmVendorOptions[0]?.id || "";
  console.log("llmVendorOptions", llmVendorOptions, defaultLlmVendor);
  return {
    ...json,
    llmVendorOptions,
    defaultLlmVendor,
  };
}

async function getSourceFolders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/source_folders`, {
    cache: "no-store",
  });

  const folders: string[] = await res.json();

  return folders.map((folder) => ({
    id: folder,
    name: folder,
  }));
}

async function getInitialGitIgnoreFilePath(folder: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/gitignore_file/?root_folder=${folder}`,
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export default async function Home() {
  const diagramConfigData = getDiagramConfig();
  const llmConfigData = getLlmConfig();
  const sourceFoldersData = getSourceFolders();

  const [diagramConfig, llmConfig, sourceFolderOptions] = await Promise.all([
    diagramConfigData,
    llmConfigData,
    sourceFoldersData,
  ]);

  // Assuming you want to use the first source folder as the default
  const defaultSourceFolder = sourceFolderOptions[0]?.id;

  // Fetch the initial gitignore file path for the default source folder
  const initialGitIgnoreFilePath = await getInitialGitIgnoreFilePath(
    defaultSourceFolder,
  );

  return (
    <>
      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50">
        <DiagramForm
          diagramConfig={diagramConfig}
          llmConfig={llmConfig}
          sourceFolderOptions={sourceFolderOptions}
          defaultSourceFolder={defaultSourceFolder}
          initialGitIgnoreFilePath={initialGitIgnoreFilePath} // Pass the initial path as a prop
        />

        <MermaidTest />
      </div>
    </>
  );
}
