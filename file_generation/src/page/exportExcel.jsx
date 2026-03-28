import { useState } from 'react';
import './import.css';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function parseFilename(contentDisposition) {
  if (!contentDisposition) return 'Stocks.xlsx';
  const utf = /filename\*=UTF-8''([^;\n]+)/i.exec(contentDisposition);
  if (utf) {
    try {
      return decodeURIComponent(utf[1].trim());
    } catch {
      return utf[1].trim();
    }
  }
  const ascii = /filename=(?:"([^"]+)"|([^;\n]+))/i.exec(contentDisposition);
  if (ascii) return (ascii[1] || ascii[2] || '').trim();
  return 'Stocks.xlsx';
}

function DownloadIcon() {
  return (
    <svg className="import-page__drop-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
      />
    </svg>
  );
}

export default function ExportExcel() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', kind: '' });

  async function downloadExcel() {
    setLoading(true);
    setFeedback({ text: '', kind: '' });

    try {
      const res = await fetch(`${baseUrl}/api/export/excel`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          text: data.message || 'Could not export the file.',
          kind: 'error',
        });
        return;
      }

      const blob = await res.blob();
      const name = parseFilename(res.headers.get('Content-Disposition'));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = name;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setFeedback({
        text: `Saved as ${name}.`,
        kind: 'success',
      });
    } catch (err) {
      setFeedback({
        text: err.message || 'Could not reach the server.',
        kind: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="import-page">
      <div className="import-page__card">
        <p className="import-page__eyebrow">Data export</p>
        <h1 className="import-page__title">Export Excel</h1>
        <p className="import-page__hint">
          Download every row from the database as an Excel file. Columns match your import: MKT,
          SERIES, SYMBOL, SECURITY, CLOSE_PRICE, DATE, ISIN.
        </p>

        <div className="import-page__form">
          <div
            className="import-page__drop"
            style={{ cursor: 'default', minHeight: 100, pointerEvents: 'none' }}
          >
            <DownloadIcon />
            <p className="import-page__drop-text">Ready when you are</p>
            <p className="import-page__drop-sub">File name comes from the server (usually Stocks.xlsx)</p>
          </div>

          <div className="import-page__actions">
            <button
              className="import-page__btn"
              type="button"
              onClick={downloadExcel}
              disabled={loading}
            >
              {loading ? (
                <span className="import-page__btn-inner">
                  <span className="import-page__btn-spinner" aria-hidden="true" />
                  <span>Preparing…</span>
                </span>
              ) : (
                'Download Excel'
              )}
            </button>
          </div>
        </div>

        {feedback.text ? (
          <output
            className={`import-page__feedback import-page__feedback--${feedback.kind}`}
            aria-live="polite"
          >
            {feedback.text}
          </output>
        ) : null}
      </div>
    </main>
  );
}
