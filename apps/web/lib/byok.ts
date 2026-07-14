export type ByokProvider = "mistral";

export type BuildByokProviderRequestArgs = {
  apiKey: string;
  message: string;
  provider: ByokProvider;
};

export function maskProviderKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length < 12) {
    return "Saved";
  }

  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

export function buildByokProviderRequest({
  apiKey,
  message,
  provider,
}: BuildByokProviderRequestArgs): { url: string; init: RequestInit } {
  return {
    url: "/api/byok/mock-provider",
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ content: message, role: "user" }],
        model: "mistral-small-latest",
        provider,
      }),
    },
  };
}
