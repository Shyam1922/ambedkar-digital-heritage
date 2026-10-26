import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { listTimelineEvents } from '../api/timeline';
import { isApiConfigured } from '../api/client';
import type { TimelineEvent } from '../api/types';

const TIMELINE_IMAGE = '/assets/ambedkar-portrait.png';

const fallback: TimelineEvent[] = [
  { event_id: '1891-birth', date: '1891', title: 'Birth in Mhow', description: 'Bhimrao Ramji Ambedkar was born on 14 April in Mhow, in present-day Madhya Pradesh.', image: '', verification_status: 'Verified', related_archive_items: [] },
  { event_id: '1913-columbia', date: '1913', title: 'Columbia University', description: 'Ambedkar began graduate study in New York, developing the economic and political thought that shaped his later work.', image: '', verification_status: 'Verified', related_archive_items: [] },
  { event_id: '1927-mahad', date: '1927', title: 'Mahad Satyagraha', description: 'A landmark public action asserted equal civic rights and access to water for communities subjected to untouchability.', image: '', verification_status: 'Verified', related_archive_items: [] },
  { event_id: '1936-annihilation', date: '1936', title: 'Annihilation of Caste', description: 'The undelivered address became one of the most consequential modern critiques of caste and social hierarchy.', image: '', verification_status: 'Verified', related_archive_items: [] },
  { event_id: '1947-drafting', date: '1947', title: 'Chairman of the Drafting Committee', description: 'Ambedkar was appointed chairman of the committee responsible for preparing the draft Constitution of India.', image: '', verification_status: 'Verified', related_archive_items: [] },
  { event_id: '1956-dhamma', date: '1956', title: 'Conversion at Nagpur', description: 'Ambedkar embraced Buddhism with hundreds of thousands of followers.', image: '', verification_status: 'Verified', related_archive_items: [] },
];

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(fallback);
  const [selected, setSelected] = useState(0);
  useEffect(() => { if (isApiConfigured()) listTimelineEvents().then(data => data.length && setEvents(data)).catch(() => undefined); }, []);
  const event = events[selected] || fallback[0];

  return (
    <section className="timeline-kiosk-page">
      <header className="timeline-intro"><h1>Life Journey</h1><p>Move through the defining moments of Dr. Ambedkar’s intellectual, political, and spiritual life.</p></header>
      <div className="timeline-stage">
        <div className="timeline-years" role="tablist" aria-label="Timeline years">
          {events.map((item, index) => (
            <button type="button" role="tab" aria-selected={selected === index} className={selected === index ? 'active' : ''} key={item.event_id} onClick={() => setSelected(index)}>
              <time>{item.date}</time><span>{item.title}</span>
            </button>
          ))}
        </div>
        <article className="timeline-feature">
          <div className="timeline-photo"><img src={event.image || TIMELINE_IMAGE} alt="" /><span>{event.date}</span></div>
          <div className="timeline-story"><p className="timeline-date-label">{event.date} · Verified chronology</p><h2>{event.title}</h2><p>{event.description}</p><Link to={`/timeline/${encodeURIComponent(event.event_id)}`}>Explore this moment <ArrowRight aria-hidden="true" /></Link></div>
        </article>
      </div>
    </section>
  );
}
