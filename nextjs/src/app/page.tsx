import DiagramForm from "@/components/DiagramForm";

async function getDiagramConfig() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/diagram_config`,
      {
        cache: "no-cache",
      },
    );
    const json = await res.json();

    const diagram_category_options = Object.keys(json.diagram_categories).map(
      (key) => ({
        id: key,
        name: json.diagram_category_names[key] || key,
      }),
    );

    const default_diagram_category = diagram_category_options[0]?.id || "";

    return {
      ...json,
      diagram_category_options,
      default_diagram_category,
    };
  } catch (error) {
    console.error("Error fetching diagram config:", error);
  }
}

async function getLlmConfig() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/llm_config`);
  const json = await res.json();

  const llm_vendor_options = Object.keys(json.llm_vendors).map((key) => ({
    id: key,
    name: json.llm_vendor_names[key] || key,
  }));

  const default_llm_vendor = llm_vendor_options[0]?.id || "";
  return {
    ...json,
    llm_vendor_options,
    default_llm_vendor,
  };
}

async function getSourceFolders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/source_folders`, {
    cache: "no-cache",
  });

  // TODO: add proper error handling

  const folders: string[] = await res.json();

  return folders.map((folder) => ({
    id: folder,
    name: folder,
  }));
}

export default async function Home() {
  const diagram_config_data = getDiagramConfig();
  const llm_config_data = getLlmConfig();
  const source_folders_data = getSourceFolders();

  const [diagram_config, llm_config, source_folder_options] = await Promise.all(
    [diagram_config_data, llm_config_data, source_folders_data],
  );

  return (
    <div className="overflow-hidden bg-gray-50">
      <DiagramForm
        diagram_config={diagram_config}
        llm_config={llm_config}
        source_folder_options={source_folder_options}
      />
    </div>
  );
}
