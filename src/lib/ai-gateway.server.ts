import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Lovable AI Gateway provider (server-only).
 * Sends the workspace key in the `Lovable-API-Key` header; the key itself is
 * also passed as apiKey to satisfy the SDK without leaking to the client.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
    },
  });
}
