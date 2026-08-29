import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { listAdminArchive, updateAdminArchive, deleteAdminArchive } from '../api/admin';
import type { ArchiveItem } from '../api/types';
import { ErrorNotice, LoadingState, EmptyState } from '../components/UIState';

const VERIFIED = 'VERIFIED';
const NOT_VERIFIED = 'DEMO / NOT VERIFIED';

function isVerified(status: string): boolean {
  return status.toUpperCase() === VERIFIED;
}

export function AdminDashboard() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    listAdminArchive()
      .then(setItems)
      .catch((err) => setError(err?.message || 'Failed to load documents.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const total = items.length;
    const verified = items.filter((i) => isVerified(i.verification_status)).length;
    return { total, verified, pending: total - verified };
  }, [items]);

  const toggleVerified = async (item: ArchiveItem) => {
    setBusyId(item.archive_id);
    setRowError(null);
    const next = isVerified(item.verification_status) ? NOT_VERIFIED : VERIFIED;
    try {
      const updated = await updateAdminArchive(item.archive_id, { verification_status: next });
      setItems((prev) => prev.map((i) => (i.archive_id === item.archive_id ? updated : i)));
    } catch (err: any) {
      setRowError({ id: item.archive_id, message: err?.message || 'Update failed.' });
    } finally {
      setBusyId('');
    }
  };

  const remove = async (item: ArchiveItem) => {
    const ok = window.confirm(
      `Delete "${item.title}" (${item.archive_id})?\n\nThis removes the document, its page chunks and its uploaded file. This cannot be undone.`
    );
    if (!ok) return;

    setBusyId(item.archive_id);
    setRowError(null);
    try {
      await deleteAdminArchive(item.archive_id);
      setItems((prev) => prev.filter((i) => i.archive_id !== item.archive_id));
    } catch (err: any) {
      setRowError({ id: item.archive_id, message: err?.message || 'Delete failed.' });
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Archive Management</p>
          <h1>Documents</h1>
        </div>
        <div className="admin-head-actions">
          <button className="button outline" onClick={load} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
          <Link className="button primary" to="/admin/upload">
            <Plus size={16} /> Add Document
          </Link>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{stats.total}</span>
          <span className="admin-stat-label">Total documents</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{stats.verified}</span>
          <span className="admin-stat-label">Verified</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{stats.pending}</span>
          <span className="admin-stat-label">Pending review</span>
        </div>
      </div>

      {error ? (
        <ErrorNotice message={error} onRetry={load} />
      ) : loading ? (
        <LoadingState message="Loading documents..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No documents yet"
          message="Upload the first archival document to get started."
          action={
            <Link className="button primary" to="/admin/upload">
              <Plus size={16} /> Add Document
            </Link>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Length</th>
                <th>Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const verified = isVerified(item.verification_status);
                const busy = busyId === item.archive_id;
                return (
                  <tr key={item.archive_id} className={busy ? 'row-busy' : ''}>
                    <td className="mono">{item.archive_id}</td>
                    <td>
                      <div className="admin-title-cell">
                        <span className="admin-doc-title">{item.title}</span>
                        <span className="admin-doc-author">{item.author_speaker}</span>
                      </div>
                      {rowError?.id === item.archive_id && (
                        <span className="row-error">{rowError.message}</span>
                      )}
                    </td>
                    <td>{item.type}</td>
                    <td className="mono">{item.date}</td>
                    <td className="mono">
                      {((item.extracted_text?.length ?? 0)).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-pill ${verified ? 'ok' : 'pending'}`}>
                        {verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                        {verified ? 'Verified' : 'Not verified'}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="admin-row-actions">
                        <button
                          className="icon-btn"
                          title={verified ? 'Mark not verified' : 'Mark verified'}
                          onClick={() => toggleVerified(item)}
                          disabled={busy}
                        >
                          {verified ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
                        </button>
                        <Link
                          className="icon-btn"
                          title="Edit metadata"
                          to={`/admin/archive/${encodeURIComponent(item.archive_id)}/edit`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <a
                          className="icon-btn"
                          title="Open in reader"
                          href={`/archive/${encodeURIComponent(item.archive_id)}/read`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <BookOpen size={15} />
                        </a>
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => remove(item)}
                          disabled={busy}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
