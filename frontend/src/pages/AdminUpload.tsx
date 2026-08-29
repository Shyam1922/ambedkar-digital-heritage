import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle2, FileText } from 'lucide-react';
import { createAdminArchive } from '../api/admin';
import type { ArchiveItem } from '../api/types';

const MATERIAL_TYPES = [
  'Writing',
  'Speech',
  'Constitutional Debate',
  'Constitutional Document',
  'Book',
  'Article',
  'Manuscript',
  'Other',
];

interface FormState {
  archive_id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  author_speaker: string;
  language: string;
  source: string;
  source_url: string;
  tags: string;
  content_start_page: string;
}

const EMPTY: FormState = {
  archive_id: '',
  title: '',
  description: '',
  type: 'Writing',
  date: '',
  author_speaker: 'B. R. Ambedkar',
  language: 'English',
  source: '',
  source_url: '',
  tags: '',
  content_start_page: '1',
};

export function AdminUpload() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<ArchiveItem | null>(null);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please choose a PDF or TXT file to ingest.');
      return;
    }

    setSubmitting(true);
    try {
      const item = await createAdminArchive({
        archive_id: form.archive_id.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        date: form.date.trim(),
        author_speaker: form.author_speaker.trim(),
        language: form.language.trim() || 'English',
        source: form.source.trim(),
        source_url: form.source_url.trim(),
        tags: form.tags.trim(),
        content_start_page: Number(form.content_start_page) || 1,
        file,
      });
      setCreated(item);
    } catch (err: any) {
      setError(err?.message || 'Ingestion failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setFile(null);
    setCreated(null);
    setError('');
  };

  if (created) {
    return (
      <div className="admin-page">
        <div className="admin-success-card">
          <CheckCircle2 size={40} className="admin-success-icon" />
          <h1>Document ingested</h1>
          <p>
            <strong>{created.title}</strong> ({created.archive_id}) was extracted and stored.
          </p>
          <div className="admin-success-stats">
            <div>
              <span className="admin-stat-value">
                {(created.extracted_text?.length ?? 0).toLocaleString()}
              </span>
              <span className="admin-stat-label">Characters extracted</span>
            </div>
            <div>
              <span className="admin-stat-value">
                {(created.short_summary?.length ?? 0).toLocaleString()}
              </span>
              <span className="admin-stat-label">Summary characters</span>
            </div>
          </div>
          <div className="admin-success-actions">
            <button className="button primary" onClick={reset}>
              <UploadCloud size={16} /> Add another
            </button>
            <a
              className="button outline"
              href={`/archive/${encodeURIComponent(created.archive_id)}/read`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={15} /> Open in reader
            </a>
            <button className="button ghost" onClick={() => navigate('/admin')}>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Link className="back-link" to="/admin">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Ingestion</p>
          <h1>Add archival document</h1>
          <p className="admin-head-sub">
            Upload a PDF or TXT. The server extracts the full text, splits it into page chunks and
            generates a kiosk summary automatically.
          </p>
        </div>
      </div>

      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label className="field">
            <span className="field-label">Archive ID *</span>
            <input value={form.archive_id} onChange={set('archive_id')} placeholder="A-011" required />
          </label>

          <label className="field">
            <span className="field-label">Material type *</span>
            <select value={form.type} onChange={set('type')}>
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="field span-2">
            <span className="field-label">Title *</span>
            <input value={form.title} onChange={set('title')} placeholder="Document title" required />
          </label>

          <label className="field span-2">
            <span className="field-label">Description *</span>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Short description of the document"
              rows={2}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Date *</span>
            <input value={form.date} onChange={set('date')} placeholder="1936 or 1949-11-26" required />
          </label>

          <label className="field">
            <span className="field-label">Author / speaker *</span>
            <input value={form.author_speaker} onChange={set('author_speaker')} required />
          </label>

          <label className="field">
            <span className="field-label">Language</span>
            <input value={form.language} onChange={set('language')} placeholder="English" />
          </label>

          <label className="field">
            <span className="field-label">Content start page</span>
            <input
              type="number"
              min={1}
              value={form.content_start_page}
              onChange={set('content_start_page')}
            />
          </label>

          <label className="field">
            <span className="field-label">Source *</span>
            <input value={form.source} onChange={set('source')} placeholder="Institution / collection" required />
          </label>

          <label className="field">
            <span className="field-label">Source URL</span>
            <input value={form.source_url} onChange={set('source_url')} placeholder="https://..." />
          </label>

          <label className="field span-2">
            <span className="field-label">Tags</span>
            <input value={form.tags} onChange={set('tags')} placeholder="comma, separated, tags" />
          </label>

          <label className="field span-2">
            <span className="field-label">Document file (PDF or TXT) *</span>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            {file && <span className="field-hint">{file.name} · {(file.size / 1024).toFixed(0)} KB</span>}
          </label>
        </div>

        {error && <div className="notice error compact">{error}</div>}

        <div className="admin-form-actions">
          <button type="submit" className="button primary" disabled={submitting}>
            <UploadCloud size={16} /> {submitting ? 'Ingesting…' : 'Ingest document'}
          </button>
          <Link to="/admin" className="button ghost">
            Cancel
          </Link>
        </div>
        {submitting && (
          <p className="admin-form-note">Extracting and chunking — large PDFs may take a moment.</p>
        )}
      </form>
    </div>
  );
}
