import DiagramForm from "@/components/DiagramForm";
import MermaidTest from "@/components/MermaidTest";
import styles from "./page.module.css";
async function getDiagramConfig() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/diagram_config`,
      {
        cache: "no-store",
      },
    );
    const json = await res.json();

    const diagramOptions = Object.keys(json.diagramCategories).map((key) => ({
      id: key,
      name: json.diagramCategoryNames[key] || key,
    }));

    const defaultDiagramCategory = diagramOptions[0]?.id || "";

    return {
      ...json,
      diagramOptions,
      defaultDiagramCategory,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export default async function Home() {
  const diagramConfig = await getDiagramConfig();
  return (
    <div>
      <MermaidTest />
      <DiagramForm diagramConfig={diagramConfig} styles={styles} />
    </div>
  );
}
