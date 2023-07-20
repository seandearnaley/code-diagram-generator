"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./page.module.css";

import { toPng } from "html-to-image";

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
  const imageRef = useRef(null);

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
    } catch (error: any) {
      console.error("Failed to create diagram:", error.message);
    }
  };

  const downloadPng = async () => {
    if (!imageRef.current) return;

    const dataUrl = await toPng(imageRef.current);
    const link = document.createElement("a");
    link.download = "diagram.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div>
      <div>
        <button onClick={postMermaid}>Post mermaid</button>
      </div>
      {diagramUrl && (
        <div>
          <div ref={imageRef}>
            <Image
              src={diagramUrl}
              className={styles.mermaiddiagram}
              alt="Mermaid Diagram"
              width={500}
              height={500}
            />
          </div>
          <div>
            <a href={diagramUrl} download="diagram.svg">
              <button type="button">Download SVG</button>
            </a>
            <button onClick={downloadPng}>Download PNG</button>
          </div>
        </div>
      )}
    </div>
  );
}
