import axios from "axios";

// `first_name` -> `First name`, `phone.0.country_code` -> `Phone 0 country code`
function humanizeFieldName(key: string): string {
  const words = key.split(/[_.]/).filter(Boolean).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function extractErrorMessage(data: any): string {
  if (data == null) {
    return "";
  }

  if (typeof data === "string") {
    return data.trim();
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return String(data);
  }

  if (Array.isArray(data)) {
    const messages = data
      .map((item) => extractErrorMessage(item))
      .filter(Boolean);
    return messages.join("; ");
  }

  if (typeof data === "object") {
    const candidates = [
      data.message,
      data.error,
      data.detail,
      data.non_field_errors,
      data.non_field_error,
      data.title,
      data.description,
    ];

    for (const candidate of candidates) {
      const message = extractErrorMessage(candidate);
      if (message) {
        return message;
      }
    }

    // Anything left is DRF's field-keyed shape, e.g.
    // `{"address": ["This field may not be blank."]}`. Returning the bare
    // message loses the only part that identifies which input is at fault, so
    // label each one and report all of them rather than just the first.
    const fieldMessages = Object.keys(data)
      .map((key) => {
        const message = extractErrorMessage(data[key]);
        if (!message) return "";
        const label = humanizeFieldName(key);
        // Nested serializers already carry their own label; don't double it.
        return message.startsWith(`${label}:`) ? message : `${label}: ${message}`;
      })
      .filter(Boolean);

    if (fieldMessages.length > 0) {
      return fieldMessages.join("\n");
    }

    return JSON.stringify(data);
  }

  return "";
}

export function getErrorMessage(error: any): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const message = extractErrorMessage(responseData);
    return (
      message ||
      responseData?.message ||
      responseData?.error ||
      error.message ||
      "An unexpected error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message || "An unexpected error occurred";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    return extractErrorMessage(error) || "An unexpected error occurred";
  }

  return "An unexpected error occurred";
}

export function getApiErrorMessage(
  response: any,
  fallback = "An error occurred",
): string {
  if (!response) {
    return fallback;
  }

  const message = extractErrorMessage(response.data ?? response);
  if (message) {
    return message;
  }

  if (typeof response.message === "string" && response.message.trim()) {
    return response.message.trim();
  }

  if (typeof response.error === "string" && response.error.trim()) {
    return response.error.trim();
  }

  return fallback;
}
