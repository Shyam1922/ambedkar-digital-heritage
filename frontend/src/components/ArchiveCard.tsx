import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, ShieldCheck, Tag } from 'lucide-react';
import type { ArchiveItem } from '../api/types';

interface ArchiveCardProps {
  item: ArchiveItem;
}

export function ArchiveCard({ item }: ArchiveCardProps) {
  const summaryText = item.short_summary || item.description || '';
  const displaySummary = summaryText.length > 150 ? summaryText.slice(0, 150) + '...' : summaryText;

  return (
    <article className="archive-card">
      <div className="card-top">
        <span className="badge">{item.type}</span>
        <div className="card-meta-right">
          <time>
            <Calendar size={12} /> {item.date}
          </time>
          {item.verification_status && (
            <span className="verification-pill" title={`Status: ${item.verification_status}`}>
              <ShieldCheck size={12} /> {item.verification_status.replace('DEMO / ', '')}
            </span>
          )}
        </div>
      </div>

      <h3 className="card-title">
        <Link to={`/archive/${encodeURIComponent(item.archive_id)}`}>{item.title}</Link>
      </h3>

      <div className="card-author">{item.author_speaker}</div>

      <p className="card-desc">{displaySummary}</p>

      {item.tags && item.tags.length > 0 && (
        <div className="card-tags">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              <Tag size={10} /> {tag}
            </span>
          ))}
          {item.tags.length > 3 && <span className="tag-more">+{item.tags.length - 3}</span>}
        </div>
      )}

      <div className="card-actions">
        <Link to={`/archive/${encodeURIComponent(item.archive_id)}`} className="read-link">
          <span>Explore item</span>
          <ArrowRight size={15} />
        </Link>
        <Link to={`/archive/${encodeURIComponent(item.archive_id)}/read`} className="quick-read-link" title="Open Reader">
          <BookOpen size={15} />
        </Link>
      </div>
    </article>
  );
}
