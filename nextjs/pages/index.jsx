import React, { useState } from "react";

const mermaid = `
    flowchart TD
      A[Start] --> B{Is it?}
      B -- Yes --> C[OK]
      C --> D[Rethink]
      D --> B
      B -- No ----> E[End]
`;

export default function Home() {
  const [diagramUrl, setDiagramUrl] = useState("");

  const postData = async () => {
    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: "test" }),
    });
    const data = await response.json();
    console.log(data);
  };

  const postMermaid = async () => {
    try {
      const response = await fetch("http://localhost:8000/mermaid/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mermaid_script: mermaid }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDiagramUrl(url);
      } else {
        console.error("Failed to create diagram:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to create diagram:", error.message);
    }
  };

  return (
    <div>
      <div className="mermaid-diagram">
        agadgdag dagad gadg dag adg adgda gdagadgaddagad agadgdag dagad gadg dag
        adg adgda gdagadgaddagad agadgdag dagad gadg dag adg adgda
        gdagadgaddagad agadgdag dagad gadg dag adg adgda gdagadgaddagad agadgdag
        dagad gadg dag adg adgda gdagadgaddagad agadgdag dagad gadg dag adg
        adgda gdagadgaddagad agadgdag dagad gadg dag adg adgda gdagadgaddagad
      </div>
      <button onClick={postData}>Post Data</button>

      <button onClick={postMermaid}>Post mermaid</button>

      {diagramUrl && (
        <img
          src={diagramUrl}
          className="mermaid-diagram"
          alt="Mermaid Diagram"
        />
      )}
    </div>
  );
}
