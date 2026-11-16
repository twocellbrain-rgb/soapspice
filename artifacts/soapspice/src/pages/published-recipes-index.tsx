import { ArrowRight, BookOpen, FlaskConical, Leaf, LibraryBig } from 'lucide-react';
import { Link } from 'wouter';
import { publishedSoapmakingPosts } from '@/data/published-soapmaking-posts';

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(parsed);
}

export default function PublishedRecipesIndexPage() {
  const posts = [...publishedSoapmakingPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="scp-page" data-testid="page-published-recipes">
      <header className="scp-index-hero">
        <div className="scp-index-hero-inner">
          <div className="scp-index-copy">
            <p className="scp-kicker"><span aria-hidden="true" /> The SoapSpice journal</p>
            <h1>Good making<br /><em>starts with good notes.</em></h1>
            <p className="scp-intro">Thoughtful lessons and recipes for home soap makers—written to make the next step clearer, with sources and shopping details kept in view.</p>
            <div className="scp-index-meta">
              <span className="scp-meta-mark"><BookOpen size={17} aria-hidden="true" /></span>
              <span><strong>Learn at your own pace.</strong><br />Practical context for the work at your bench.</span>
            </div>
          </div>
          <aside className="scp-index-art" aria-label="SoapSpice editorial note">
            <span className="scp-art-overline">FIELD NOTES <i /> SMALL BATCH</span>
            <div className="scp-art-illustration" aria-hidden="true">
              <div className="scp-art-circle" />
              <div className="scp-art-bar scp-art-bar-one" />
              <div className="scp-art-bar scp-art-bar-two" />
              <div className="scp-art-leaf"><Leaf size={25} strokeWidth={1.6} /></div>
            </div>
            <p>Make room<br />for the why.</p>
            <span className="scp-art-caption">A useful read before the pour.</span>
          </aside>
        </div>
      </header>

      <div className="scp-index-main">
        <div className="scp-index-heading">
          <div>
            <p className="scp-section-label">The reading shelf</p>
            <h2>Recipes &amp; articles</h2>
          </div>
          <p className="scp-heading-aside">Owner-written guidance, with citations where a source deserves the credit.</p>
        </div>

        {posts.length === 0 ? (
          <section className="scp-empty-state" aria-labelledby="scp-empty-title" data-testid="empty-published-posts">
            <div className="scp-empty-visual" aria-hidden="true">
              <div className="scp-empty-sheet"><span /><span /><span /></div>
              <div className="scp-empty-sun" />
              <div className="scp-empty-stamp">SOON<br />ON THE<br />SHELF</div>
            </div>
            <div className="scp-empty-copy">
              <p className="scp-section-label">A little breathing room</p>
              <h3 id="scp-empty-title">The first notes are<br />still being gathered.</h3>
              <p>New SoapSpice recipes and lessons will appear here once they’re ready. In the meantime, start with the library’s source-aware reading shelf or our beginner guide to the essentials.</p>
              <div className="scp-empty-actions">
                <Link href="/soapmaking-library" className="scp-button-primary" data-testid="link-empty-soapmaking-library">
                  Visit the Soapmaking Library <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/how-to-start-soapmaking" className="scp-button-secondary" data-testid="link-empty-beginner-guide">
                  <FlaskConical size={16} aria-hidden="true" /> Read the beginner guide
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="scp-post-grid" data-testid="published-post-list">
            {posts.map((post, index) => (
              <article className="scp-post-card" key={post.slug} style={{ animationDelay: `${Math.min(index * 55, 275)}ms` }} data-testid={`card-published-post-${post.slug}`}>
                <Link href={`/recipes/${post.slug}`} className="scp-post-card-link" data-testid={`link-published-post-${post.slug}`}>
                  <div className="scp-post-card-image">
                    {post.image ? (
                      <img src={post.image.src} alt={post.image.alt} width={post.image.width} height={post.image.height} loading="lazy" />
                    ) : (
                      <div className="scp-card-art" aria-hidden="true"><span>{post.kind === 'recipe' ? 'A batch to make' : 'A note to keep'}</span><i /></div>
                    )}
                    <span className={`scp-kind-badge scp-kind-${post.kind}`}>{post.kind}</span>
                  </div>
                  <div className="scp-post-card-copy">
                    <p className="scp-post-date"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>{post.author && <><span aria-hidden="true">/</span><span>{post.author}</span></>}</p>
                    <h3>{post.title}</h3>
                    <p className="scp-post-excerpt">{post.excerpt}</p>
                    <span className="scp-read-link">Read {post.kind} <ArrowRight size={16} aria-hidden="true" /></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        <aside className="scp-index-footnote" data-testid="text-publishing-note">
          <LibraryBig size={19} aria-hidden="true" />
          <p><strong>Source-aware, always.</strong> When a post points to an outside source, you’ll find a SoapSpice summary and a link to the original publisher—not a copy of their article or photos.</p>
        </aside>
      </div>
    </div>
  );
}
