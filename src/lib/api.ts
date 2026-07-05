import { config } from "./config";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  // The backend is inconsistent: `message` is usually a string, but some
  // endpoints return a field-keyed object (e.g. { otp: "Invalid OTP." }).
  message?: string | Record<string, string | string[]>;
  data?: T;
  errors?: Record<string, string | string[]>;
}

/** Field-level validation errors, flattened to one message per field. */
export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get detail(): string {
    const first = Object.values(this.fieldErrors)[0];
    return first || this.message;
  }
}

function flattenErrors(
  errors: Record<string, string | string[]> | undefined,
): FieldErrors {
  const flat: FieldErrors = {};
  if (!errors) return flat;
  for (const [key, value] of Object.entries(errors)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return flat;
}

/**
 * Parse a fetch `Response` into our envelope, throwing `ApiError` on failure.
 */
async function handleResponse<T>(res: Response): Promise<ApiEnvelope<T>> {
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("Unexpected server response.", res.status);
  }

  if (!res.ok || json.success === false) {
    // Normalize `message` (string OR field-keyed object) + `errors` into one
    // flat map, and pick a human string for the top-level message.
    const fieldErrors: FieldErrors = { ...flattenErrors(json.errors) };
    let message: string;
    if (json.message && typeof json.message === "object") {
      Object.assign(fieldErrors, flattenErrors(json.message));
      message =
        Object.values(fieldErrors)[0] ||
        "Something went wrong. Please try again.";
    } else {
      message = json.message || "Something went wrong. Please try again.";
    }
    throw new ApiError(message, res.status, fieldErrors);
  }

  return json;
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }

  return handleResponse<T>(res);
}

export async function apiGet<T = unknown>(
  path: string,
): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }

  return handleResponse<T>(res);
}

export async function apiPatch<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiEnvelope<T>> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      method: "PATCH",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }

  return handleResponse<T>(res);
}

/** DELETE a resource. Tolerates an empty (204) body. */
export async function apiDelete(path: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }

  if (!res.ok) {
    // Try to surface a message if the server sent one.
    let message = "Delete failed. Please try again.";
    try {
      const json = (await res.json()) as ApiEnvelope;
      if (typeof json.message === "string") message = json.message;
    } catch {
      /* empty body — keep default */
    }
    throw new ApiError(message, res.status);
  }
}
