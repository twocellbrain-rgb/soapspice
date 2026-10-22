import { useMemo, useState } from 'react';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, BookMarked, BookOpen, CircleAlert, ExternalLink, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import {
  getListSoapmakingLibraryQueryKey,
  useDeleteSoapmakingLibraryItem,
  useListSoapmakingLibrary,
  useSaveSoapmakingLibraryItem,
} from '@workspace/api-client-react';
import type { SoapmakingLibraryInput, SoapmakingLibraryItem } from '@workspace/api-client-react';
import { Form } from '@/components/ui/form';

const kinds = ['article', 'recipe', 'tutorial', 'safety', 'other'] as const;
type LibraryKind = typeof kinds[number];
type SourceFormValues = Omit<SoapmakingLibraryInput, 'tags'> & { tagsText: string };

function kindLabel(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function ItemCard({ item, deleting, onDelete, confirming, onConfirm, onCancel }: {
  item: SoapmakingLibraryItem;
  deleting: boolean;
  onDelete: () => void;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <article className="sl-card" data-testid={`card-library-item-${item.id}`}>
      <div className="sl-card-top">
        <span className={`sl-kind sl-kind-${item.kind}`} data-testid={`text-library-kind-${item.id}`}>{kindLabel(item.kind)}</span>
        <span className="sl-source-name">{item.sourceName}</span>
      </div>
      <h2 data-testid={`text-library-title-${item.id}`}>{item.title}</h2>
      <p className="sl-byline">{item.author ? `${item.author} · ` : ''}<a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-library-source-${item.id}`}>Open source <ExternalLink size={13} aria-hidden="true" /></a></p>
      {item.summary && <p className="sl-summary" data-testid={`text-library-summary-${item.id}`}>{item.summary}</p>}
      {item.notes && <div className="sl-notes"><span>My notes</span><p data-testid={`text-library-notes-${item.id}`}>{item.notes}</p></div>}
      {item.tags.length > 0 && <div className="sl-tags" aria-label="Tags">{item.tags.map((tag) => <span key={tag} data-testid={`tag-library-${item.id}-${tag}`}>{tag}</span>)}</div>}
      <div className="sl-card-foot">
        <time dateTime={item.createdAt} data-testid={`text-library-date-${item.id}`}>Saved {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
        {confirming ? (
          <div className="sl-confirm">
            <span>Remove this source?</span>
            <button type="button" onClick={onConfirm} disabled={deleting} data-testid={`button-confirm-delete-${item.id}`}>{deleting ? 'Removing…' : 'Remove'}</button>
            <button type="button" onClick={onCancel} disabled={deleting} data-testid={`button-cancel-delete-${item.id}`}>Keep</button>
          </div>
        ) : (
          <button type="button" className="sl-delete" onClick={onDelete} aria-label={`Remove ${item.title}`} data-testid={`button-delete-library-item-${item.id}`}><Trash2 size={15} aria-hidden="true" /> Remove</button>
        )}
      </div>
    </article>
  );
}

export default function SoapmakingLibraryPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const client = useQueryClient();
  const queryKey = getListSoapmakingLibraryQueryKey();
  const query = useListSoapmakingLibrary({ query: { enabled: Boolean(isSignedIn), queryKey } });
  const save = useSaveSoapmakingLibraryItem();
  const remove = useDeleteSoapmakingLibraryItem();
  const [publicQuery, setPublicQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | LibraryKind>('all');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const form = useForm<SourceFormValues>({
    defaultValues: { title: '', sourceUrl: '', sourceName: '', kind: 'article', author: '', summary: '', notes: '', tagsText: '' },
  });
  const sources = query.data ?? [];
  const filteredSources = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase();
    return sources.filter((item) => {
      const searchable = [item.title, item.sourceName, item.author, item.summary, item.notes, ...item.tags].join(' ').toLowerCase();
      return (kindFilter === 'all' || item.kind === kindFilter) && (!normalized || searchable.includes(normalized));
    });
  }, [sources, filterQuery, kindFilter]);
  const duckDuckGoUrl = `https://duckduckgo.com/?q=${encodeURIComponent(publicQuery.trim() || 'cold process soapmaking')}`;

  function handleSave(values: SourceFormValues) {
    setFormError('');
    setSaveSuccess(false);
    const rawTags = values.tagsText;
    const tags = [...new Set(rawTags.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
    const payload: SoapmakingLibraryInput = {
      title: values.title.trim(),
      sourceUrl: values.sourceUrl.trim(),
      sourceName: values.sourceName.trim(),
      kind: values.kind,
      ...(values.author?.trim() ? { author: values.author.trim() } : {}),
      ...(values.summary?.trim() ? { summary: values.summary.trim() } : {}),
      ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      ...(tags.length ? { tags } : {}),
    };
    save.mutate({ data: payload }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey });
        form.reset();
        setSaveSuccess(true);
      },
      onError: () => setFormError('That source could not be saved. Check the details and try again.'),
    });
  }

  function deleteItem(id: string) {
    remove.mutate({ articleId: id }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey });
        setPendingDelete(null);
      },
    });
  }

  return (
    <div className="sl-page">
      <header className="sl-hero">
        <div className="sl-hero-inner">
          <div className="sl-hero-copy">
            <p className="sl-eyebrow"><span /> A working shelf for curious makers</p>
            <h1>Good sources<br /><em>make better batches.</em></h1>
            <p className="sl-lede">Keep the recipes, safety guidance, and ingredient notes you want close at hand. A citation stays a citation: we save the link and your notes, never a copy of the page.</p>
            <div className="sl-hero-proof"><ShieldCheck size={17} aria-hidden="true" /><span>Thoughtful references, always linked back to their source.</span></div>
          </div>
          <aside className="sl-shelf-art" aria-label="Library note">
            <div className="sl-shelf-stamp"><BookOpen size={27} aria-hidden="true" /></div>
            <span className="sl-shelf-label">FIELD NOTES / 01</span>
            <p>Follow the thread<br />from source to soap.</p>
            <span className="sl-shelf-line" />
          </aside>
        </div>
      </header>

      <main className="sl-main">
        <section className="sl-search-panel" aria-labelledby="sl-search-title">
          <div className="sl-search-copy">
            <span className="sl-section-kicker">Find your next good read</span>
            <h2 id="sl-search-title">Search the wider web</h2>
            <p>Search DuckDuckGo for soapmaking sources. Results open there; save a useful citation to your shelf when you are signed in.</p>
          </div>
          <form className="sl-web-search" onSubmit={(event) => { event.preventDefault(); window.open(duckDuckGoUrl, '_blank', 'noopener,noreferrer'); }} data-testid="form-web-search">
            <label className="sl-sr-only" htmlFor="sl-public-search">Search soapmaking sources on the web</label>
            <div className="sl-search-input-wrap"><Search size={18} aria-hidden="true" /><input id="sl-public-search" value={publicQuery} onChange={(event) => setPublicQuery(event.target.value)} placeholder="Try “olive oil soap recipe”" data-testid="input-public-search" /></div>
            <a href={duckDuckGoUrl} target="_blank" rel="noopener noreferrer" className="sl-search-button" data-testid="link-public-search">Search the web <ArrowUpRight size={16} aria-hidden="true" /></a>
          </form>
          <p className="sl-search-note">External search via DuckDuckGo. No results are collected or copied into SoapSpice.</p>
        </section>

        {!isLoaded ? (
          <div className="sl-auth-skeleton" aria-label="Checking sign-in status" data-testid="status-auth-loading"><span /><span /><span /></div>
        ) : !isSignedIn ? (
          <section className="sl-private-gate" data-testid="status-library-sign-in">
            <div className="sl-gate-icon"><BookMarked size={24} aria-hidden="true" /></div>
            <div><span className="sl-section-kicker">Your private shelf</span><h2>Sign in to save and revisit sources.</h2><p>Your library is personal to your account. The web search above stays open to everyone.</p></div>
            <Link href="/sign-in" className="sl-signin-link" data-testid="link-library-sign-in">Sign in <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </section>
        ) : (
          <div className="sl-library-layout">
            <section className="sl-saved-area" aria-labelledby="sl-saved-title">
              <div className="sl-section-heading">
                <div><span className="sl-section-kicker">Your collection</span><h2 id="sl-saved-title">Saved sources</h2></div>
                {!query.isLoading && !query.isError && <span className="sl-count" data-testid="text-library-count">{sources.length} {sources.length === 1 ? 'source' : 'sources'}</span>}
              </div>
              <div className="sl-library-controls">
                <label className="sl-library-search"><Search size={17} aria-hidden="true" /><span className="sl-sr-only">Search saved sources</span><input type="search" value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} placeholder="Search titles, notes, tags…" data-testid="input-library-search" /></label>
                <label className="sl-select-label"><span className="sl-sr-only">Filter by source type</span><select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as 'all' | LibraryKind)} data-testid="select-library-kind"><option value="all">All kinds</option>{kinds.map((kind) => <option key={kind} value={kind}>{kindLabel(kind)}</option>)}</select></label>
              </div>
              {query.isLoading && <div className="sl-card-grid" aria-label="Loading saved sources" data-testid="status-library-loading">{[1, 2, 3].map((item) => <div className="sl-skeleton-card" key={item}><span /><span /><span /></div>)}</div>}
              {query.isError && <div className="sl-error" role="alert" data-testid="status-library-error"><CircleAlert size={20} aria-hidden="true" /><div><strong>Your shelf did not load.</strong><p>Please try again in a moment.</p></div><button type="button" onClick={() => void query.refetch()} data-testid="button-retry-library">Try again</button></div>}
              {!query.isLoading && !query.isError && filteredSources.length === 0 && (
                <div className="sl-empty" data-testid="status-library-empty">
                  <BookOpen size={25} aria-hidden="true" />
                  <h3>{sources.length ? 'No sources match those filters.' : 'Your shelf is ready for its first source.'}</h3>
                  <p>{sources.length ? 'Try another search or choose a different kind.' : 'Add a useful recipe, article, tutorial, or safety reference using the form.'}</p>
                  {sources.length > 0 && <button type="button" onClick={() => { setFilterQuery(''); setKindFilter('all'); }} data-testid="button-clear-library-filters">Clear filters</button>}
                </div>
              )}
              {!query.isLoading && !query.isError && filteredSources.length > 0 && <div className="sl-card-grid">{filteredSources.map((item) => <ItemCard key={item.id} item={item} deleting={remove.isPending && remove.variables?.articleId === item.id} confirming={pendingDelete === item.id} onDelete={() => setPendingDelete(item.id)} onConfirm={() => deleteItem(item.id)} onCancel={() => setPendingDelete(null)} />)}</div>}
            </section>

            <aside className="sl-add-panel">
              <div className="sl-add-heading"><span className="sl-add-number">01</span><div><span className="sl-section-kicker">Keep the good bits</span><h2>Add a source</h2></div></div>
              <p className="sl-add-intro">Save the details that help you find and use this reference later.</p>
              <Form {...form}><form className="sl-source-form" onSubmit={form.handleSubmit(handleSave)} data-testid="form-save-library-item">
                <label>Title <span className="sl-required">Required</span><input {...form.register('title', { required: true, maxLength: 240 })} placeholder="A clear, recognizable title" data-testid="input-source-title" /></label>
                <label>Source URL <span className="sl-required">Required</span><input {...form.register('sourceUrl', { required: true, maxLength: 2000 })} type="url" placeholder="https://…" data-testid="input-source-url" /></label>
                <label>Publisher or source name <span className="sl-required">Required</span><input {...form.register('sourceName', { required: true, maxLength: 160 })} placeholder="Publisher, author site, or organization" data-testid="input-source-name" /></label>
                <div className="sl-form-row">
                  <label>Kind<select {...form.register('kind')} data-testid="select-source-kind">{kinds.map((kind) => <option key={kind} value={kind}>{kindLabel(kind)}</option>)}</select></label>
                  <label>Author <span className="sl-optional">Optional</span><input {...form.register('author', { maxLength: 160 })} placeholder="Name" data-testid="input-source-author" /></label>
                </div>
                <label>Short summary <span className="sl-optional">Optional</span><textarea {...form.register('summary', { maxLength: 600 })} rows={3} placeholder="What makes this source useful?" data-testid="input-source-summary" /></label>
                <label>Personal notes <span className="sl-optional">Optional</span><textarea {...form.register('notes', { maxLength: 1200 })} rows={3} placeholder="Your takeaways, questions, or batch ideas" data-testid="input-source-notes" /></label>
                <label>Tags <span className="sl-optional">Optional · comma separated, up to 12</span><input {...form.register('tagsText')} placeholder="olive oil, safety, beginner" data-testid="input-source-tags" /></label>
                {formError && <p className="sl-form-message error" role="alert" data-testid="status-save-error">{formError}</p>}
                {saveSuccess && <p className="sl-form-message success" role="status" data-testid="status-save-success">Source saved to your library.</p>}
                <button type="submit" disabled={save.isPending} className="sl-submit" data-testid="button-save-library-item">{save.isPending ? 'Saving source…' : 'Save citation'} <BookMarked size={16} aria-hidden="true" /></button>
                <p className="sl-privacy-note"><ShieldCheck size={14} aria-hidden="true" /> Only citation details and your notes are stored.</p>
              </form></Form>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
