import { ENDPOINTS, PROVIDERS } from '../lib/providers'

export default function Sidebar({ selectedId, onSelect }) {
  return (
    <nav className="sidebar">
      {Object.entries(PROVIDERS).map(([id, provider]) => (
        <div className="sidebar-group" key={id}>
          <p className="sidebar-title">{provider.label} Endpoints</p>
          <ul>
            {ENDPOINTS.filter((ep) => ep.provider === id).map((ep) => (
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
        </div>
      ))}
      <footer className="sidebar-footer">
        {Object.values(PROVIDERS).map((provider) => (
          <a key={provider.docsUrl} href={provider.docsUrl} target="_blank" rel="noreferrer">
            {provider.docsLabel}
          </a>
        ))}
      </footer>
    </nav>
  )
}
