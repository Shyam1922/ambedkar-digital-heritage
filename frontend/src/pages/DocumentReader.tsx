import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Minus, Plus } from 'lucide-react';
import { getArchiveItem, getDocumentPage } from '../api/archive';
import { isApiConfigured } from '../api/client';
import type { ArchiveItem, DocumentPage } from '../api/types';

const SCAN = '/assets/annihilation-manuscript.png';
const fallbackItem: ArchiveItem = { archive_id: 'WR-1936-01', title: 'Annihilation of Caste', description: 'The undelivered 1936 address.', type: 'Writing', date: '1936', author_speaker: 'Dr. B. R. Ambedkar', language: 'English', source: 'Writings and Speeches', source_url: '', tags: ['Caste', 'Social reform'], verification_status: 'Authenticated' };

export function DocumentReader() {
  const { id = fallbackItem.archive_id } = useParams();
  const [params, setParams] = useSearchParams();
  const [item, setItem] = useState<ArchiveItem>(fallbackItem);
  const [page, setPage] = useState(Math.max(1, Number(params.get('page')) || 1));
  const [pageData, setPageData] = useState<DocumentPage | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => { if (isApiConfigured()) getArchiveItem(id).then(setItem).catch(() => undefined); }, [id]);
  useEffect(() => {
    setParams({ page: String(page) }, { replace: true });
    if (isApiConfigured()) getDocumentPage(id, page).then(setPageData).catch(() => setPageData(null));
  }, [id, page, setParams]);

  const transcript = pageData?.text || item.extracted_text || 'The path of social reform, like the path to heaven, is strewn with many difficulties. Caste is not merely a division of labour; it is also a division of labourers. A democratic society must assure every person the freedom to develop their capacities and participate as an equal.';
  const total = pageData?.total_pages || 68;

  return (
    <section className="document-viewer-page">
      <header className="reader-titlebar"><Link to={`/archive/${encodeURIComponent(item.archive_id)}`}><ArrowLeft /> Back to record</Link><div><strong>{item.title}</strong><span>{item.author_speaker} · {item.date}</span></div><Link to={`/research?document=${encodeURIComponent(item.archive_id)}`}><MessageCircle /> Ask about this</Link></header>
      <div className="document-workspace">
        <div className="scan-panel">
          <div className="scan-toolbar"><span>Page {page} of {total}</span><div><button onClick={() => setZoom(value => Math.max(.7, value - .1))} aria-label="Zoom out"><Minus /></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(value => Math.min(1.5, value + .1))} aria-label="Zoom in"><Plus /></button></div></div>
          <div className="scan-canvas"><img src={SCAN} alt={`Digitized scan of ${item.title}, page ${page}`} style={{ transform: `scale(${zoom})` }} /></div>
          <div className="page-controls"><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1}><ChevronLeft /> Previous</button><span>{item.archive_id} · Source page {pageData?.original_page_number || page}</span><button onClick={() => setPage(value => Math.min(total, value + 1))} disabled={page >= total}>Next <ChevronRight /></button></div>
        </div>
        <aside className="document-transcript"><header><span>Verified transcription</span><h1>{item.title}</h1><p>{item.author_speaker} · {item.date}</p></header><div className="transcript-text"><p>{transcript}</p></div><footer><strong>Archival reference</strong><span>{item.source}</span><span>{item.verification_status}</span></footer></aside>
      </div>
    </section>
  );
}
