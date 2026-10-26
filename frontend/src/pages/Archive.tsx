import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { listArchiveItems } from '../api/archive';
import type { ArchiveItem } from '../api/types';

const MANUSCRIPT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvbPio4YhdU2INA1fj4D0jISqVH6cXvPsmKBU9Z5gwhe1tC3ho8F2nzEB9EqxMVvXQ1-Q6DCslBFGtDyrCOiunOskAuo05iKygZTttaYqqiXFz4tT9pxR8Y_R1nozsvhaYI9JNUsvMo1lMMARqFDSl8YiugJ27xnLGU-ZMSq6r5e-TCDelTR-viBDYboYOcfJMz8P5GOT1krYBRtHaIibLCjVje3wSZ2vIoveGbmYFZUoaZ1itNinz';
const SPEECH = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhIrxwaJvgpWryK1U3DoHwTDUziZXiazNL9NGzwWMv52OW6AAE0D1lE_K-r-Kobsms9IoSCphFYc5PwNQ8E3OEUwC2gkRfZA0UYsTPaKKvXcwu303M9gg5flhuRpplsYrX7falg4UsAtd98d2JfiXFBlKy0D3tbtmDaHBDZ3ew74-xWLJJz1JEby3QIQUi16OB1ZJ01iThwSmtvlabbL72hRzcE2d0dk1l4Nq658S9otsU5v8UZ5g5';

const fallback: ArchiveItem[] = [
  { archive_id: 'WR-1936-01', title: 'Annihilation of Caste', description: 'The undelivered 1936 address examining caste, religious authority, and the conditions required for social reform.', type: 'Writing', date: '1936', author_speaker: 'Dr. B. R. Ambedkar', language: 'English', source: 'Writings and Speeches', source_url: '', tags: ['Caste', 'Equality'], verification_status: 'Authenticated' },
  { archive_id: 'SP-1949-11', title: 'Final Speech to the Constituent Assembly', description: 'Ambedkar’s concluding address on constitutional morality, democracy, and the responsibilities of citizens.', type: 'Speech', date: '25 November 1949', author_speaker: 'Dr. B. R. Ambedkar', language: 'English', source: 'Constituent Assembly Debates', source_url: '', tags: ['Constitution', 'Democracy'], verification_status: 'Authenticated' },
];

const filters = ['All', 'Writing', 'Speech', 'Photograph', 'Book'];

export function Archive() {
  const [items, setItems] = useState<ArchiveItem[]>(fallback);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    listArchiveItems('', '').then(data => data.items.length && setItems(data.items)).catch(() => undefined);
  }, []);

  const visible = useMemo(() => items.filter(item => {
    const matchesFilter = filter === 'All' || item.type.toLowerCase().includes(filter.toLowerCase());
    const haystack = `${item.title} ${item.description} ${item.tags?.join(' ')}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [items, filter, query]);

  return (
    <section className="archive-kiosk-page">
      <div className="archive-toolbar">
        <div><h1>Archive &amp; Media</h1><p>Verified primary sources from Ambedkar’s life and work.</p></div>
        <label className="archive-search"><Search aria-hidden="true" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the collection" /></label>
      </div>
      <div className="archive-filters" role="group" aria-label="Filter collection">
        {filters.map(value => <button key={value} type="button" onClick={() => setFilter(value)} className={filter === value ? 'active' : ''}>{value}</button>)}
      </div>

      <div className="artifact-grid">
        {visible.map((item, index) => (
          <article className="artifact-card" key={item.archive_id}>
            <Link to={`/archive/${encodeURIComponent(item.archive_id)}`} className="artifact-image">
              <img src={index % 2 ? SPEECH : MANUSCRIPT} alt="" />
              <span>{item.type}</span>
            </Link>
            <div className="artifact-body">
              <div className="artifact-status"><span>{item.date}</span><span><ShieldCheck aria-hidden="true" /> {item.verification_status || 'Verified'}</span></div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="artifact-footer"><strong>ID: {item.archive_id}</strong><Link to={`/archive/${encodeURIComponent(item.archive_id)}`}>View</Link></div>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && <div className="kiosk-empty"><h2>No records found</h2><p>Try another search term or collection type.</p></div>}
      <footer className="archive-pagination"><span>Showing {visible.length} of {items.length} artifacts</span><div><button disabled aria-label="Previous page"><ChevronLeft /></button><span>Page 1 of 1</span><button disabled aria-label="Next page"><ChevronRight /></button></div></footer>
    </section>
  );
}
