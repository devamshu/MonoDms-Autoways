import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import type {
  PermissionKey,
  PermissionResults,
  PermissionStatus,
} from "../features/permissions/types";

// Native permission layer. Each call is isolated so a throw from one native
// module (Expo Go can't show the FCM dialog, for instance) is recorded as a
// denial rather than aborting the whole sequence.

async function safeCall(
  key: PermissionKey,
  fn: () => Promise<PermissionStatus>,
): Promise<PermissionStatus> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[permissions] ${key} failed:`, error);
    return "denied";
  }
}

// expo-image-picker reports the refusal kind out of band: `canAskAgain` is what
// separates a refusal we may re-prompt for from one only Settings can undo.
function fromExpo(result: ImagePicker.PermissionResponse): PermissionStatus {
  if (result.granted) return "granted";
  if (result.status === ImagePicker.PermissionStatus.UNDETERMINED) {
    return "undetermined";
  }
  return result.canAskAgain ? "denied" : "blocked";
}

// --- Checks: read current state, never show a dialog -------------------------

export async function checkPermission(
  key: PermissionKey,
): Promise<PermissionStatus> {
  return safeCall(key, async () => {
    switch (key) {
      case "camera":
        return fromExpo(await ImagePicker.getCameraPermissionsAsync());
      case "photos":
        return fromExpo(await ImagePicker.getMediaLibraryPermissionsAsync());
    }
  });
}

// --- Requests: may show the system dialog ------------------------------------

export async function requestCameraPermission(): Promise<PermissionStatus> {
  return safeCall("camera", async () =>
    fromExpo(await ImagePicker.requestCameraPermissionsAsync()),
  );
}

export async function requestPhotosPermission(): Promise<PermissionStatus> {
  return safeCall("photos", async () =>
    fromExpo(await ImagePicker.requestMediaLibraryPermissionsAsync()),
  );
}

export async function requestPermission(
  key: PermissionKey,
): Promise<PermissionStatus> {
  switch (key) {
    case "camera":
      return requestCameraPermission();
    case "photos":
      return requestPhotosPermission();
  }
}

// Runs the dialogs one after another. They must be sequential: firing them
// concurrently makes the OS queue or silently drop the later ones.
export async function requestAllPermissions(): Promise<PermissionResults> {
  const camera = await requestCameraPermission();
  const photos = await requestPhotosPermission();

  return { camera, photos };
}

// --- Feature-time gate -------------------------------------------------------

// The counterpart to the first-run sweep: called at the moment a feature needs
// the permission, for the user who refused it (or whose OS never asked, e.g. a
// device that upgraded into Android 13's POST_NOTIFICATIONS).
//
// Re-asks only when a dialog would actually appear. Once "blocked", request()
// resolves to the same refusal without showing anything, so calling it would
// just be a slower way to fail.
export async function ensurePermission(
  key: PermissionKey,
): Promise<PermissionStatus> {
  const current = await checkPermission(key);
  if (current === "granted" || current === "blocked") return current;
  return requestPermission(key);
}

const PERMISSION_COPY: Record<
  PermissionKey,
  { title: string; message: string }
> = {
  camera: {
    title: "Camera access needed",
    message:
      "Allow camera access in Settings to take a photo for your profile picture.",
  },
  photos: {
    title: "Photo access needed",
    message:
      "Allow photo access in Settings to choose a profile picture from your gallery.",
  },
};

// What call sites use. Returns true only when the feature may proceed; on a
// hard refusal it explains why and hands the user the one control that can
// actually change the answer.
export async function ensurePermissionOrPrompt(
  key: PermissionKey,
): Promise<boolean> {
  const status = await ensurePermission(key);
  if (status === "granted") return true;

  // A fresh "denied" came from a dialog the user just dismissed — re-explaining
  // it on top of their own decision is nagging. Only the blocked case needs the
  // Settings hand-off, because nothing in the app can prompt them again.
  if (status === "blocked") {
    const { title, message } = PERMISSION_COPY[key];
    Alert.alert(title, message, [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]);
  }

  return false;
}
