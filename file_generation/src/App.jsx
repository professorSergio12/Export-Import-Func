import { useState } from 'react'
import './App.css'
import Import from './page/import.jsx'
import ExportExcel from './page/exportExcel.jsx'
import Download from './page/download.jsx'

function App() {
  const [tab, setTab] = useState('import')

  let page = <Download />
  if (tab === 'import') page = <Import />
  if (tab === 'export') page = <ExportExcel />

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
        <button
          type="button"
          className="app-nav__btn"
          aria-current={tab === 'download' ? 'page' : undefined}
          onClick={() => setTab('download')}
        >
          Download
        </button>
      </nav>

      {page}
    </div>
  )
}

export default App
