import { buildUserText, outputSchema, systemInstructions } from './repair.js'

export const defaultOllamaUrl = 'http://127.0.0.1:11434'
export const defaultOllamaModel = 'gemma3:4b'

function trimTrailingSlash(value) {
  return String(value || defaultOllamaUrl).replace(/\/+$/, '')
}

function sameModel(installed, requested) {
  if (installed === requested) return true
  if (!installed.includes(':') && `${installed}:latest` === requested) return true
  if (!requested.includes(':') && `${requested}:latest` === installed) return true
  return false
}

export async function getOllamaStatus({
  fetchImpl = fetch,
  baseUrl = process.env.OLLAMA_URL || defaultOllamaUrl,
  model = process.env.OLLAMA_MODEL || defaultOllamaModel,
} = {}) {
  try {
    const response = await fetchImpl(`${trimTrailingSlash(baseUrl)}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    })
    if (!response.ok) return { configured: false, running: true, modelInstalled: false, model }

    const payload = await response.json()
    const installedNames = Array.isArray(payload.models)
      ? payload.models.flatMap((entry) => [entry?.name, entry?.model]).filter(Boolean)
      : []
    const modelInstalled = installedNames.some((name) => sameModel(name, model))
    return { configured: modelInstalled, running: true, modelInstalled, model }
  } catch {
    return { configured: false, running: false, modelInstalled: false, model }
  }
}

export async function analyzeWithOllama({
  category,
  description,
  answers,
  imageBuffer,
  fetchImpl = fetch,
  baseUrl = process.env.OLLAMA_URL || defaultOllamaUrl,
  model = process.env.OLLAMA_MODEL || defaultOllamaModel,
}) {
  let response
  try {
    response = await fetchImpl(`${trimTrailingSlash(baseUrl)}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(180_000),
      body: JSON.stringify({
        model,
        stream: false,
        format: outputSchema,
        options: { temperature: 0.1 },
        messages: [
          { role: 'system', content: systemInstructions },
          {
            role: 'user',
            content: buildUserText({ category, description, answers }),
            images: [imageBuffer.toString('base64')],
          },
        ],
      }),
    })
  } catch (error) {
    const localError = new Error(error?.name === 'TimeoutError'
      ? 'The local model took too long to respond. Try again, or close other memory-heavy apps.'
      : 'Ollama is not running. Open the Ollama app, then try again.')
    localError.code = error?.name === 'TimeoutError' ? 'ollama_timeout' : 'ollama_unavailable'
    throw localError
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const detail = String(payload.error || '')
    const modelMissing = response.status === 404 || /model.*(?:not found|required|pull)/i.test(detail)
    const localError = new Error(modelMissing
      ? `The local model “${model}” is not installed. Run: ollama pull ${model}`
      : `Ollama could not complete the analysis${detail ? `: ${detail}` : '.'}`)
    localError.code = modelMissing ? 'ollama_model_missing' : 'ollama_error'
    throw localError
  }

  const payload = await response.json()
  const content = payload?.message?.content
  if (!content) {
    const localError = new Error('The local model returned an empty response. Please try again.')
    localError.code = 'ollama_empty_response'
    throw localError
  }

  try {
    return JSON.parse(content)
  } catch {
    const localError = new Error('The local model returned an unreadable repair guide. Please try again.')
    localError.code = 'ollama_invalid_json'
    throw localError
  }
}
