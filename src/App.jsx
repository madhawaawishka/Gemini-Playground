import { useState } from 'react'
import ApiKeyBar from './components/ApiKeyBar'
import Sidebar from './components/Sidebar'
import RequestPanel from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import {
  ENDPOINTS,
  PROVIDERS,
  sendRequest,
  sendStreamingRequest,
  extractText,
} from './lib/providers'
import './App.css'
import { disableAutoTracking, enableAutoTracking } from 'tokentab/auto'

// Importing tokentab/auto patches fetch with the built-in hosts (OpenAI,
// Anthropic, Gemini). Re-enable with Groq's host mapped to the bundled
// OpenAI-compatible adapter so Groq calls are tracked too.
disableAutoTracking()
enableAutoTracking({ hosts: { 'api.groq.com': 'openai-compatible' } })

function defaultForm(endpoint) {
  return {
    model: endpoint.defaultModel,
    prompt: '',
  }
}

export default function App() {
  const [keys, setKeys] = useState(() =>
    Object.fromEntries(
      Object.entries(PROVIDERS).map(([id, p]) => [id, localStorage.getItem(p.storageKey) ?? '']),
    ),
  )
  const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id)
  const endpoint = ENDPOINTS.find((ep) => ep.id === selectedId)

  // per-endpoint form state so switching endpoints keeps your inputs
  const [forms, setForms] = useState(() =>
    Object.fromEntries(ENDPOINTS.map((ep) => [ep.id, defaultForm(ep)])),
  )
  const [results, setResults] = useState({})
  const [streamText, setStreamText] = useState('')
  const [loading, setLoading] = useState(false)

  const form = forms[selectedId]
  const response = results[selectedId]
  const apiKey = keys[endpoint.provider]

  const saveKey = (provider, key) => {
    setKeys((k) => ({ ...k, [provider]: key }))
    localStorage.setItem(PROVIDERS[provider].storageKey, key)
  }

  const clearKey = (provider) => {
    setKeys((k) => ({ ...k, [provider]: '' }))
    localStorage.removeItem(PROVIDERS[provider].storageKey)
  }

  const updateForm = (next) => setForms((f) => ({ ...f, [selectedId]: next }))
  const setResult = (id, res) => setResults((r) => ({ ...r, [id]: res }))

  const send = async () => {
    setLoading(true)
    setStreamText('')
    setResult(selectedId, null)
    try {
      let res
      if (endpoint.streaming) {
        let acc = ''
        res = await sendStreamingRequest(endpoint, form, apiKey, (chunk) => {
          acc += extractText(endpoint, chunk)
          setStreamText(acc)
        })
      } else {
        res = await sendRequest(endpoint, form, apiKey)
      }
      setResult(selectedId, res)
    } catch (err) {
      setResult(selectedId, {
        ok: false,
        status: 0,
        statusText: 'Network error',
        data: { error: String(err) },
        elapsed: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <ApiKeyBar keys={keys} onSave={saveKey} onClear={clearKey} />
      <div className="layout">
        <Sidebar
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id)
            setStreamText('')
          }}
        />
        <main className="main">
          <RequestPanel
            endpoint={endpoint}
            form={form}
            onChange={updateForm}
            onSend={send}
            loading={loading}
            apiKeySet={apiKey !== ''}
          />
          <ResponsePanel
            endpoint={endpoint}
            response={response}
            streamText={endpoint.streaming ? streamText : ''}
            loading={loading}
          />
        </main>
      </div>
    </div>
  )
}
