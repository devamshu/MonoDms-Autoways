export const IMAGE_BASE_URL =
  process.env.EXPO_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") || "";

export const getFullImageUrl = (
  imagePath: string | null | undefined,
): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (!IMAGE_BASE_URL) {
    console.warn("IMAGE_BASE_URL is not configured");
    return undefined;
  }
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${IMAGE_BASE_URL}${path}`;
};

export const formatFullName = (
  firstName?: string,
  middleName?: string,
  lastName?: string,
  username?: string,
): string => {
  const name = [firstName, middleName, lastName].filter(Boolean).join(" ");
  return name || username || "—";
};
