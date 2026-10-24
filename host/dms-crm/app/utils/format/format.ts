// Money is shown in Nepali rupees; the API sends plain numbers or numeric
// strings, so anything non-numeric (or empty) falls back to an em dash.
export const formatNpr = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `NPR ${amount.toLocaleString("en-IN")}`;
};

export const formatIdentifier = (
  identifier: string,
  identifierType: "email" | "phone",
) => {
  if (identifierType === "email") {
    const [username, domain] = identifier.split("@");

    return username.length > 3
      ? `${username.slice(0, 3)}***@${domain}`
      : identifier;
  }

  return identifier.length > 4 ? `****${identifier.slice(-4)}` : identifier;
};
