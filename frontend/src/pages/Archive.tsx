import { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { listArchiveItems } from '../api/archive';
import type { ArchiveItem } from '../api/types';
import { ArchiveCard } from '../components/ArchiveCard';
import { EmptyState, ErrorNotice, LoadingState } from '../components/UIState';

const MATERIAL_TYPES = [
  '',
  'Writing',
  'Speech',
  'Constitutional Debate',
  'Book',
  'Article',
  'Manuscript',
  'Photograph',
  'Other',
];

export function Archive() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  const loadData = () => {
    setLoading(true);
    setError('');
    listArchiveItems(debouncedQuery, type)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load archive items.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [debouncedQuery, type]);

  return (
    <div className="archive-explorer-page">
      <section className="page-title">
        <p className="eyebrow">Archival Collection</p>
        <h1>Archive Explorer</h1>
        <p>
          Browse and filter digitized writings, speeches, and constitutional deliberations. Open any source document
          to read its page-by-page text or ask targeted AI questions.
        </p>
      </section>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or tags (e.g. equality, caste, economy)..."
            aria-label="Search archive"
          />
          {query && (
            <button className="clear-query-btn" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
        </div>

        <div className="type-select-wrapper">
          <Filter size={16} className="filter-icon" />
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by material type">
            {MATERIAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t || 'All Material Types'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-summary">
        <span>
          Showing <strong>{items.length}</strong> of <strong>{total}</strong> archive {total === 1 ? 'item' : 'items'}
          {type && ` in type "${type}"`}
          {debouncedQuery && ` matching "${debouncedQuery}"`}
        </span>
      </div>

      {error ? (
        <ErrorNotice message={error} onRetry={loadData} />
      ) : loading ? (
        <LoadingState message="Searching archival collection..." />
      ) : items.length > 0 ? (
        <div className="grid">
          {items.map((item) => (
            <ArchiveCard key={item.archive_id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No archival items matched your filters"
          message="Try resetting your search query or choosing 'All Material Types'."
          action={
            <button
              className="button outline"
              onClick={() => {
                setQuery('');
                setType('');
              }}
            >
              <RefreshCw size={15} /> Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
}

