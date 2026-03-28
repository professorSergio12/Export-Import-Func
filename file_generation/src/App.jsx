import { useState } from 'react'
import './App.css'
import Import from './page/import.jsx'
import ExportExcel from './page/exportExcel.jsx'

function App() {
  const [tab, setTab] = useState('import')

  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Pages">
        <button
          type="button"
          className="app-nav__btn"
          aria-current={tab === 'import' ? 'page' : undefined}
          onClick={() => setTab('import')}
        >
          Import
        </button>
        <button
          type="button"
          className="app-nav__btn"
          aria-current={tab === 'export' ? 'page' : undefined}
          onClick={() => setTab('export')}
        >
          Export
        </button>
      </nav>
      {tab === 'import' ? <Import /> : <ExportExcel />}
    </div>
  )
}

export default App
