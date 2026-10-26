import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bot, Compass, Landmark, Search, Send, Users } from 'lucide-react';
import { askArchive, askDocument } from '../api/research';
import type { ResearchResponse } from '../api/types';

const suggestions = [
  { label: 'Core philosophy', icon: Compass, prompt: 'How did Ambedkar connect liberty, equality, and fraternity?' },
  { label: 'Constitutional work', icon: Landmark, prompt: 'What constitutional safeguards did Ambedkar support?' },
  { label: 'Social democracy', icon: Users, prompt: 'What did Ambedkar mean by social democracy?' },
];

const initialAnswer: ResearchResponse = {
  answer: 'Ambedkar argued that political democracy could not endure without social democracy. For him, liberty, equality, and fraternity were not separate ideals but a connected way of life. Constitutional rights created the legal framework, while the annihilation of caste was necessary to make those rights meaningful in everyday society.',
  sources: [
    { archive_id: 'WR-1936-01', title: 'Annihilation of Caste', source: 'Writings and Speeches', source_url: '', page_number: 47, excerpt: 'A democratic form of government presupposes a democratic form of society.', detail_url: '/archive/WR-1936-01' },
    { archive_id: 'SP-1949-11', title: 'Final Speech to the Constituent Assembly', source: 'Constituent Assembly Debates', source_url: '', page_number: 979, excerpt: 'Political democracy cannot last unless there lies at the base of it social democracy.', detail_url: '/archive/SP-1949-11' },
  ],
  mode: 'archive', insufficient_information: false,
};

export function Research() {
  const [params] = useSearchParams();
  const documentId = params.get('document') || undefined;
  const [query, setQuery] = useState('How did Ambedkar understand social democracy?');
  const [response, setResponse] = useState<ResearchResponse>(initialAnswer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true); setError('');
    try { setResponse(documentId ? await askDocument(documentId, value, 5) : await askArchive(value, 5)); }
    catch { setError('The live research service is unavailable. The verified demonstration answer remains visible below.'); }
    finally { setLoading(false); }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); ask(query); };

  return (
    <section className="inquiry-page">
      <header className="inquiry-heading"><h1>Ask the Archive</h1><p>Grounded answers drawn from verified documents, speeches, and debates.</p></header>
      {documentId && <div className="document-scope">Searching within document <strong>{documentId}</strong></div>}
      <div className="inquiry-conversation">
        <div className="visitor-question">{query}</div>
        <article className="archive-answer">
          <div className="answer-label"><Bot aria-hidden="true" /><span>Archive-assisted synthesis</span></div>
          <p>{response.answer}</p>
          {!!response.sources.length && <div className="referenced-artifacts"><h2>Referenced artifacts</h2><div>{response.sources.slice(0, 2).map(source => <Link key={`${source.archive_id}-${source.page_number}`} to={`/archive/${encodeURIComponent(source.archive_id)}`}><span><strong>{source.title}</strong><small>{source.source}{source.page_number ? ` · p. ${source.page_number}` : ''}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div></div>}
        </article>
        {error && <p className="inquiry-error">{error}</p>}
      </div>
      <div className="question-suggestions">
        {suggestions.map(({ label, icon: Icon, prompt }) => <button type="button" key={label} onClick={() => { setQuery(prompt); ask(prompt); }}><Icon aria-hidden="true" />{label}</button>)}
      </div>
      <form className="ask-bar" onSubmit={submit}>
        <Search aria-hidden="true" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Inquire with the archive…" aria-label="Ask the archive" />
        <button type="submit" disabled={loading || !query.trim()}>{loading ? 'Searching…' : 'Ask'} <Send aria-hidden="true" /></button>
      </form>
    </section>
  );
}
