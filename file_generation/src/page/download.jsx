import { useState } from 'react';
import './import.css';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
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
  return fallback;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function FileBadgeIcon() {
  return (
    <svg className="import-page__drop-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
      />
    </svg>
  );
}

export default function Download() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', kind: '' });

  async function downloadPdf() {
    if (!name.trim()) {
      setFeedback({ text: 'Please enter your name for the PDF.', kind: 'error' });
      return;
    }
    setPdfLoading(true);
    setFeedback({ text: '', kind: '' });
    try {
      const res = await fetch(`${baseUrl}/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          text: data.message || 'Could not download the PDF.',
          kind: 'error',
        });
        return;
      }
      const blob = await res.blob();
      const filename = parseFilename(res.headers.get('Content-Disposition'), 'certificate.pdf');
      triggerDownload(blob, filename);
      setFeedback({ text: `PDF saved as ${filename}.`, kind: 'success' });
    } catch (err) {
      setFeedback({
        text: err.message || 'Could not reach the server.',
        kind: 'error',
      });
    } finally {
      setPdfLoading(false);
    }
  }

  async function downloadWord() {
    if (!name.trim() || !email.trim()) {
      setFeedback({
        text: 'Please enter name and email for the Word document.',
        kind: 'error',
      });
      return;
    }

    setWordLoading(true);
    setFeedback({ text: '', kind: '' });
    try {
      const res = await fetch(`${baseUrl}/api/export/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          text: data.message || 'Could not download the Word file.',
          kind: 'error',
        });
        return;
      }
      const blob = await res.blob();
      const filename = parseFilename(res.headers.get('Content-Disposition'), 'user.docx');
      triggerDownload(blob, filename);
      setFeedback({ text: `Word file saved as ${filename}.`, kind: 'success' });
    } catch (err) {
      setFeedback({
        text: err.message || 'Could not reach the server.',
        kind: 'error',
      });
    } finally {
      setWordLoading(false);
    }
  }

  const busy = pdfLoading || wordLoading;

  return (
    <main className="import-page">
      <div className="import-page__card">
        <p className="import-page__eyebrow">Downloads</p>
        <h1 className="import-page__title">Download files</h1>
        <p className="import-page__hint">
          Get the certificate as PDF, or a Word document (.docx) with the name and email you enter
          below.
        </p>

        <div
          className="import-page__drop"
          style={{ cursor: 'default', minHeight: 88, pointerEvents: 'none', marginBottom: 20 }}
        >
          <FileBadgeIcon />
          <p className="import-page__drop-text">PDF &amp; Word</p>
          <p className="import-page__drop-sub">Server generates both file types</p>
        </div>

        <div className="import-page__stack">
          <label className="import-page__label" htmlFor="download-name">
            <span>Name</span>
            <input
              id="download-name"
              className="import-page__text-input"
              type="text"
              autoComplete="name"
              value={name}
              disabled={busy}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohit Kumar"
            />
          </label>
          <label className="import-page__label" htmlFor="download-email">
            <span>Email (for Word)</span>
            <input
              id="download-email"
              className="import-page__text-input"
              type="email"
              autoComplete="email"
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
        </div>

        <div className="import-page__btn-row">
          <button
            className="import-page__btn"
            type="button"
            onClick={downloadPdf}
            disabled={busy}
          >
            {pdfLoading ? (
              <span className="import-page__btn-inner">
                <span className="import-page__btn-spinner" aria-hidden="true" />
                <span>PDF…</span>
              </span>
            ) : (
              'Download PDF'
            )}
          </button>
          <button
            className="import-page__btn import-page__btn--outline"
            type="button"
            onClick={downloadWord}
            disabled={busy}
          >
            {wordLoading ? (
              <span className="import-page__btn-inner">
                <span className="import-page__btn-spinner import-page__btn-spinner--outline" aria-hidden="true" />
                <span>Word…</span>
              </span>
            ) : (
              'Download Word'
            )}
          </button>
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
