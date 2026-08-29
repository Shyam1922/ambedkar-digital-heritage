import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { getAdminArchiveItem, updateAdminArchive } from '../api/admin';
import type { AdminArchiveUpdate, ArchiveItem } from '../api/types';
import { ErrorNotice, LoadingState } from '../components/UIState';

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

interface EditState {
  title: string;
  description: string;
  type: string;
  date: string;
  author_speaker: string;
  language: string;
  source: string;
  source_url: string;
  tags: string;
  verification_status: string;
}

function toState(item: ArchiveItem): EditState {
  return {
    title: item.title,
    description: item.description,
    type: item.type,
    date: item.date,
    author_speaker: item.author_speaker,
    language: item.language,
    source: item.source,
    source_url: item.source_url,
    tags: item.tags.join(', '),
    verification_status: item.verification_status,
  };
}

export function AdminEdit() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ArchiveItem | null>(null);
  const [form, setForm] = useState<EditState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError('');
    getAdminArchiveItem(id)
      .then((data) => {
        setItem(data);
        setForm(toState(data));
      })
      .catch((err) => setLoadError(err?.message || 'Failed to load document.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const set = (key: keyof EditState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setSaved(false);
    setForm((f) => (f ? { ...f, [key]: e.target.value } : f));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !item) return;

    // Only send changed fields.
    const original = toState(item);
    const changes: AdminArchiveUpdate = {};
    (Object.keys(form) as (keyof EditState)[]).forEach((key) => {
      if (form[key] !== original[key]) changes[key] = form[key].trim();
    });

    if (Object.keys(changes).length === 0) {
      setSaveError('No changes to save.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateAdminArchive(item.archive_id, changes);
      setItem(updated);
      setForm(toState(updated));
      setSaved(true);
    } catch (err: any) {
      setSaveError(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading document..." />;
  if (loadError || !item || !form) {
    return (
      <div className="admin-page">
        <Link className="back-link" to="/admin">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <ErrorNotice message={loadError || 'Document not found.'} onRetry={load} />
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
          <p className="eyebrow">Edit metadata · {item.archive_id}</p>
          <h1>{item.title}</h1>
        </div>
        <a
          className="button outline"
          href={`/archive/${encodeURIComponent(item.archive_id)}/read`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen size={15} /> Open reader
        </a>
      </div>

      <div className="admin-readonly-strip">
        <div>
          <span className="admin-stat-label">Extracted text</span>
          <span className="admin-stat-value sm">{(item.extracted_text?.length ?? 0).toLocaleString()} chars</span>
        </div>
        <div>
          <span className="admin-stat-label">Kiosk summary</span>
          <span className="admin-stat-value sm">{(item.short_summary?.length ?? 0).toLocaleString()} chars</span>
        </div>
        <p className="admin-readonly-note">
          Document body and page chunks are set during ingestion and are not edited here. Re-upload to
          replace the source file.
        </p>
      </div>

      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label className="field span-2">
            <span className="field-label">Title</span>
            <input value={form.title} onChange={set('title')} required />
          </label>

          <label className="field span-2">
            <span className="field-label">Description</span>
            <textarea value={form.description} onChange={set('description')} rows={2} />
          </label>

          <label className="field">
            <span className="field-label">Material type</span>
            <select value={form.type} onChange={set('type')}>
              {(MATERIAL_TYPES.includes(form.type) ? MATERIAL_TYPES : [form.type, ...MATERIAL_TYPES]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Date</span>
            <input value={form.date} onChange={set('date')} />
          </label>

          <label className="field">
            <span className="field-label">Author / speaker</span>
            <input value={form.author_speaker} onChange={set('author_speaker')} />
          </label>

          <label className="field">
            <span className="field-label">Language</span>
            <input value={form.language} onChange={set('language')} />
          </label>

          <label className="field">
            <span className="field-label">Source</span>
            <input value={form.source} onChange={set('source')} />
          </label>

          <label className="field">
            <span className="field-label">Source URL</span>
            <input value={form.source_url} onChange={set('source_url')} />
          </label>

          <label className="field span-2">
            <span className="field-label">Tags</span>
            <input value={form.tags} onChange={set('tags')} placeholder="comma, separated, tags" />
          </label>

          <label className="field span-2">
            <span className="field-label">Verification status</span>
            <input
              value={form.verification_status}
              onChange={set('verification_status')}
              placeholder="VERIFIED or DEMO / NOT VERIFIED"
              list="verification-options"
            />
            <datalist id="verification-options">
              <option value="VERIFIED" />
              <option value="DEMO / NOT VERIFIED" />
            </datalist>
          </label>
        </div>

        {saveError && <div className="notice error compact">{saveError}</div>}
        {saved && <div className="notice success compact">Changes saved.</div>}

        <div className="admin-form-actions">
          <button type="submit" className="button primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="button ghost" onClick={() => navigate('/admin')}>
            Done
          </button>
        </div>
      </form>
    </div>
  );
}
