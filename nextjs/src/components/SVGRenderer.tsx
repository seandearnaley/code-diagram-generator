import React, { useEffect, useState } from "react";

interface SVGRendererProps {
  svgBlobUrl: string;
}

const SVGRenderer: React.FC<SVGRendererProps> = ({ svgBlobUrl }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    fetch(svgBlobUrl)
      .then((response) => response.text())
      .then((text) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svgElement = doc.documentElement;

        // Try to extract the width and height attributes
        let width = parseFloat(svgElement.getAttribute("width") || "0");
        let height = parseFloat(svgElement.getAttribute("height") || "0");

        // If width and height are not present, try to extract from viewBox
        if (width === 0 || height === 0) {
          const viewBox = svgElement.getAttribute("viewBox");
          if (viewBox) {
            const [_, __, vw, vh] = viewBox.split(" ").map(Number);
            if (vw && vh) {
              width = vw;
              height = vh;
            }
          }
        }

        // Avoid division by zero
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      });
  }, [svgBlobUrl]);

  return (
    <object
      type="image/svg+xml"
      data={svgBlobUrl}
      style={{
        width: "100%",
        height: aspectRatio ? `calc(100vw / ${aspectRatio})` : "auto",
        display: "block",
      }}
    >
      {/* You can provide fallback content here if the SVG fails to load */}
    </object>
  );
};

export default SVGRenderer;
