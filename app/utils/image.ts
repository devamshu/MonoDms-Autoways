const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

export function getImageUrl(imagePath?: string | null) {
  if (!imagePath) return undefined;
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }
  const base = IMAGE_BASE_URL?.replace(/\/$/, "");
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${base}${path}`;
}
