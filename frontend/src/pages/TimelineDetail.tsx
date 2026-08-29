import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { getTimelineEvent } from '../api/timeline';
import type { TimelineEvent } from '../api/types';
import { ArchiveCard } from '../components/ArchiveCard';
import { ErrorNotice, LoadingState } from '../components/UIState';

export function TimelineDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const [event, setEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvent = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    getTimelineEvent(id)
      .then(setEvent)
      .catch((err) => setError(err.message || 'Timeline event not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading timeline event details..." />;
  }

  if (error || !event) {
    return (
      <div className="detail-error-container">
        <Link className="back-link" to="/timeline">
          <ArrowLeft size={16} /> Back to Timeline
        </Link>
        <ErrorNotice message={error || 'Event not found'} onRetry={loadEvent} />
      </div>
    );
  }

  return (
    <div className="timeline-detail-page">
      <Link className="back-link" to="/timeline">
        <ArrowLeft size={16} /> Back to Historical Timeline
      </Link>

      <article className="timeline-detail-card">
        <div className="timeline-detail-meta">
          <span className="event-date-badge large">
            <Calendar size={14} /> {event.date}
          </span>
          <span className="event-id-tag">ID: {event.event_id}</span>
          {event.verification_status && (
            <span className="verification-pill">
              <ShieldCheck size={14} /> {event.verification_status}
            </span>
          )}
        </div>

        <h1 className="timeline-detail-title">{event.title}</h1>
        <p className="timeline-detail-desc">{event.description}</p>
      </article>

      <section className="timeline-related-documents">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Primary Sources</p>
            <h2>Connected Archival Documents ({event.related_archive_items?.length || 0})</h2>
          </div>
          <Link to="/archive" className="view-all-link">
            Explore All Documents <ArrowRight size={15} />
          </Link>
        </div>

        {event.related_archive_items && event.related_archive_items.length > 0 ? (
          <div className="grid">
            {event.related_archive_items.map((item) => (
              <ArchiveCard key={item.archive_id} item={item} />
            ))}
          </div>
        ) : (
          <p className="notice">No primary source documents linked to this specific milestone yet.</p>
        )}
      </section>
    </div>
  );
}
