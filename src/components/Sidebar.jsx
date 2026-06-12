import { ENDPOINTS } from '../lib/gemini'

export default function Sidebar({ selectedId, onSelect }) {
  return (
    <nav className="sidebar">
      <p className="sidebar-title">Endpoints</p>
      <ul>
        {ENDPOINTS.map((ep) => (
          <li key={ep.id}>
            <button
              className={`endpoint-item ${ep.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(ep.id)}
            >
              <span className={`method method-${ep.method.toLowerCase()}`}>{ep.method}</span>
              <span className="endpoint-name">{ep.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <footer className="sidebar-footer">
        <a href="https://ai.google.dev/api" target="_blank" rel="noreferrer">
          Gemini API docs ↗
        </a>
      </footer>
    </nav>
  )
}
