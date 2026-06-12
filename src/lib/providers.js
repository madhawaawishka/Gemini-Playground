import * as gemini from './gemini'
import * as groq from './groq'

export const PROVIDERS = {
  gemini: {
    label: 'Gemini',
    keyPlaceholder: 'Paste your Gemini API key (AIza...)',
    docsUrl: 'https://ai.google.dev/api',
    docsLabel: 'Gemini API docs ↗',
    storageKey: 'gemini-portal-api-key',
  },
  groq: {
    label: 'Groq',
    keyPlaceholder: 'Paste your Groq API key (gsk_...)',
    docsUrl: 'https://console.groq.com/docs/api-reference',
    docsLabel: 'Groq API docs ↗',
    storageKey: 'groq-portal-api-key',
  },
}

const LIBS = { gemini, groq }

export const ENDPOINTS = [
  ...gemini.ENDPOINTS.map((ep) => ({
    ...ep,
    provider: 'gemini',
    models: ep.id === 'embedContent' ? gemini.EMBED_MODELS : gemini.MODELS,
    defaultModel: ep.defaultModel ?? gemini.DEFAULT_MODEL,
  })),
  ...groq.ENDPOINTS.map((ep) => ({
    ...ep,
    provider: 'groq',
    models: groq.MODELS,
    defaultModel: ep.defaultModel ?? groq.DEFAULT_MODEL,
  })),
]

export const buildRequest = (endpoint, form) => LIBS[endpoint.provider].buildRequest(endpoint, form)

export const sendRequest = (endpoint, form, apiKey) =>
  LIBS[endpoint.provider].sendRequest(endpoint, form, apiKey)

export const sendStreamingRequest = (endpoint, form, apiKey, onChunk) =>
  LIBS[endpoint.provider].sendStreamingRequest(endpoint, form, apiKey, onChunk)

export const extractText = (endpoint, data) => LIBS[endpoint.provider].extractText(data)
