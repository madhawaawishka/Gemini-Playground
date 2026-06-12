const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]
export const EMBED_MODELS = ['text-embedding-004', 'gemini-embedding-001']

export const DEFAULT_MODEL = MODELS[0]
export const DEFAULT_EMBED_MODEL = EMBED_MODELS[0]

function headers(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  }
}

function buildContents(prompt) {
  return [{ role: 'user', parts: [{ text: prompt }] }]
}

export const ENDPOINTS = [
  {
    id: 'generateContent',
    name: 'Generate Content',
    method: 'POST',
    description: 'Generate a model response for a text prompt.',
    pathTemplate: '/models/{model}:generateContent',
    fields: { model: true, prompt: true },
  },
  {
    id: 'streamGenerateContent',
    name: 'Stream Generate Content',
    method: 'POST',
    description: 'Stream a model response token-by-token via server-sent events.',
    pathTemplate: '/models/{model}:streamGenerateContent',
    fields: { model: true, prompt: true },
    streaming: true,
  },
  {
    id: 'countTokens',
    name: 'Count Tokens',
    method: 'POST',
    description: 'Count the number of tokens in a prompt.',
    pathTemplate: '/models/{model}:countTokens',
    fields: { model: true, prompt: true },
  },
  {
    id: 'embedContent',
    name: 'Embed Content',
    method: 'POST',
    description: 'Generate an embedding vector for a piece of text.',
    pathTemplate: '/models/{model}:embedContent',
    fields: { model: true, prompt: true },
    defaultModel: DEFAULT_EMBED_MODEL,
  },
  {
    id: 'listModels',
    name: 'List Models',
    method: 'GET',
    description: 'List the models available through the API.',
    pathTemplate: '/models',
    fields: {},
  },
  {
    id: 'getModel',
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

  let body
  switch (endpoint.id) {
    case 'generateContent':
    case 'streamGenerateContent':
      body = { contents: buildContents(form.prompt) }
      break
    case 'countTokens':
      body = { contents: buildContents(form.prompt) }
      break
    case 'embedContent':
      body = { content: { parts: [{ text: form.prompt }] } }
      break
    default:
      body = {}
  }
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
  const res = await fetch(`${url}?alt=sse`, {
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
      if (!payload) continue
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
  const fromCandidate = (d) =>
    d?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (Array.isArray(data)) return data.map(fromCandidate).join('')
  return fromCandidate(data)
}
