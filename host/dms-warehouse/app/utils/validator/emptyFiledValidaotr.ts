export const formatValue = (value: any): string => {
  // Check for null, undefined, empty string, but allow 0
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};
