import DiagramForm from "@/components/DiagramForm";
import MermaidTest from "@/components/MermaidTest";

async function getDiagramOptions() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/diagram_config`,
      {
        cache: "no-store",
      },
    );
    return res.json();
  } catch (e) {
    console.log(e);
    return {};
  }
}

export default async function Home() {
  const diagramOptions = await getDiagramOptions();
  return (
    <div>
      <MermaidTest />
      <DiagramForm options={diagramOptions} />
    </div>
  );
}
