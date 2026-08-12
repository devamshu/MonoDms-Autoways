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
