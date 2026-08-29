import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Quote } from 'lucide-react';
import type { Citation } from '../api/types';

interface CitationsProps {
  sources: Citation[];
}

export function Citations({ sources }: CitationsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-container">
      <div className="sources-header">
        <Quote size={18} className="sources-icon" />
        <h3>Archival Sources Cited ({sources.length})</h3>
      </div>
      <p className="sources-sub">
        Every factual claim in this answer is directly traceable to the cited collection excerpts below.
      </p>

      <div className="sources-grid">
        {sources.map((source, index) => {
          const detailPath = `/archive/${encodeURIComponent(source.archive_id)}`;
          const readerPath = source.page_number
            ? `/archive/${encodeURIComponent(source.archive_id)}/read?page=${source.page_number}`
            : `/archive/${encodeURIComponent(source.archive_id)}/read`;

          return (
            <div key={`${source.archive_id}-${index}`} className="source-card">
              <div className="source-header">
                <span className="source-num">[{index + 1}]</span>
                <Link to={detailPath} className="source-title-link">
                  <h4 className="source-title">{source.title}</h4>
                </Link>
              </div>

              <div className="source-meta">
                <span className="source-archive-id">ID: {source.archive_id}</span>
                {source.page_number ? (
                  <span className="source-page">Page {source.page_number}</span>
                ) : (
                  <span className="source-page">General excerpt</span>
                )}
                {source.source && <span className="source-origin">Source: {source.source}</span>}
              </div>

              <blockquote className="source-excerpt">
                "{source.excerpt}"
              </blockquote>

              <div className="source-links">
                <Link to={detailPath} className="source-btn-detail">
                  View Document Metadata <ArrowUpRight size={13} />
                </Link>
                <Link to={readerPath} className="source-btn-reader">
                  <BookOpen size={13} /> Open in Reader
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
