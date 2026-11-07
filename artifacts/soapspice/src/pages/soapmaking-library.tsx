import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Link } from 'wouter';
import {
  soapmakingLibraryResources,
  type SoapmakingLibraryKind,
} from '@/data/soapmaking-library-resources';

type SavedCitation = {
  id: string;
  title: string;
  kind: SoapmakingLibraryKind;
  publisher: string;
  href: string;
  summary: string;
  format: string;
  tags: string[];
  notes: string;
  savedAt: string;
};

const STORAGE_KEY = 'soapspice-private-library-v1';
const kinds: Array<'all' | SoapmakingLibraryKind> = ['all', 'article', 'recipe'];
const publicImages = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}images/`;

function readSavedCitations(): SavedCitation[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is SavedCitation =>
      typeof item === 'object' && item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      (item.kind === 'article' || item.kind === 'recipe') &&
      typeof item.publisher === 'string' &&
      typeof item.href === 'string' &&
      typeof item.summary === 'string' &&
      typeof item.format === 'string' &&
      Array.isArray(item.tags) &&
      typeof item.notes === 'string' &&
      typeof item.savedAt === 'string',
    );
  } catch {
    return [];
  }
}

function kindLabel(kind: SoapmakingLibraryKind) {
  return kind === 'article' ? 'Article' : 'Recipe';
}

export default function SoapmakingLibraryPage() {
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | SoapmakingLibraryKind>('all');
  const [webQuery, setWebQuery] = useState('');
  const [saved, setSaved] = useState<SavedCitation[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '',
    publisher: '',
    href: '',
    kind: 'article' as SoapmakingLibraryKind,
    summary: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    setSaved(readSavedCitations());
    setStorageReady(true);
  }, []);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return soapmakingLibraryResources.filter((resource) => {
      const matchesKind = kindFilter === 'all' || resource.kind === kindFilter;
      const searchable = [
        resource.title, resource.publisher, resource.summary, resource.format, ...resource.tags,
      ].join(' ').toLowerCase();
      return matchesKind && (!query || searchable.includes(query));
    });
  }, [search, kindFilter]);

  const filteredSaved = useMemo(() => {
    const query = search.trim().toLowerCase();
    return saved.filter((item) => {
      const matchesKind = kindFilter === 'all' || item.kind === kindFilter;
      const searchable = [
        item.title, item.publisher, item.summary, item.notes, item.format, ...item.tags,
      ].join(' ').toLowerCase();
      return matchesKind && (!query || searchable.includes(query));
    });
  }, [saved, search, kindFilter]);

  function persist(items: SavedCitation[], successMessage = 'Saved privately in this browser.') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSaved(items);
      setNotice(successMessage);
      return true;
    } catch {
      setNotice('Browser storage is unavailable. Your citation was not saved.');
      return false;
    }
  }

  function addCitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(form.href.trim());
    } catch {
      setFormError('Enter a complete publisher URL, including https://.');
      return;
    }
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      setFormError('Use an http or https publisher link.');
      return;
    }
    if (!form.title.trim() || !form.publisher.trim()) {
      setFormError('Add a title and publisher to save this citation.');
      return;
    }
    const citation: SavedCitation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: form.title.trim(),
      publisher: form.publisher.trim(),
      href: parsedUrl.toString(),
      kind: form.kind,
      summary: form.summary.trim(),
      notes: form.notes.trim(),
      format: 'Personal citation',
      tags: [...new Set(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 12),
      savedAt: new Date().toISOString(),
    };
    if (!persist([citation, ...saved])) return;
    setForm({ title: '', publisher: '', href: '', kind: 'article', summary: '', notes: '', tags: '' });
    setFormOpen(false);
  }

  function removeCitation(id: string) {
    persist(saved.filter((item) => item.id !== id), 'Citation removed from this browser.');
  }

  const externalSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(webQuery.trim() || 'soapmaking safety recipes ingredients')}`;

  return (
    <div className="sl-page">
      <header className="sl-hero">
        <div className="sl-hero-inner">
          <div className="sl-hero-copy">
            <p className="sl-eyebrow"><span /> A working shelf for curious makers</p>
            <h1>Good sources<br /><em>make better batches.</em></h1>
            <p className="sl-lede">A practical reading shelf for recipes, ingredient references, and safer making. SoapSpice guides are clearly marked; outside sources stay linked to their publishers.</p>
            <div className="sl-hero-proof"><ShieldCheck size={17} aria-hidden="true" /><span>Follow the citation. Check the details. Make with care.</span></div>
          </div>
          <aside className="sl-shelf-art" aria-label="Library note">
            <div className="sl-shelf-stamp"><BookOpen size={27} aria-hidden="true" /></div>
            <span className="sl-shelf-label">FIELD NOTES / 01</span>
            <p>From a trusted source<br />to your next soap.</p>
            <span className="sl-shelf-line" />
          </aside>
        </div>
      </header>

      <div className="sl-main">
        <section className="sl-search-panel" aria-labelledby="sl-search-title">
          <div className="sl-search-copy">
            <span className="sl-section-kicker">Beyond this shelf</span>
            <h2 id="sl-search-title">Search the wider web</h2>
            <p>Explore soapmaking sources on DuckDuckGo. Search results open in a new tab and are not collected by SoapSpice.</p>
          </div>
          <form className="sl-web-search" onSubmit={(event) => {
            event.preventDefault();
            window.open(externalSearchUrl, '_blank', 'noopener,noreferrer');
          }}>
            <label className="sl-sr-only" htmlFor="sl-public-search">Search soapmaking sources on the web</label>
            <div className="sl-search-input-wrap"><Search size={18} aria-hidden="true" /><input id="sl-public-search" value={webQuery} onChange={(event) => setWebQuery(event.target.value)} placeholder="Try “olive oil soap recipe”" /></div>
            <button type="submit" className="sl-search-button">Search DuckDuckGo <ArrowUpRight size={16} aria-hidden="true" /></button>
          </form>
          <p className="sl-search-note">External search opens DuckDuckGo in a new tab.</p>
        </section>

        <section className="sl-library" aria-labelledby="sl-library-title">
          <div className="sl-section-heading">
            <div><span className="sl-section-kicker">The SoapSpice reading shelf</span><h2 id="sl-library-title">Soapmaking library</h2></div>
            <span className="sl-count">{filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}</span>
          </div>
          <p className="sl-library-intro">Start with our guides, then follow carefully selected citations to their original publishers.</p>

          <div className="sl-library-controls">
            <label className="sl-library-search"><Search size={17} aria-hidden="true" /><span className="sl-sr-only">Search the library</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, publishers, topics…" /></label>
            <div className="sl-kind-filters" role="group" aria-label="Filter library by kind">
              {kinds.map((kind) => <button key={kind} type="button" aria-pressed={kindFilter === kind} onClick={() => setKindFilter(kind)}>{kind === 'all' ? 'All resources' : `${kindLabel(kind)}s`}</button>)}
            </div>
          </div>

          {filteredResources.length > 0 ? (
            <div className="sl-resource-grid">
              {filteredResources.map((resource, index) => {
                const external = resource.contentMode === 'source-link';
                const imagePath = `${publicImages}${resource.image.replace(/^\/?images\//, '')}`;
                const card = (
                  <article className={`sl-resource-card${external ? ' is-external' : ''}`} key={resource.id} style={{ animationDelay: `${Math.min(index * 55, 275)}ms` }}>
                    <div className="sl-resource-image">
                      <img src={imagePath} alt={resource.imageAlt} loading="eager" decoding="async" />
                      {external && <span className="sl-image-note">SoapSpice image · illustrative</span>}
                      <span className={`sl-kind sl-kind-${resource.kind}`}>{kindLabel(resource.kind)}</span>
                    </div>
                    <div className="sl-resource-copy">
                      <div className="sl-card-top"><span className={external ? 'sl-source-label external' : 'sl-source-label'}>{external ? 'External publisher' : 'SoapSpice original guide'}</span><span className="sl-format">{resource.format}</span></div>
                      <h3>{resource.title}</h3>
                      <p className="sl-publisher">Published by <strong>{resource.publisher}</strong></p>
                      <p className="sl-summary">{resource.summary}</p>
                      {external && <p className="sl-citation-note">Summary by SoapSpice. Visit the publisher for its complete content and instructions.</p>}
                      <div className="sl-tags" aria-label="Topics">{resource.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      {external ? (
                        <a className="sl-resource-link" href={resource.href} target="_blank" rel="noopener noreferrer">Visit {resource.publisher} <ExternalLink size={15} aria-hidden="true" /><span className="sl-sr-only"> (opens in a new tab)</span></a>
                      ) : (
                        <Link className="sl-resource-link" href={resource.href}>Read this SoapSpice guide <ArrowDownRight size={16} aria-hidden="true" /></Link>
                      )}
                    </div>
                  </article>
                );
                return card;
              })}
            </div>
          ) : (
            <div className="sl-empty" role="status">
              <Search size={25} aria-hidden="true" />
              <h3>No library entries found.</h3>
              <p>Try a different search or clear the kind filter to see the full reading shelf.</p>
              <button type="button" onClick={() => { setSearch(''); setKindFilter('all'); }}>Clear search and filters</button>
            </div>
          )}
        </section>

        <section className="sl-personal" aria-labelledby="sl-personal-title">
          <div className="sl-personal-heading">
            <div><span className="sl-section-kicker">Your own field notes</span><h2 id="sl-personal-title">Keep a citation close</h2></div>
            <span className="sl-private-pill"><ShieldCheck size={14} aria-hidden="true" /> Private to this browser</span>
          </div>
          <div className="sl-personal-callout">
            <FileText size={22} aria-hidden="true" />
            <p>Save a publisher link, a short description, and your own notes. These details stay in this browser’s local storage; they are not sent to SoapSpice.</p>
            <button type="button" className="sl-add-toggle" onClick={() => { setFormOpen((open) => !open); setFormError(''); setNotice(''); }} aria-expanded={formOpen}>{formOpen ? 'Close form' : 'Add a private citation'}</button>
          </div>
          {notice && <p className="sl-storage-status" role="status">{notice}</p>}
          {formOpen && (
            <form className="sl-private-form" onSubmit={addCitation}>
              <div className="sl-form-grid">
                <label>Title <span>Required</span><input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Name this reference" /></label>
                <label>Publisher <span>Required</span><input required maxLength={120} value={form.publisher} onChange={(event) => setForm({ ...form, publisher: event.target.value })} placeholder="Organization or author" /></label>
                <label className="sl-form-wide">Publisher URL <span>Required</span><input required type="url" value={form.href} onChange={(event) => setForm({ ...form, href: event.target.value })} placeholder="https://…" /></label>
                <label>Kind<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as SoapmakingLibraryKind })}><option value="article">Article</option><option value="recipe">Recipe</option></select></label>
                <label>Topics <span>Optional · comma separated</span><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="safety, oils, beginner" /></label>
                <label className="sl-form-wide">Your short description <span>Optional</span><textarea rows={2} maxLength={500} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="What is this source about?" /></label>
                <label className="sl-form-wide">Private notes <span>Optional · stored only in this browser</span><textarea rows={3} maxLength={1200} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Your takeaways, questions, or batch ideas" /></label>
              </div>
              {formError && <p className="sl-form-message error" role="alert">{formError}</p>}
              <div className="sl-form-actions"><span><ShieldCheck size={14} aria-hidden="true" /> Browser-only storage</span><button type="submit">Save citation <BookOpen size={15} aria-hidden="true" /></button></div>
            </form>
          )}
          {!storageReady ? (
            <div className="sl-private-skeleton" aria-label="Loading private citations"><span /><span /></div>
          ) : filteredSaved.length ? (
            <div className="sl-saved-grid">
              {filteredSaved.map((item) => (
                <article className="sl-saved-card" key={item.id}>
                  <div className="sl-card-top"><span className={`sl-kind sl-kind-${item.kind}`}>{kindLabel(item.kind)}</span><span className="sl-browser-only">Saved in this browser</span></div>
                  <h3>{item.title}</h3>
                  <p className="sl-publisher">Publisher: <strong>{item.publisher}</strong></p>
                  {item.summary && <p className="sl-summary">{item.summary}</p>}
                  {item.notes && <div className="sl-notes"><span>Private note</span><p>{item.notes}</p></div>}
                  <div className="sl-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <div className="sl-saved-foot">
                    <a href={item.href} target="_blank" rel="noopener noreferrer">Open publisher <ExternalLink size={14} aria-hidden="true" /><span className="sl-sr-only"> (opens in a new tab)</span></a>
                    <button type="button" onClick={() => removeCitation(item.id)} aria-label={`Remove ${item.title}`}><Trash2 size={14} aria-hidden="true" /> Remove</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sl-personal-empty">
              <BookOpen size={22} aria-hidden="true" />
              <div><strong>{saved.length ? 'No private citations match these filters.' : 'Your private shelf is ready.'}</strong><p>{saved.length ? 'Try another search or kind.' : 'Add a citation to keep a useful publisher link and personal notes close at hand.'}</p></div>
              {saved.length > 0 && <button type="button" onClick={() => { setSearch(''); setKindFilter('all'); }}>Clear filters</button>}
            </div>
          )}
        </section>

        <aside className="sl-library-note">
          <ShieldCheck size={23} aria-hidden="true" />
          <div><strong>References are a starting point, not a safety check.</strong><p>External summaries are brief SoapSpice descriptions, not publisher text. Follow the publisher for complete instructions, verify every quantity, and use appropriate cold-process safety practices. Product links elsewhere on SoapSpice may include affiliate relationships; see our site disclosure for details.</p></div>
        </aside>
      </div>
    </div>
  );
}
