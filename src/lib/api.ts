import { config } from "./config";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
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
    throw new ApiError(
      json.message || "Something went wrong. Please try again.",
      res.status,
      flattenErrors(json.errors),
    );
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
