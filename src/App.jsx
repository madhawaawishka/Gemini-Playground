import { useState } from 'react'
import ApiKeyBar from './components/ApiKeyBar'
import Sidebar from './components/Sidebar'
import RequestPanel from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import {
  ENDPOINTS,
  DEFAULT_MODEL,
  sendRequest,
  sendStreamingRequest,
  extractText,
} from './lib/gemini'
import './App.css'

const STORAGE_KEY = 'gemini-portal-api-key'

function defaultForm(endpoint) {
  return {
    model: endpoint.defaultModel ?? DEFAULT_MODEL,
    prompt: '',
  }
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
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

  const saveKey = (key) => {
    setApiKey(key)
    localStorage.setItem(STORAGE_KEY, key)
  }

  const clearKey = () => {
    setApiKey('')
    localStorage.removeItem(STORAGE_KEY)
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
          acc += extractText(chunk)
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
      <ApiKeyBar apiKey={apiKey} onSave={saveKey} onClear={clearKey} />
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
            response={response}
            streamText={endpoint.streaming ? streamText : ''}
            loading={loading}
          />
        </main>
      </div>
    </div>
  )
}
