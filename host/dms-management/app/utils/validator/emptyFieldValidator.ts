export const formatValue = (value: any): string => {
  return value && value !== "" && value !== null && value !== undefined
    ? String(value)
    : "-";
};
