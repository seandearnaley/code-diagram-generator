import DiagramForm from "@/components/DiagramForm";

async function getDiagramConfig() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagram_config`, {
    cache: "no-store",
  });
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
}

async function getLlmConfig() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/llm_config`, {
    cache: "no-store",
  });
  const json = await res.json();

  const llm_vendor_options = Object.keys(json.llm_vendors).map((key) => ({
    id: key,
    name: json.llm_vendor_names[key] || key,
  }));

  const default_llm_vendor = llm_vendor_options[0]?.id || "";
  console.log("llm_vendor_options", llm_vendor_options, default_llm_vendor);
  return {
    ...json,
    llm_vendor_options,
    default_llm_vendor,
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
  const diagram_config_data = getDiagramConfig();
  const llm_config_data = getLlmConfig();
  const source_folders_data = getSourceFolders();

  const [diagram_config, llm_config, source_folder_options] = await Promise.all(
    [diagram_config_data, llm_config_data, source_folders_data],
  );

  // Assuming you want to use the first source folder as the default
  const default_source_folder = source_folder_options[0]?.id;

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50">
      <DiagramForm
        diagram_config={diagram_config}
        llm_config={llm_config}
        source_folder_options={source_folder_options}
      />
    </div>
  );
}
