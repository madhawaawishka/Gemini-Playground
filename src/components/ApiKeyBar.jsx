import { useState } from 'react'
import { PROVIDERS } from '../lib/providers'

function KeyRow({ label, placeholder, apiKey, onSave, onClear }) {
  const [draft, setDraft] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const saved = apiKey !== '' && draft === apiKey

  return (
    <div className="key-controls">
      <span className="key-provider">{label}</span>
      <div className="key-input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          className="ghost"
          title={visible ? 'Hide key' : 'Show key'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
      <button className="primary" disabled={!draft.trim() || saved} onClick={() => onSave(draft.trim())}>
        {saved ? 'Saved ✓' : 'Save Key'}
      </button>
      {apiKey && (
        <button
          className="ghost"
          onClick={() => {
            setDraft('')
            onClear()
          }}
        >
          Clear
        </button>
      )}
      <span className={`key-status ${apiKey ? 'ok' : 'missing'}`}>
        {apiKey ? '● Key set' : '○ No key'}
      </span>
    </div>
  )
}

export default function ApiKeyBar({ keys, onSave, onClear }) {
  return (
    <header className="api-key-bar">
      <div className="brand">
        <span className="brand-icon">✦</span>
        <h1>LLM API Portal</h1>
      </div>
      <div className="key-groups">
        {Object.entries(PROVIDERS).map(([id, provider]) => (
          <KeyRow
            key={id}
            label={provider.label}
            placeholder={provider.keyPlaceholder}
            apiKey={keys[id]}
            onSave={(k) => onSave(id, k)}
            onClear={() => onClear(id)}
          />
        ))}
      </div>
    </header>
  )
}
