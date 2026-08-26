import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { api, type DocumentPage, type Item } from '../lib/api';

export function Document() {
    const { id = '' } = useParams();

    const [item, setItem] = useState<Item | null>(null);
    const [itemError, setItemError] = useState('');
    const [itemLoading, setItemLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState<DocumentPage | null>(null);
    const [pageError, setPageError] = useState('');
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        setItem(null);
        setItemError('');
        setItemLoading(true);
        setPage(1);

        api.item(id)
            .then(setItem)
            .catch(e => setItemError(e.message))
            .finally(() => setItemLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;

        setPageLoading(true);
        setPageData(null);
        setPageError('');

        api.page(id, page)
            .then(result => {
                setPageData(result);
            })
            .catch(e => setPageError(e.message))
            .finally(() => setPageLoading(false));
    }, [id, page]);

    if (itemLoading) {
        return <p className="notice">Opening archival item…</p>;
    }

    if (itemError || !item) {
        return <p className="notice error">{itemError || 'Archive item not found.'}</p>;
    }

    return (
        <>
            <Link className="back" to="/archive">
                <ArrowLeft size={16} />
                Archive Explorer
            </Link>

            <section className="document">

                <article className="preview">
                    <div className="paper">

                        <p className="eyebrow">
                            Extracted archival text
                        </p>

                        <h2>{item.title}</h2>

                        <div className="page-controls">

                            <button
                                onClick={() =>
                                    setPage(p => Math.max(1, p - 1))
                                }
                                disabled={page === 1 || pageLoading}
                            >
                                Previous
                            </button>

                            <span>
                                {pageData ? `Page ${pageData.page_number} of ${pageData.total_pages}` : 'Loading page…'}
                            </span>

                            <button
                                onClick={() =>
                                    setPage(p =>
                                        Math.min(pageData?.total_pages ?? p, p + 1)
                                    )
                                }
                                disabled={
                                    page === (pageData?.total_pages ?? 0) ||
                                    pageLoading ||
                                    !pageData
                                }
                            >
                                Next
                            </button>

                        </div>

                        {pageLoading ? (
                            <p>Loading page…</p>
                        ) : pageError ? (
                            <div className="page-error">
                                <p>{pageError}</p>
                                {item.extracted_text ? (
                                    <p className="document-fallback">{item.extracted_text}</p>
                                ) : null}
                            </div>
                        ) : pageData?.text.trim() ? (
                            <p>{pageData.text}</p>
                        ) : (
                            <p className="document-empty">No extracted text is available for this page.</p>
                        )}

                    </div>
                </article>

                <aside className="metadata">

                    <span className="badge">
                        {item.type}
                    </span>

                    <h1>{item.title}</h1>

                    <dl>

                        <dt>Date</dt>
                        <dd>{item.date}</dd>

                        <dt>Author / speaker</dt>
                        <dd>{item.author_speaker}</dd>

                        <dt>Language</dt>
                        <dd>{item.language}</dd>

                        <dt>Source</dt>
                        <dd>
                            {item.source_url ? (
                                <a
                                    href={item.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {item.source}
                                </a>
                            ) : item.source}
                        </dd>

                        <dt>Archive ID</dt>
                        <dd>{item.archive_id}</dd>

                    </dl>

                    <div className="tag-row">
                        {item.tags.map(tag => (
                            <span key={tag}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    <p>{item.description}</p>

                    <Link
                        className="button gold"
                        to={`/research?document=${item.archive_id}`}
                    >
                        <MessageCircle size={18} />
                        Ask AI about this document
                    </Link>

                </aside>

            </section>
        </>
    );
}
