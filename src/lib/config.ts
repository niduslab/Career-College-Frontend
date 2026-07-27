function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function wsBaseUrlFrom(apiBaseUrl: string): string {
  const origin = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return origin.replace(/^http/, "ws");
}

export const config = {
  apiBaseUrl: required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
  get wsBaseUrl() {
    return wsBaseUrlFrom(this.apiBaseUrl);
  },
} as const;
