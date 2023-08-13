export const categoryColors = {
  flowchart: "bg-orange-200",
  sequence_diagram: "bg-blue-200",
  class_diagram: "bg-green-200",
  state_diagram: "bg-yellow-200",
  entity_relationship_diagram: "bg-pink-200",
  user_journey_diagram: "bg-purple-200",
  gantt_diagram: "bg-indigo-200",
  pie_chart: "bg-gray-200",
  quadrant_chart: "bg-teal-200",
  requirement_diagram: "bg-orange-200",
  gitgraph_diagram: "bg-red-200",
  c4_diagram: "bg-blue-200",
  mindmap: "bg-green-200",
  timeline_diagram: "bg-indigo-200",
  zenuml_sequence_diagram: "bg-yellow-200",
  flow_analysis_diagram: "bg-pink-200",
  open_ai: "bg-purple-200",
  anthropic: "bg-teal-200",
};

// Helper function to get the color class for a specific category
export const getCategoryColor = (categoryKey: string): string => {
  const colors: { [key: string]: string } = categoryColors;
  return colors[categoryKey] || "bg-gray-200"; // default color if category not found
};
