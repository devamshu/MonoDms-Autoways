import { openBrowserAsync } from "expo-web-browser";

// Opens in the in-app browser so the user stays inside the app.
export async function openLegalLink(url: string): Promise<void> {
  try {
    await openBrowserAsync(url);
  } catch {
    // No browser available / user dismissed: nothing useful to surface.
  }
}
