export type PermissionKey = "camera" | "photos";

// "denied" and "blocked" are both refusals, and the difference is the whole
// reason the feature-time flow works: "denied" means the OS will still show a
// dialog if we ask again, "blocked" means asking is a silent no-op and only the
// Settings app can flip it back. iOS blocks on the first refusal; Android only
// after the second.
export type PermissionStatus =
  | "granted"
  | "denied"
  | "blocked"
  | "undetermined";

export type PermissionResults = Record<PermissionKey, PermissionStatus>;

// State Types
export interface PermissionsState {
  // Mirrors the persisted "we have run the first-run flow" flag. Set once the
  // flow terminates, whether the user completed it or skipped it.
  hasAsked: boolean;
  // True while the flag is being read from storage on boot. The routing gate
  // must wait for this, or it would send an already-asked user back to the
  // priming screen.
  isChecking: boolean;
  isRequesting: boolean;
  results: PermissionResults;
}
