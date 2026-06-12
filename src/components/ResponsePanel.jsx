import { useState } from 'react'
import { extractText } from '../lib/gemini'

export default function ResponsePanel({ response, streamText, loading }) {
  const [tab, setTab] = useState('text')

  if (!response && !streamText && !loading) {
    return (
      <section className="response-panel empty">
        <p>Send a request to see the response here.</p>
      </section>
    )
  }

  const text = streamText || extractText(response?.data)
  const hasText = text.length > 0
  const activeTab = hasText ? tab : 'json'

  return (
    <section className="response-panel">
      <div className="response-meta">
        {response ? (
          <>
            <span className={`status-pill ${response.ok ? 'ok' : 'err'}`}>
              {response.status} {response.statusText}
            </span>
            <span className="elapsed">{response.elapsed} ms</span>
          </>
        ) : (
          <span className="status-pill streaming">streaming…</span>
        )}
        {hasText && (
          <div className="tabs">
            <button className={activeTab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>
              Text
            </button>
            <button className={activeTab === 'json' ? 'active' : ''} onClick={() => setTab('json')}>
              Raw JSON
            </button>
          </div>
        )}
      </div>

      {activeTab === 'text' && hasText ? (
        <pre className="response-text">{text}</pre>
      ) : (
        <pre className="response-json">
          {response?.data != null ? JSON.stringify(response.data, null, 2) : streamText}
        </pre>
      )}
    </section>
  )
}
