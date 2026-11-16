import { ArrowLeft, ArrowUpRight, BookOpen, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'wouter';
import AmazonDisclosure from '@/components/AmazonDisclosure';
import { getAmazonLink } from '@/lib/amazon-links';
import { publishedSoapmakingPosts } from '@/data/published-soapmaking-posts';

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(parsed);
}

function ShoppingGroup({
  title,
  items,
  postSlug,
  group,
}: {
  title: string;
  items: Array<{ id: string; name: string; searchTerm: string; note?: string }>;
  postSlug: string;
  group: 'ingredient' | 'equipment';
}) {
  if (!items.length) return null;
  return (
    <section className="scp-shopping-group" aria-labelledby={`scp-shopping-${group}`}>
      <div className="scp-shopping-group-heading">
        <span className="scp-shopping-index">{group === 'ingredient' ? '01' : '02'}</span>
        <div><p className="scp-section-label">Shopping list</p><h3 id={`scp-shopping-${group}`}>{title}</h3></div>
      </div>
      <div className="scp-shopping-items">
        {items.map((item) => {
          const link = getAmazonLink(`soapspice-post-${postSlug}-${group}-${item.id}`, item.searchTerm);
          return (
            <article className="scp-shopping-item" key={item.id} data-testid={`shopping-item-${group}-${item.id}`}>
              <div className="scp-shopping-item-copy">
                <span className="scp-checkmark" aria-hidden="true"><Check size={14} /></span>
                <div><h4>{item.name}</h4>{item.note && <p>{item.note}</p>}</div>
              </div>
              <div className="scp-shopping-cta">
                <a
                  className="amazon-price-button"
                  href={link.href}
                  target="_blank"
                  rel={link.isAffiliate ? 'sponsored nofollow noopener' : 'nofollow noopener'}
                  referrerPolicy="strict-origin-when-cross-origin"
                  aria-label={`Check Amazon for price: ${item.name}${link.isAffiliate ? ', affiliate link, we may earn a commission' : ''} (opens in a new tab)`}
                  data-testid={`link-amazon-${group}-${item.id}`}
                >
                  Check Amazon for price
                </a>
                {link.isAffiliate && <span className="amazon-affiliate-note">Affiliate link</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function PublishedSoapmakingPostPage() {
  const params = useParams<{ slug: string }>();
  const post = publishedSoapmakingPosts.find((entry) => entry.slug === params.slug);

  if (!post) {
    return (
      <div className="scp-page" data-testid="published-post-not-found">
        <div className="scp-not-found">
          <span className="scp-not-found-mark"><BookOpen size={24} aria-hidden="true" /></span>
          <p className="scp-section-label">Not on this shelf</p>
          <h1>That note isn’t here.</h1>
          <p>It may have moved, or it may not be published yet. Browse the current SoapSpice reading shelf instead.</p>
          <Link href="/recipes" className="scp-button-primary" data-testid="link-post-not-found-back"><ArrowLeft size={16} aria-hidden="true" /> Browse recipes &amp; articles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="scp-page" data-testid={`page-published-post-${post.slug}`}>
      <div className="scp-article-wrap">
        <nav className="scp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/recipes" data-testid="link-post-back"><ArrowLeft size={15} aria-hidden="true" /> Recipes &amp; articles</Link>
          <span aria-hidden="true">/</span><span>{post.kind}</span>
        </nav>
        <article className="scp-article">
          <header className="scp-article-header">
            <p className="scp-kicker"><span aria-hidden="true" /> SoapSpice field notes <i aria-hidden="true" /> {post.kind}</p>
            <h1>{post.title}</h1>
            <p className="scp-article-deck">{post.excerpt}</p>
            <div className="scp-article-byline">
              <span className="scp-byline-date"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>
              {post.author && <><span className="scp-byline-divider" aria-hidden="true" /><span>Words by {post.author}</span></>}
            </div>
            {post.image && (
              <figure className="scp-article-figure">
                <img src={post.image.src} alt={post.image.alt} width={post.image.width} height={post.image.height} />
                <figcaption>SoapSpice editorial image</figcaption>
              </figure>
            )}
          </header>

          <div className="scp-article-layout">
            <div className="scp-article-body">
              {post.body.map((section, index) => (
                <section key={`${post.slug}-section-${index}`} className="scp-body-section" data-testid={`article-section-${index + 1}`}>
                  <p className="scp-body-number">{String(index + 1).padStart(2, '0')} <span>/</span></p>
                  <div>
                    <h2>{section.heading}</h2>
                    {section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${post.slug}-paragraph-${index}-${paragraphIndex}`}>{paragraph}</p>)}
                    {section.bullets && section.bullets.length > 0 && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={`${post.slug}-bullet-${index}-${bulletIndex}`}>{bullet}</li>)}</ul>}
                    {section.steps && section.steps.length > 0 && <ol className="scp-steps">{section.steps.map((step, stepIndex) => <li key={`${post.slug}-step-${index}-${stepIndex}`}><span>{String(stepIndex + 1).padStart(2, '0')}</span>{step}</li>)}</ol>}
                  </div>
                </section>
              ))}
              {post.citations && post.citations.length > 0 && (
                <aside className="scp-citations" aria-labelledby="scp-citations-title" data-testid="post-citations">
                  <div className="scp-citation-mark"><ExternalLink size={17} aria-hidden="true" /></div>
                  <div>
                    <p className="scp-section-label">Follow the source</p>
                    <h2 id="scp-citations-title">Further reading</h2>
                    <p className="scp-citation-context">This post uses a SoapSpice-written summary. Visit the publisher for its original content and instructions.</p>
                    <ul>{post.citations.map((citation, index) => <li key={`${post.slug}-citation-${index}`}><a href={citation.url} target="_blank" rel="noopener noreferrer">{citation.title}<ArrowUpRight size={14} aria-hidden="true" /><span className="scp-sr-only"> (opens in a new tab)</span></a></li>)}</ul>
                  </div>
                </aside>
              )}
            </div>
            <aside className="scp-article-aside">
              <div className="scp-aside-card">
                <span className="scp-aside-icon"><ShieldCheck size={20} aria-hidden="true" /></span>
                <p className="scp-section-label">A careful reminder</p>
                <h2>Make with context.</h2>
                <p>Soapmaking guidance is educational. Check material specifications, verify quantities, and follow appropriate cold-process safety practices for your own setup.</p>
              </div>
              <div className="scp-aside-rule"><span /><span /><span /></div>
              <p className="scp-aside-small">Good notes help. They don’t replace checking your own materials and process.</p>
            </aside>
          </div>
        </article>

        {(post.ingredients.length > 0 || post.equipment.length > 0) && (
          <section className="scp-shopping" aria-labelledby="scp-shopping-title" data-testid="post-shopping">
            <header className="scp-shopping-header">
              <p className="scp-section-label">Gather what you need</p>
              <h2 id="scp-shopping-title">A considered shopping list.</h2>
              <p>These are search links, not verified product matches. Check product details and current prices with the seller before buying.</p>
            </header>
            <AmazonDisclosure />
            <div className="scp-shopping-groups">
              <ShoppingGroup title="Ingredients" items={post.ingredients} postSlug={post.slug} group="ingredient" />
              <ShoppingGroup title="Equipment" items={post.equipment} postSlug={post.slug} group="equipment" />
            </div>
          </section>
        )}

        <div className="scp-article-end">
          <span className="scp-end-mark" aria-hidden="true" />
          <p>Keep learning, one thoughtful batch at a time.</p>
          <Link href="/recipes" className="scp-text-link" data-testid="link-post-more"><ArrowLeft size={15} aria-hidden="true" /> Back to the reading shelf</Link>
        </div>
      </div>
    </div>
  );
}
