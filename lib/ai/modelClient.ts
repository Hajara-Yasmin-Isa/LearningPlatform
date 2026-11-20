// The one place the app chooses a model provider. Everything else calls chatStream().
//
//   AI_PROVIDER=cloudflare  Cloudflare Workers AI (preview and production; see cloudflareClient.ts)
//   AI_PROVIDER=ollama      a local Ollama server (default, for offline development)
//
// Switching provider, or rolling back to Ollama, is this one environment variable.

import { cloudflareChatStream } from './cloudflareClient'
import { ollamaChatStream, type ChatMessage, type ChatOptions } from './ollamaClient'

export { ModelUnavailableError } from './modelErrors'
export type { ChatMessage, ChatOptions } from './ollamaClient'

export type Provider = 'ollama' | 'cloudflare'

export function currentProvider(): Provider {
    return process.env.AI_PROVIDER?.trim().toLowerCase() === 'cloudflare' ? 'cloudflare' : 'ollama'
}

export function chatStream(
    messages: ChatMessage[],
    options: ChatOptions & { signal?: AbortSignal } = {},
): AsyncGenerator<string> {
    return currentProvider() === 'cloudflare'
        ? cloudflareChatStream(messages, options)
        : ollamaChatStream(messages, options)
}
