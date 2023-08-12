export const categoryColors = {
  flowchart: "bg-orange-50",
  sequence_diagram: "bg-blue-50",
  open_ai: "bg-green-50",
  anthropic: "bg-yellow-50",
  category5: "bg-pink-50",
  category6: "bg-purple-50",
  category7: "bg-indigo-50",
  category8: "bg-gray-50",
  category9: "bg-teal-50",
  category10: "bg-orange-50",
};

// Helper function to get the color class for a specific category
export const getCategoryColor = (categoryKey: string): string => {
  const colors: { [key: string]: string } = categoryColors;
  return colors[categoryKey] || "bg-gray-200"; // default color if category not found
};
