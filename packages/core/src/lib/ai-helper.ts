import { AIProvider } from "@/store/use-ai-store"

/**
 * Resolves the configuration for AI requests.
 * It prioritizes user-defined credentials passed from Local Storage (via Zustand),
 * and falls back to server-side .env secrets if not provided.
 */
export function getAIConfig(clientConfig: {
  provider: AIProvider
  model: string
  baseUrl: string
  apiKey: string
}) {
  let provider = clientConfig.provider
  let apiKey = clientConfig.apiKey
  let baseUrl = clientConfig.baseUrl
  let model = clientConfig.model

  // 1. Resolve API Key: Local Storage -> Environment Variable
  if (!apiKey) {
    if (provider === "openai" && process.env.OPENAI_API_KEY) apiKey = process.env.OPENAI_API_KEY
    else if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) apiKey = process.env.ANTHROPIC_API_KEY
    else if (provider === "gemini" && process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY
    else if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) apiKey = process.env.OPENROUTER_API_KEY
  }

  // 2. Auto-Discovery Fallback: If local AI is not set up (no key anywhere for the target provider), 
  // try to dynamically find ANY configured provider in the .env file.
  if (!apiKey) {
    if (process.env.OPENROUTER_API_KEY) {
      provider = "openrouter"
      apiKey = process.env.OPENROUTER_API_KEY
      baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
      model = process.env.OPENROUTER_MODEL || "openrouter/free"
    } else if (process.env.OPENAI_API_KEY) {
      provider = "openai"
      apiKey = process.env.OPENAI_API_KEY
      baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
      model = process.env.OPENAI_MODEL || "gpt-4o"
    } else if (process.env.ANTHROPIC_API_KEY) {
      provider = "anthropic"
      apiKey = process.env.ANTHROPIC_API_KEY
      baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1"
      model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest"
    } else if (process.env.GEMINI_API_KEY) {
      provider = "gemini"
      apiKey = process.env.GEMINI_API_KEY
      baseUrl = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta"
      model = process.env.GEMINI_MODEL || "gemini-1.5-flash"
    }
  }

  // 3. Resolve Base URL for the finalized provider
  if (!baseUrl) {
    if (provider === "openrouter") baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
    else if (provider === "openai") baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
    else if (provider === "anthropic") baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1"
    else if (provider === "gemini") baseUrl = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta"
  }

  // 4. Resolve Model (Fallback to env override if supported)
  if (provider === "openrouter" && (!model || model === "gpt-4o")) {
    model = process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5"
  }

  if (!apiKey && provider !== "custom") {
    throw new Error(`API key is missing. Please set it in Settings -> AI, or inside your .env file.`)
  }

  return {
    provider,
    model: model,
    baseUrl: baseUrl,
    apiKey: apiKey,
  }
}
