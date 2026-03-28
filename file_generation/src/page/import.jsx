import { useState } from 'react';
import './import.css';

const baseUrl = import.meta.env.VITE_API_URL;

function ExcelIcon() {
  return (
    <svg className="import-page__drop-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8v-2z"
      />
    </svg>
  );
}

export default function Import() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', kind: '' });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function pickFile(list) {
    const next = list?.[0];
    setFile(next ?? null);
    if (next) setFeedback({ text: '', kind: '' });
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (loading) return;
    pickFile(e.dataTransfer?.files);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      setFeedback({ text: 'Please choose an Excel file first.', kind: 'error' });
      return;
    }

    setLoading(true);
    setFeedback({ text: '', kind: '' });

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const res = await fetch(`${baseUrl}/api/import/excel`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          text: data.message || 'Upload failed.',
          kind: 'error',
        });
        return;
      }

      setFeedback({
        text: data.message || 'Import successful.',
        kind: 'success',
      });
      setFile(null);
      e.target.reset();
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
        <p className="import-page__eyebrow">Data import</p>
        <h1 className="import-page__title">Import Excel</h1>
        <p className="import-page__hint">
          Upload a <code>.xlsx</code> or <code>.xls</code> file. Row 1 should be headers; data
          begins on row 2.
        </p>

        <form className="import-page__form" onSubmit={onSubmit}>
          <label
            className={`import-page__drop ${dragOver ? 'import-page__drop--active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!loading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              className="import-page__input"
              type="file"
              name="excelFile"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              disabled={loading}
              onChange={(e) => pickFile(e.target.files)}
            />
            <ExcelIcon />
            <p className="import-page__drop-text">Drop your file here or click to browse</p>
            <p className="import-page__drop-sub">Excel only — max size depends on your server</p>
            {file ? (
              <p className="import-page__file-name" title={file.name}>
                Selected: {file.name}
              </p>
            ) : null}
          </label>

          <div className="import-page__actions">
            <button className="import-page__btn" type="submit" disabled={loading || !file}>
              {loading ? (
                <span className="import-page__btn-inner">
                  <span className="import-page__btn-spinner" aria-hidden="true" />
                  <span>Uploading…</span>
                </span>
              ) : (
                'Upload to server'
              )}
            </button>
          </div>
        </form>

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
