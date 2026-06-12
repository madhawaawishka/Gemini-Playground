const BASE_URL = 'https://api.groq.com/openai/v1'

export const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
]

export const DEFAULT_MODEL = MODELS[0]

function headers(apiKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

export const ENDPOINTS = [
  {
    id: 'groqChatCompletions',
    name: 'Chat Completions',
    method: 'POST',
    description: 'Generate a chat completion (OpenAI-compatible).',
    pathTemplate: '/chat/completions',
    fields: { model: true, prompt: true },
  },
  {
    id: 'groqStreamChatCompletions',
    name: 'Stream Chat Completions',
    method: 'POST',
    description: 'Stream a chat completion token-by-token via server-sent events.',
    pathTemplate: '/chat/completions',
    fields: { model: true, prompt: true },
    streaming: true,
  },
  {
    id: 'groqListModels',
    name: 'List Models',
    method: 'GET',
    description: 'List the models available through the Groq API.',
    pathTemplate: '/models',
    fields: {},
  },
  {
    id: 'groqGetModel',
    name: 'Get Model',
    method: 'GET',
    description: 'Get metadata for a single model.',
    pathTemplate: '/models/{model}',
    fields: { model: true },
  },
]

export function buildRequest(endpoint, form) {
  const path = endpoint.pathTemplate.replace('{model}', form.model.trim())
  const url = `${BASE_URL}${path}`

  if (endpoint.method === 'GET') {
    return { url, body: null }
  }

  const body = {
    model: form.model.trim(),
    messages: [{ role: 'user', content: form.prompt }],
  }
  if (endpoint.streaming) body.stream = true
  return { url, body }
}

export async function sendRequest(endpoint, form, apiKey) {
  const { url, body } = buildRequest(endpoint, form)
  const started = performance.now()
  const res = await fetch(url, {
    method: endpoint.method,
    headers: headers(apiKey),
    body: body ? JSON.stringify(body) : undefined,
  })
  const elapsed = Math.round(performance.now() - started)
  const data = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, statusText: res.statusText, data, elapsed }
}

// Streams SSE chunks; calls onChunk(parsedChunk) as each arrives.
export async function sendStreamingRequest(endpoint, form, apiKey, onChunk) {
  const { url, body } = buildRequest(endpoint, form)
  const started = performance.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    return {
      ok: false,
      status: res.status,
      statusText: res.statusText,
      data,
      elapsed: Math.round(performance.now() - started),
    }
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const chunks = []
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete line in buffer
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const parsed = JSON.parse(payload)
        chunks.push(parsed)
        onChunk(parsed)
      } catch {
        // ignore malformed chunk
      }
    }
  }

  return {
    ok: true,
    status: res.status,
    statusText: res.statusText,
    data: chunks,
    elapsed: Math.round(performance.now() - started),
  }
}

export function extractText(data) {
  if (!data) return ''
  const fromChoice = (d) => {
    const choice = d?.choices?.[0]
    return choice?.message?.content ?? choice?.delta?.content ?? ''
  }
  if (Array.isArray(data)) return data.map(fromChoice).join('')
  return fromChoice(data)
}
