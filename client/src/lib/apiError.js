/**
 * Human-readable message from an axios error.
 * Backend error shape: { success: false, message, errors? }
 */
export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  const message = error?.response?.data?.message;
  if (message) return message;
  if (error?.request && !error?.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}

/**
 * Push backend validation errors into react-hook-form so they show under the
 * right input.
 *
 *  - Zod failures arrive as errors: [{ path: "body.name", message }]
 *  - 409 conflicts arrive as a message only ("Faculty code already exists"),
 *    so we match the message to a field by name.
 *
 * Returns true if at least one field error was set. If it returns false, show
 * a toast instead.
 *
 *   applyServerErrors(error, setError, ["name", "code"])
 */
export function applyServerErrors(error, setError, fields) {
  const data = error?.response?.data;
  let applied = false;

  if (Array.isArray(data?.errors)) {
    for (const { path, message } of data.errors) {
      const field = String(path ?? "").replace(/^body\./, "");
      if (fields.includes(field)) {
        setError(field, { type: "server", message });
        applied = true;
      }
    }
  }

  if (!applied && error?.response?.status === 409 && data?.message) {
    const lower = data.message.toLowerCase();
    const field = fields.find((f) => lower.includes(f.toLowerCase()));
    if (field) {
      setError(field, { type: "server", message: data.message });
      applied = true;
    }
  }

  return applied;
}
