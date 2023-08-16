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

  const [imageDimensions, setImageDimensions] = useState({
    width: 500,
    height: 500,
  });

  // Function to get the dimensions from the SVG content
  const getSvgDimensions = (svgContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    // Read the width and height attributes if they exist
    let width = parseFloat(svgElement?.getAttribute("width") || "0");
    let height = parseFloat(svgElement?.getAttribute("height") || "0");

    // If width and height are not specified, try to parse the viewBox attribute
    if (width === 0 || height === 0) {
      const viewBox = svgElement?.getAttribute("viewBox") || "";
      const [x, y, viewBoxWidth, viewBoxHeight] = viewBox
        .split(" ")
        .map(Number);
      if (viewBoxWidth && viewBoxHeight) {
        // If only one dimension is specified, calculate the other to maintain aspect ratio
        if (width === 0 && height !== 0) {
          width = (viewBoxWidth / viewBoxHeight) * height;
        } else if (height === 0 && width !== 0) {
          height = (viewBoxHeight / viewBoxWidth) * width;
        } else {
          width = viewBoxWidth;
          height = viewBoxHeight;
        }
      }
    }

    return { width, height };
  };

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

        // Extract the dimensions from the SVG content
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const dimensions = getSvgDimensions(content);

          console.log("dimensions", dimensions);
          setImageDimensions(dimensions);
        };
        reader.readAsText(blob);
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
          <div className="mb-4">
            dimensions: {imageDimensions.width} x {imageDimensions.height}
          </div>
          <div
            // className="flex justify-center items-center pt-4 pb-4"
            ref={imageRef}
            // style={{
            //   width: `${imageDimensions.width}px`,
            //   height: `${imageDimensions.height}px`,
            // }}
          >
            <Image
              src={diagramUrl}
              alt="Mermaid Diagram"
              // style={{
              //   width: "100%",
              //   height: "auto",
              //   objectFit: "contain",
              // }}
              width={600}
              height={600}
            />
          </div>
          <div className="flex justify-center items-center mt-5">
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
