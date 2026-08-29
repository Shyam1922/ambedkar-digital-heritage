import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, HelpCircle, Send, Sparkles, X, FileText } from 'lucide-react';
import { askArchive, askDocument } from '../api/research';
import { getArchiveItem } from '../api/archive';
import type { ArchiveItem, ResearchResponse } from '../api/types';
import { Citations } from '../components/Citations';
import { ErrorNotice } from '../components/UIState';

const SAMPLE_PROMPTS = [
  "What were Dr. Ambedkar's core arguments on the annihilation of caste?",
  "How did Ambedkar define the relationship between social democracy and political democracy?",
  "What constitutional safeguards did Ambedkar propose for minorities?",
  "What was the significance of the Mahad Satyagraha at Chavdar Tank?",
];

export function Research() {
  const [searchParams, setSearchParams] = useSearchParams();
  const documentId = searchParams.get('document') || undefined;

  const [documentItem, setDocumentItem] = useState<ArchiveItem | null>(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<ResearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load document metadata if constrained to a specific document
  useEffect(() => {
    if (documentId) {
      getArchiveItem(documentId)
        .then(setDocumentItem)
        .catch(() => setDocumentItem(null));
      setQuery(`What does this document argue regarding social reform and equality?`);
    } else {
      setDocumentItem(null);
    }
  }, [documentId]);

  const clearDocumentConstraint = () => {
    setSearchParams({}, { replace: true });
    setDocumentItem(null);
    setQuery('');
  };

  const executeResearch = async (queryString: string) => {
    if (!queryString.trim()) return;
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const result = documentId
        ? await askDocument(documentId, queryString, 5)
        : await askArchive(queryString, 5);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'The archival research assistant is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeResearch(query);
  };

  return (
    <div className="research-page">
      <section className="page-title centered">
        <span className="banner-badge"><Sparkles size={14} /> Grounded Archival Research</span>
        <h1>Ask the Archive</h1>
        <p>
          Pose research questions across Dr. B. R. Ambedkar's writings and constitutional debates.
          Every answer is synthesized strictly from retrieved primary excerpts and backed by direct citations.
        </p>
      </section>

      {/* Document Constraint Pill */}
      {documentId && (
        <div className="document-filter-pill">
          <div className="pill-info">
            <FileText size={16} />
            <span>
              Searching exclusively within: <strong>{documentItem?.title || documentId}</strong> ({documentId})
            </span>
          </div>
          <button onClick={clearDocumentConstraint} className="clear-pill-btn" title="Search entire archive instead">
            <X size={16} /> Clear Document Filter
          </button>
        </div>
      )}

      {/* Inquiry Form */}
      <div className="research-box">
        <form onSubmit={handleSubmit} className="research-form">
          <div className="textarea-wrapper">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a historical or philosophical question (e.g. What were Ambedkar's views on caste and democracy?)..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-bottom-bar">
            <div className="prompt-suggestions-label">
              <HelpCircle size={14} /> Sample research inquiries:
            </div>
            <button type="submit" className="button gold" disabled={loading || !query.trim()}>
              {loading ? (
                <>Searching & Synthesizing...</>
              ) : (
                <>
                  <Send size={16} /> Ask Question
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prompt Chips */}
        {!documentId && (
          <div className="prompt-chips">
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chip"
                onClick={() => {
                  setQuery(prompt);
                  executeResearch(prompt);
                }}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <ErrorNotice message={error} onRetry={() => executeResearch(query)} />}

      {/* Result Display */}
      {response && (
        <div className="research-response-container">
          <div className="response-header">
            <div className="response-badge">
              <Sparkles size={16} /> Verified Archival Synthesis
            </div>
            {response.mode && <span className="mode-tag">Mode: {response.mode}</span>}
          </div>

          {response.insufficient_information ? (
            <div className="insufficient-info-box">
              <AlertCircle size={22} />
              <div>
                <h4>Insufficient Archival Evidence</h4>
                <p>{response.answer}</p>
              </div>
            </div>
          ) : (
            <div className="answer-card">
              <p className="answer-text">{response.answer}</p>
            </div>
          )}

          {/* Citations List */}
          {response.sources && response.sources.length > 0 && (
            <Citations sources={response.sources} />
          )}
        </div>
      )}
    </div>
  );
}

