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
    const [x, y, viewBoxWidth, viewBoxHeight] = viewBox.split(" ").map(Number);
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

export default getSvgDimensions;
