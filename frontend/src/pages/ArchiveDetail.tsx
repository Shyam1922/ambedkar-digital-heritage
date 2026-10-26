import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Languages, MessageCircle, ShieldCheck, UserRound } from 'lucide-react';
import { getArchiveItem } from '../api/archive';
import { isApiConfigured } from '../api/client';
import type { ArchiveItem } from '../api/types';

const SCAN = '/assets/annihilation-manuscript.png';
const fallback: ArchiveItem = { archive_id: 'WR-1936-01', title: 'Annihilation of Caste', description: 'The undelivered 1936 address examining caste, religious authority, and the conditions required for social reform.', short_summary: 'A foundational critique of caste and a sustained argument for liberty, equality, and fraternity as social principles.', type: 'Writing', date: '1936', author_speaker: 'Dr. B. R. Ambedkar', language: 'English', source: 'Dr. Babasaheb Ambedkar: Writings and Speeches', source_url: '', tags: ['Caste', 'Social reform', 'Equality'], verification_status: 'Authenticated' };

export function ArchiveDetail() {
  const { id = fallback.archive_id } = useParams();
  const [item, setItem] = useState<ArchiveItem>(fallback);
  useEffect(() => { if (isApiConfigured()) getArchiveItem(id).then(setItem).catch(() => undefined); }, [id]);
  return (
    <section className="record-page">
      <Link className="record-back" to="/archive"><ArrowLeft /> Return to archive</Link>
      <div className="record-layout">
        <div className="record-preview"><img src={SCAN} alt={`Digitized preview of ${item.title}`} /><span><ShieldCheck /> {item.verification_status || 'Verified source'}</span></div>
        <article className="record-content">
          <div className="record-type">{item.type} · {item.archive_id}</div>
          <h1>{item.title}</h1><p className="record-description">{item.short_summary || item.description}</p>
          <dl className="record-metadata"><div><dt><UserRound /> Author / speaker</dt><dd>{item.author_speaker}</dd></div><div><dt><Calendar /> Date</dt><dd>{item.date}</dd></div><div><dt><Languages /> Language</dt><dd>{item.language}</dd></div><div><dt><BookOpen /> Collection</dt><dd>{item.source}</dd></div></dl>
          {!!item.tags?.length && <div className="record-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          <div className="record-actions"><Link to={`/archive/${encodeURIComponent(item.archive_id)}/read`}><BookOpen /> Read document <ArrowRight /></Link><Link to={`/research?document=${encodeURIComponent(item.archive_id)}`}><MessageCircle /> Ask the archive</Link></div>
        </article>
      </div>
    </section>
  );
}
