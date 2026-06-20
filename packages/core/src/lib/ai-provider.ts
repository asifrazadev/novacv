import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { AIProvider } from "@/store/use-ai-store"

export function getAIModel(config: {
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl: string
}) {
  const apiKey = config.apiKey || 
    (config.provider === 'openai' ? process.env.OPENAI_API_KEY :
     config.provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY :
     config.provider === 'gemini' ? process.env.GEMINI_API_KEY :
     config.provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : 
     undefined)

  switch (config.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey })
      return openai(config.model)
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey })
      return anthropic(config.model)
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey })
      return google(config.model)
    }
    case "ollama": {
      const ollama = createOpenAI({
        apiKey: "ollama",
        baseURL: config.baseUrl || "http://localhost:11434/v1",
      })
      return ollama(config.model)
    }
    case "openrouter": {
      const openrouter = createOpenAI({
        apiKey,
        baseURL: config.baseUrl || "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://novacv.onrender.com",
          "X-Title": "NovaCV",
        },
      })
      return openrouter(config.model)
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}
