import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { getTimelineEvent } from '../api/timeline';
import type { TimelineEvent } from '../api/types';

const PORTRAIT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDqbt5LK8Pqa1Wo5y2bf2Q6k7XC2uWtxrfjiBLlIyxMwExe_w0JhYwwB61yt0hm2rRGTgiYxN0yR1a40YrWNgsw4V4at3ym7jZy-OaIiwR7Jm2rMsolE1F2eMXih4ae4d-5QK5uykUkD_wSKkMLnSrIbrfGIA2vdXr77H5TXfizfBJpMl9gWoG5cxkl-us7T0aSvF2LR1U-ujpb_V5Fh9BKhqR4R0ncysHvr2snRKEc4QBemSbLFwp';
const fallback: TimelineEvent = { event_id: '1891-birth', date: '1891', title: 'Birth in Mhow', description: 'Bhimrao Ramji Ambedkar was born on 14 April 1891 in Mhow. His early encounters with exclusion shaped a lifelong commitment to education, civic equality, and the transformation of Indian society.', image: PORTRAIT, verification_status: 'Verified', related_archive_items: [] };

export function TimelineDetail() {
  const { id = fallback.event_id } = useParams();
  const [event, setEvent] = useState<TimelineEvent>(fallback);
  useEffect(() => { getTimelineEvent(id).then(setEvent).catch(() => undefined); }, [id]);
  return (
    <section className="timeline-detail-kiosk">
      <Link to="/timeline" className="record-back"><ArrowLeft /> Full life journey</Link>
      <div className="event-hero"><div className="event-year">{event.date}</div><div className="event-portrait"><img src={event.image || PORTRAIT} alt="" /></div><article><span><ShieldCheck /> {event.verification_status || 'Verified chronology'}</span><h1>{event.title}</h1><p>{event.description}</p></article></div>
      <div className="event-context"><h2>Historical context</h2><p>This moment belongs to a wider struggle for equal citizenship, access to education, and democratic representation. The archive connects the chronology to primary sources wherever records are available.</p></div>
      {!!event.related_archive_items?.length && <section className="event-sources"><h2>Connected archival material</h2>{event.related_archive_items.map(item => <Link key={item.archive_id} to={`/archive/${encodeURIComponent(item.archive_id)}`}><span><strong>{item.title}</strong><small>{item.type} · {item.date}</small></span><ArrowRight /></Link>)}</section>}
    </section>
  );
}
