import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, AlertCircle } from 'lucide-react';
import { getArchiveItem, getDocumentPage } from '../api/archive';
import type { ArchiveItem, DocumentPage } from '../api/types';
import { LoadingState } from '../components/UIState';

export function DocumentReader() {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [item, setItem] = useState<ArchiveItem | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemError, setItemError] = useState('');

  const [page, setPage] = useState(isNaN(initialPage) || initialPage < 1 ? 1 : initialPage);
  const [pageData, setPageData] = useState<DocumentPage | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  // Load item details
  useEffect(() => {
    setItemLoading(true);
    setItemError('');
    getArchiveItem(id)
      .then(setItem)
      .catch((err) => setItemError(err.message || 'Archival item not found.'))
      .finally(() => setItemLoading(false));
  }, [id]);

  // Load specific page
  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    setPageError('');
    setSearchParams({ page: page.toString() }, { replace: true });

    getDocumentPage(id, page)
      .then((data) => {
        setPageData(data);
      })
      .catch((err) => {
        setPageError(err.message || 'Page text could not be loaded.');
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [id, page, setSearchParams]);

  if (itemLoading) {
    return <LoadingState message="Opening archival document reader..." />;
  }

  if (itemError || !item) {
    return (
      <div className="reader-error-container">
        <Link className="back-link" to="/archive">
          <ArrowLeft size={16} /> Back to Archive Explorer
        </Link>
        <p className="notice error">{itemError || 'Archive item not found.'}</p>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <div className="reader-nav-header">
        <Link className="back-link" to={`/archive/${encodeURIComponent(item.archive_id)}`}>
          <ArrowLeft size={16} /> Document Details
        </Link>
        <div className="reader-quick-actions">
          <Link
            className="button outline small"
            to={`/research?document=${encodeURIComponent(item.archive_id)}`}
          >
            <MessageCircle size={14} /> Ask AI About Document
          </Link>
        </div>
      </div>

      <div className="reader-document-layout">
        {/* Paper / Reader Viewport */}
        <section className="reader-viewport">
          <div className="reader-paper">
            <div className="paper-header">
              <span className="eyebrow">Digitized Archival Document</span>
              <h2 className="paper-title">{item.title}</h2>
              <div className="paper-meta">
                <span>{item.author_speaker}</span> · <span>{item.date}</span> · <span>{item.type}</span>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="paper-pagination-bar">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || pageLoading}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} /> Previous Page
              </button>

              <div className="page-indicator">
                {pageData ? (
                  <>
                    <span>
                      Page <strong>{pageData.page_number}</strong> of <strong>{pageData.total_pages}</strong>
                    </span>
                    {pageData.original_page_number && pageData.original_page_number !== pageData.page_number && (
                      <small className="orig-page-tag">
                        (Source Page: {pageData.original_page_number})
                      </small>
                    )}
                  </>
                ) : (
                  <span>Page {page}</span>
                )}
              </div>

              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(pageData?.total_pages ?? (p + 1), p + 1))}
                disabled={
                  Boolean(pageData && page >= pageData.total_pages) ||
                  pageLoading
                }
                aria-label="Next page"
              >
                Next Page <ChevronRight size={18} />
              </button>
            </div>

            {/* Text Body */}
            <div className="paper-body">
              {pageLoading ? (
                <div className="paper-loading">
                  <LoadingState message={`Rendering page ${page}...`} />
                </div>
              ) : pageError ? (
                <div className="paper-fallback-notice">
                  <div className="page-error">
                    <AlertCircle size={18} />
                    <p>{pageError}</p>
                  </div>
                  {item.extracted_text && (
                    <div className="extracted-fallback">
                      <p className="eyebrow">Full Archival Transcript Fallback</p>
                      <div className="fallback-text">{item.extracted_text}</div>
                    </div>
                  )}
                </div>
              ) : pageData?.text?.trim() ? (
                <div className="page-text-content">{pageData.text}</div>
              ) : item.extracted_text ? (
                <div className="page-text-content">{item.extracted_text}</div>
              ) : (
                <p className="document-empty">No extracted text is available for this page.</p>
              )}
            </div>
          </div>
        </section>

        {/* Reader Meta Sidebar */}
        <aside className="reader-sidebar">
          <div className="reader-sidebar-card">
            <h3>Archival Reference</h3>
            <dl className="sidebar-dl">
              <dt>Document ID</dt>
              <dd>{item.archive_id}</dd>

              <dt>Verification Status</dt>
              <dd>{item.verification_status}</dd>

              <dt>Source Origin</dt>
              <dd>{item.source}</dd>
            </dl>
          </div>

          <div className="reader-sidebar-card">
            <h3>Navigation Tips</h3>
            <p className="tips-p">
              Use the Previous and Next buttons to flip through original pages. Quotes referenced in the AI research assistant
              correlate directly to these page numbers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
