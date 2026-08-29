import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { listTimelineEvents } from '../api/timeline';
import type { TimelineEvent } from '../api/types';
import { ErrorNotice, LoadingState } from '../components/UIState';

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTimeline = () => {
    setLoading(true);
    setError('');
    listTimelineEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) setSelectedEvent(data[0]);
      })
      .catch((err) => setError(err.message || 'Failed to load timeline events.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  return (
    <div className="timeline-page">
      <section className="page-title">
        <p className="eyebrow">Historical Chronology</p>
        <h1>Ambedkar Chronology & Milestones</h1>
        <p>
          Follow the defining moments in Dr. B. R. Ambedkar’s life and intellectual journey. Select any event to inspect
          its historical context and access the archival documents written or delivered during that period.
        </p>
      </section>

      {error ? (
        <ErrorNotice message={error} onRetry={loadTimeline} />
      ) : loading ? (
        <LoadingState message="Loading historical timeline..." />
      ) : (
        <div className="timeline-layout">
          {/* Timeline List */}
          <div className="timeline-list-container">
            <ol className="timeline">
              {events.map((event) => {
                const isSelected = selectedEvent?.event_id === event.event_id;
                return (
                  <li key={event.event_id} className={`timeline-node ${isSelected ? 'selected' : ''}`}>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`timeline-btn ${isSelected ? 'active' : ''}`}
                    >
                      <time className="timeline-date">
                        <Calendar size={12} /> {event.date}
                      </time>
                      <span className="timeline-title">{event.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Selected Event Detail Panel */}
          <aside className="event-detail-panel">
            {selectedEvent ? (
              <div className="event-detail-content">
                <div className="event-detail-header">
                  <span className="event-date-badge">{selectedEvent.date}</span>
                  <span className="event-id-tag">Event ID: {selectedEvent.event_id}</span>
                </div>

                <h2 className="event-title">{selectedEvent.title}</h2>
                <p className="event-description">{selectedEvent.description}</p>

                {selectedEvent.related_archive_items && selectedEvent.related_archive_items.length > 0 && (
                  <div className="event-related-section">
                    <h3>Related Archival Material ({selectedEvent.related_archive_items.length})</h3>
                    <div className="related-items-list">
                      {selectedEvent.related_archive_items.map((item) => (
                        <Link
                          key={item.archive_id}
                          to={`/archive/${encodeURIComponent(item.archive_id)}`}
                          className="related-item-card"
                        >
                          <div className="related-item-info">
                            <span className="related-type-badge">{item.type}</span>
                            <strong>{item.title}</strong>
                            <small>ID: {item.archive_id} · {item.date}</small>
                          </div>
                          <ArrowRight size={16} className="related-arrow" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="event-panel-footer">
                  <Link
                    to={`/timeline/${encodeURIComponent(selectedEvent.event_id)}`}
                    className="button outline-light small"
                  >
                    View Dedicated Event Page <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="notice">Select a timeline event to view details.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

