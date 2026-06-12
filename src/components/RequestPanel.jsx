import { buildRequest, MODELS, EMBED_MODELS } from '../lib/gemini'

export default function RequestPanel({ endpoint, form, onChange, onSend, loading, apiKeySet }) {
  const set = (key) => (e) => onChange({ ...form, [key]: e.target.value })
  const { url, body } = buildRequest(endpoint, form)

  return (
    <section className="request-panel">
      <div className="endpoint-header">
        <h2>
          <span className={`method method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
          {endpoint.name}
        </h2>
        <p className="endpoint-desc">{endpoint.description}</p>
        <code className="endpoint-url">{url}</code>
      </div>

      {endpoint.fields.model && (
        <label className="field">
          <span>Model</span>
          <select value={form.model} onChange={set('model')}>
            {(endpoint.id === 'embedContent' ? EMBED_MODELS : MODELS).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      )}

      {endpoint.fields.prompt && (
        <label className="field">
          <span>{endpoint.id === 'embedContent' ? 'Text to embed' : 'Prompt'}</span>
          <textarea rows={5} value={form.prompt} onChange={set('prompt')} placeholder="Type your prompt here..." />
        </label>
      )}

      {body && (
        <details className="body-preview">
          <summary>Request body preview</summary>
          <pre>{JSON.stringify(body, null, 2)}</pre>
        </details>
      )}

      <div className="send-row">
        <button className="primary send" onClick={onSend} disabled={loading || !apiKeySet}>
          {loading ? 'Sending…' : 'Send Request'}
        </button>
        {!apiKeySet && <span className="hint">Save an API key above to send requests.</span>}
      </div>
    </section>
  )
}
