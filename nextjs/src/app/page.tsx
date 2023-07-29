import DiagramForm from "@/components/DiagramForm";
import MermaidTest from "../components/MermaidTest";

async function getDiagramOptions() {
  const res = await fetch(`http://localhost:8000/diagram_types`);
  return res.json();
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
