import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiClient } from "../services/axios";
import { getErrorMessage } from "./extractError";

/**
 * Downloads an auth-protected file (path is resolved against the API base URL)
 * into the cache and hands it to the OS share sheet, so the user can save,
 * send or open it. Returns the local URI; `message` is set when anything fails.
 */
export async function downloadAndShareFile(
  path: string,
  filename: string,
): Promise<{ success: boolean; uri?: string; message?: string }> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) return { success: false, message: "No writable cache directory" };

  try {
    const token = await apiClient.getFreshAccessToken();
    const result = await FileSystem.downloadAsync(
      apiClient.getAbsoluteUrl(path),
      `${dir}${filename}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    );

    if (result.status !== 200) {
      return {
        success: false,
        message: `Download failed (status ${result.status})`,
      };
    }

    // Sharing is optional (unavailable on some platforms); the file is still
    // saved to the cache either way.
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
    }
    return { success: true, uri: result.uri };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}
