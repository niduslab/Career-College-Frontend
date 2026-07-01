/**
 * Each validator returns an error string.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Email is required";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Full name is required";
  if (v.length < 2) return "Full name must be at least 2 characters";
  if (v.length > 150) return "Full name is too long";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 128) return "Password is too long";
  if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter";
  if (!/[a-z]/.test(value)) return "Add at least one lowercase letter";
  if (!/\d/.test(value)) return "Add at least one number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Add at least one special character";
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return undefined;
}

export function validateRequired(
  value: string | undefined,
  label: string,
): string | undefined {
  if (!value || !value.trim()) return `${label} is required`;
  return undefined;
}

export function validateUrl(
  value: string,
  label = "URL",
  mustInclude?: string,
): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(v);
  } catch {
    return `Enter a valid ${label} (include https://)`;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return `${label} must start with http:// or https://`;
  }
  if (mustInclude && !parsed.hostname.toLowerCase().includes(mustInclude)) {
    return `Enter a valid ${label} link`;
  }
  return undefined;
}

/** Optional max-length check. Empty is allowed. */
export function validateMaxLength(
  value: string,
  max: number,
  label: string,
): string | undefined {
  if (value.trim().length > max)
    return `${label} must be ${max} characters or fewer`;
  return undefined;
}

/**
 * Partner institutions must use an institutional email.
 */
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
];

export function validateInstitutionalEmail(value: string): string | undefined {
  const base = validateEmail(value);
  if (base) return base;
  const domain = value.trim().toLowerCase().split("@")[1] ?? "";
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return "Use an official institutional email, not a personal one";
  }
  return undefined;
}
