// Request deduplication utility to prevent duplicate API calls
// Tracks in-flight requests and returns the same promise for duplicate requests

type RequestKey = string;
type PendingRequest<T> = {
  promise: Promise<T>;
  count: number;
};

const pendingRequests = new Map<RequestKey, PendingRequest<any>>();

/**
 * Generate a unique key for a request based on URL and params
 */
export function generateRequestKey(
  url: string,
  params?: Record<string, any>
): RequestKey {
  const paramStr = params ? JSON.stringify(params) : "";
  return `${url}::${paramStr}`;
}

/**
 * Wrap an API call with deduplication logic
 * If the same request is already in-flight, return the existing promise
 * Otherwise, make the request and cache the promise
 */
export async function dedupRequest<T>(
  key: RequestKey,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if request is already in-flight
  const existing = pendingRequests.get(key);
  if (existing) {
    existing.count++;
    return existing.promise;
  }

  // Create new request
  const promise = requestFn()
    .then((result) => {
      // Clean up on success
      const req = pendingRequests.get(key);
      if (req) {
        req.count--;
        if (req.count === 0) {
          pendingRequests.delete(key);
        }
      }
      return result;
    })
    .catch((error) => {
      // Clean up on error
      const req = pendingRequests.get(key);
      if (req) {
        req.count--;
        if (req.count === 0) {
          pendingRequests.delete(key);
        }
      }
      throw error;
    });

  // Store the promise
  pendingRequests.set(key, { promise, count: 1 });

  return promise;
}

/**
 * Get count of pending requests (useful for debugging/monitoring)
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size;
}

/**
 * Clear all pending request tracking (use cautiously)
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}
