"use client";
import Image from "next/image";
import { useRef, useState } from "react";

import { DiagramFormValues } from "@/types/DiagramForm.types";
import { FC } from "react";

import { toPng } from "html-to-image";

import { ArrowDownOnSquareIcon, BoltIcon } from "@heroicons/react/24/solid";

const mermaid = `
    flowchart TD
      A[Start] --> B{Is it?}
      B -- Yes --> C[OK]
      C --> D[Rethink]
      D --> B
      B -- No ----> E[End]
`;

type MermaidDiagramProps = {
  values: DiagramFormValues;
  text: string;
};

export const MermaidDiagram: FC<MermaidDiagramProps> = ({ values, text }) => {
  const [diagramUrl, setDiagramUrl] = useState("");
  const imageRef = useRef(null);

  const postMermaid = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/mermaid_design_request/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            ...values,
          }),
        },
      );

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
    <>
      <button
        className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200"
        type="button"
        onClick={postMermaid}
      >
        <BoltIcon className="h-5 w-5 mr-2" />
        Generate Design
      </button>

      {diagramUrl && (
        <div>
          <div
            className="flex justify-center items-center pt-4 pb-4"
            ref={imageRef}
          >
            <Image
              src={diagramUrl}
              style={{ width: "200px", height: "auto" }}
              alt="Mermaid Diagram"
              width={500}
              height={500}
            />
          </div>
          <div>
            <a href={diagramUrl} download="diagram.svg">
              <button
                className="text-sm font-semibold leading-6 text-black items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200"
                type="button"
                onClick={postMermaid}
              >
                <div className="flex">
                  <ArrowDownOnSquareIcon className="h-5 w-5 mr-2" />
                  Download SVG
                </div>
              </button>
            </a>

            <button
              className="text-sm font-semibold leading-6 text-black items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200 ml-6"
              type="button"
              onClick={downloadPng}
            >
              <div className="flex">
                <ArrowDownOnSquareIcon className="h-5 w-5 mr-2" />
                Download PNG
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidDiagram;
