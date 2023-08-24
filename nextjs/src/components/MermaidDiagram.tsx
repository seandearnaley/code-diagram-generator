"use client";
import { useRef, useState } from "react";

import { DiagramFormValues } from "@/types/DiagramForm.types";
import { FC } from "react";

import SVGRenderer from "@/components/SVGRenderer";
import getSvgDimensions from "@/lib/getSvgDimensions";
import { ArrowDownOnSquareIcon, BoltIcon } from "@heroicons/react/24/solid";

import { toPng } from "html-to-image";

type MermaidDiagramProps = {
  values: DiagramFormValues;
  text: string;
};

export const MermaidDiagram: FC<MermaidDiagramProps> = ({ values, text }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState("");
  const imageRef = useRef(null);

  const [imageDimensions, setImageDimensions] = useState({
    width: 500,
    height: 500,
  });

  const postMermaid = async () => {
    try {
      setError("");
      setLoading(true);
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
        setLoading(false);
      } else {
        const msg = "Failed, response not ok:" + response.statusText;
        setError(msg);
        setLoading(false);
        console.error(msg);
      }
    } catch (error: any) {
      const msg = `Failed to create diagram: ${error.message}`;
      setError(msg);
      setLoading(false);
      console.error(msg);
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
    <div className="flex justify-center mb-4">
      <div>
        {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
        {/* Loading Modal */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="p-4 bg-white rounded-md">
              <p className="mb-2 text-gray-600 flex items-center">
                Generating design...
                <span className="ml-2 w-5 h-5 border-2 border-blue-500 rounded-full animate-spin"></span>{" "}
                {/* Adding the spinning icon */}
              </p>
              {/* <div className="relative w-full h-2 bg-gray-200 rounded-md">
                <div
                  className="absolute left-0 h-2 bg-blue-500 rounded-md"
                  style={{ width: `${progress}%` }}
                />
              </div> */}
            </div>
          </div>
        )}
        <div className="flex justify-center mb-4">
          <button
            className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200"
            type="button"
            onClick={postMermaid}
          >
            <BoltIcon className="h-5 w-5 mr-2" />
            Generate Design
          </button>
        </div>
        {diagramUrl && (
          <>
            <div className="flex justify-center mb-4">
              dimensions: {imageDimensions.width} x {imageDimensions.height}
            </div>
            <div ref={imageRef}>
              <SVGRenderer svgBlobUrl={diagramUrl} />
            </div>
            <div className="flex justify-center items-center mt-5">
              <a href={diagramUrl} download="diagram.svg">
                <button
                  className="text-sm font-semibold leading-6 text-black items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200"
                  type="button"
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
          </>
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;
