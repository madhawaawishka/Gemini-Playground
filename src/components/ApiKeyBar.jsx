import { useState } from 'react'

export default function ApiKeyBar({ apiKey, onSave, onClear }) {
  const [draft, setDraft] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const saved = apiKey !== '' && draft === apiKey

  return (
    <header className="api-key-bar">
      <div className="brand">
        <span className="brand-icon">✦</span>
        <h1>Gemini API Portal</h1>
      </div>
      <div className="key-controls">
        <div className="key-input-wrap">
          <input
            type={visible ? 'text' : 'password'}
            placeholder="Paste your Gemini API key (AIza...)"
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
    </header>
  )
}
