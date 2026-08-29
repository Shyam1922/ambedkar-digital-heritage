import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, ExternalLink, Globe, MessageCircle, ShieldCheck, Tag, User } from 'lucide-react';
import { getArchiveItem } from '../api/archive';
import type { ArchiveItem } from '../api/types';
import { ErrorNotice, LoadingState } from '../components/UIState';

export function ArchiveDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const [item, setItem] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItem = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    getArchiveItem(id)
      .then((data) => setItem(data))
      .catch((err) => setError(err.message || 'Archival document not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading archival document metadata..." />;
  }

  if (error || !item) {
    return (
      <div className="detail-error-container">
        <Link className="back-link" to="/archive">
          <ArrowLeft size={16} /> Back to Archive Explorer
        </Link>
        <ErrorNotice message={error || 'Document not found'} onRetry={loadItem} />
      </div>
    );
  }

  return (
    <div className="archive-detail-page">
      <Link className="back-link" to="/archive">
        <ArrowLeft size={16} /> Back to Archive Explorer
      </Link>

      <div className="detail-header">
        <div className="detail-header-tags">
          <span className="badge large">{item.type}</span>
          <span className="archive-id-badge">ID: {item.archive_id}</span>
          {item.verification_status && (
            <span className="verification-pill">
              <ShieldCheck size={14} /> {item.verification_status}
            </span>
          )}
        </div>

        <h1 className="detail-title">{item.title}</h1>
        <p className="detail-lede">{item.description}</p>
      </div>

      <div className="detail-layout">
        {/* Main Content Info */}
        <div className="detail-main">
          {item.short_summary && (
            <div className="detail-section">
              <h3 className="section-title">Overview & Summary</h3>
              <p className="summary-text">{item.short_summary}</p>
            </div>
          )}

          <div className="detail-section">
            <h3 className="section-title">Subject & Thematic Tags</h3>
            <div className="detail-tag-list">
              {item.tags && item.tags.length > 0 ? (
                item.tags.map((tag) => (
                  <span key={tag} className="tag-pill-large">
                    <Tag size={13} /> {tag}
                  </span>
                ))
              ) : (
                <span className="text-muted">No specific tags recorded.</span>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Actions & Research Tools</h3>
            <div className="action-buttons-grid">
              <Link to={`/archive/${encodeURIComponent(item.archive_id)}/read`} className="action-card reader-card">
                <div className="action-card-icon"><BookOpen size={24} /></div>
                <div className="action-card-text">
                  <h4>Read Extracted Document</h4>
                  <p>Open page-by-page reader with transcript and verified page numbers.</p>
                </div>
              </Link>

              <Link to={`/research?document=${encodeURIComponent(item.archive_id)}`} className="action-card ai-card">
                <div className="action-card-icon"><MessageCircle size={24} /></div>
                <div className="action-card-text">
                  <h4>Ask AI About This Document</h4>
                  <p>Query specific arguments, citations, and quotes within this text.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <aside className="detail-sidebar">
          <div className="metadata-card">
            <h3>Document Metadata</h3>
            <dl className="meta-list">
              <div>
                <dt><Calendar size={14} /> Date of Creation / Delivery</dt>
                <dd>{item.date || 'Unknown'}</dd>
              </div>

              <div>
                <dt><User size={14} /> Author / Speaker</dt>
                <dd>{item.author_speaker || 'Dr. B. R. Ambedkar'}</dd>
              </div>

              <div>
                <dt><Globe size={14} /> Language</dt>
                <dd>{item.language || 'English'}</dd>
              </div>

              <div>
                <dt><BookOpen size={14} /> Source Collection</dt>
                <dd>
                  {item.source_url ? (
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="source-external-link">
                      {item.source} <ExternalLink size={12} />
                    </a>
                  ) : (
                    item.source || 'Public Archival Collection'
                  )}
                </dd>
              </div>

              {item.source_url && (
                <div>
                  <dt><ExternalLink size={14} /> Source Web Repository</dt>
                  <dd>
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="source-url-text">
                      {item.source_url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
