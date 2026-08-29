import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Sparkles, Compass, FileText } from 'lucide-react';
import { listArchiveItems } from '../api/archive';
import { listTimelineEvents } from '../api/timeline';
import type { ArchiveItem, TimelineEvent } from '../api/types';
import { ArchiveCard } from '../components/ArchiveCard';
import { LoadingState } from '../components/UIState';

export function Home() {
  const [featuredItems, setFeaturedItems] = useState<ArchiveItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listArchiveItems('', '').catch(() => ({ items: [], total: 0 })),
      listTimelineEvents().catch(() => []),
    ]).then(([archiveData, eventsData]) => {
      setFeaturedItems(archiveData.items.slice(0, 6));
      setTimelineEvents(eventsData.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">A living digital heritage collection</p>
          <h1>
            Dr. B. R. Ambedkar<br />
            <em>Digital Heritage Archive</em>
          </h1>
          <p className="lede">
            Explore authentic writings, seminal speeches, and landmark constitutional debates through a curated,
            grounded research portal preserving the intellectual and social reform legacy of Babasaheb Ambedkar.
          </p>
          <div className="actions">
            <Link className="button gold" to="/archive">
              <BookOpen size={18} /> Explore Collection
            </Link>
            <Link className="button outline" to="/research">
              <Sparkles size={18} /> Ask AI Archive
            </Link>
            <Link className="button ghost" to="/timeline">
              <Clock size={18} /> Historical Timeline
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights & Statistics */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-number">10+</div>
          <div className="stat-label">Core Archival Documents</div>
          <p className="stat-sub">Speeches, books, memoranda, and constitutional records.</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-number">16</div>
          <div className="stat-label">Chronological Milestones</div>
          <p className="stat-sub">From Columbia University (1913) to conversion in Nagpur (1956).</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Sparkles size={24} /></div>
          <div className="stat-number">100%</div>
          <div className="stat-label">Grounded AI Research</div>
          <p className="stat-sub">Every AI assertion is strictly verified with direct document citations.</p>
        </div>
      </section>

      {/* Project Introduction */}
      <section className="intro">
        <div>
          <p className="eyebrow">The Heritage Initiative</p>
          <h2>Preserving democratic thought for posterity</h2>
        </div>
        <div>
          <p>
            The Ambedkar Digital Heritage Archive bridges historical preservation and modern research intelligence.
            Every item in this archive is meticulously digitized, chunked with page-level provenance, and cross-referenced with
            historical moments in Ambedkar’s public life.
          </p>
          <p>
            Researchers, students, and citizens can seamlessly navigate from broad thematic questions into verbatim paragraph-level
            citations inside the original papers.
          </p>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Collection Highlights</p>
            <h2>Featured Archival Documents</h2>
          </div>
          <Link to="/archive" className="view-all-link">
            <span>View all archive items</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading collection highlights..." />
        ) : (
          <div className="grid">
            {featuredItems.map((item) => (
              <ArchiveCard key={item.archive_id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Timeline Teaser */}
      <section className="timeline-tease">
        <div className="timeline-tease-left">
          <p className="eyebrow">Historical Chronology</p>
          <h2>Ideas shaped across crucial decades</h2>
          <p>
            Discover the critical events that defined the struggle for equality, constitutional democracy, and civic rights across India.
          </p>
          <Link className="button outline-dark" to="/timeline">
            <Compass size={18} /> Open Full Timeline
          </Link>
        </div>
        <div className="timeline-tease-right">
          <ol className="teaser-timeline">
            {timelineEvents.map((event) => (
              <li key={event.event_id}>
                <Link to={`/timeline/${encodeURIComponent(event.event_id)}`} className="teaser-item">
                  <time>{event.date}</time>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Research CTA Banner */}
      <section className="research-banner">
        <div className="research-banner-inner">
          <span className="banner-badge"><Sparkles size={14} /> AI-Powered Inquiry</span>
          <h2>Have questions about Ambedkar's writings?</h2>
          <p>
            Ask specific research queries and receive answers synthesized directly from verified texts with page-level citations.
          </p>
          <Link to="/research" className="button gold">
            Start Research Query
          </Link>
        </div>
      </section>
    </div>
  );
}

