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

export default async function Home() {
  const diagramConfigData = getDiagramConfig();
  const sourceFoldersData = getSourceFolders();

  const [diagramConfig, sourceFolderOptions] = await Promise.all([
    diagramConfigData,
    sourceFoldersData,
  ]);
  return (
    <>
      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-2 sm:py-6">
        <DiagramForm
          diagramConfig={diagramConfig}
          sourceFolderOptions={sourceFolderOptions}
        />

        <MermaidTest />
      </div>
    </>
  );
}
