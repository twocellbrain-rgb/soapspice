import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'wouter';
import AmazonDisclosure from '@/components/AmazonDisclosure';
import { getAmazonLink } from '@/lib/amazon-links';
import { publishedSoapmakingPosts } from '@/data/published-soapmaking-posts';

const latestArticleSlugs = new Set(
  [...publishedSoapmakingPosts]
    .filter((entry) => entry.kind === 'article')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 2)
    .map((entry) => entry.slug),
);

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(parsed);
}

function ShoppingGroup({
  title,
  items,
  group,
}: {
  title: string;
  items: Array<{ id: string; name: string; searchTerm: string; note?: string }>;
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
        {items.map((item) => (
          <article className="scp-shopping-item" key={item.id} data-testid={`shopping-item-${group}-${item.id}`}>
            <div className="scp-shopping-item-copy">
              <span className="scp-checkmark" aria-hidden="true"><Check size={14} /></span>
              <div><h4>{item.name}</h4>{item.note && <p>{item.note}</p>}</div>
            </div>
          </article>
        ))}
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

  const shoppingLink = getAmazonLink(`soapspice-post-${post.slug}-shopping`, 'soap making supplies');

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
                <figcaption>{post.image.caption ?? 'SoapSpice editorial image'}</figcaption>
              </figure>
            )}
          </header>

          <div className="scp-article-layout">
            <div className="scp-article-body">
              {post.recipeDetails && (
                <section className="scp-recipe-formula" aria-labelledby="scp-recipe-formula-title" data-testid="recipe-formula">
                  <header className="scp-recipe-formula-header">
                    <p className="scp-section-label">The batch at a glance</p>
                    <h2 id="scp-recipe-formula-title">Cold-process soap formula</h2>
                  </header>
                  <dl className="scp-recipe-summary">
                    <div><dt>Yield</dt><dd>{post.recipeDetails.yield}</dd></div>
                    <div><dt>Total oils</dt><dd>{post.recipeDetails.oilWeight}</dd></div>
                    <div><dt>Superfat</dt><dd>{post.recipeDetails.superfat}</dd></div>
                    <div><dt>Cure</dt><dd>{post.recipeDetails.cure}</dd></div>
                    <div><dt>Fragrance</dt><dd>{post.recipeDetails.scent}</dd></div>
                  </dl>
                  <div className="scp-formula-table-wrap">
                    <table className="scp-formula-table">
                      <caption>Ingredients for one batch</caption>
                      <thead><tr><th scope="col">Ingredient</th><th scope="col">Amount</th><th scope="col">Oil share</th></tr></thead>
                      <tbody>
                        {post.recipeDetails.formula.map((item) => (
                          <tr key={item.name}>
                            <th scope="row">{item.name}{item.note && <small>{item.note}</small>}</th>
                            <td>{item.amount}</td>
                            <td>{item.oilShare ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="scp-recipe-notes">
                    {post.recipeDetails.notes.map((note, index) => <li key={`${post.slug}-recipe-note-${index}`}>{note}</li>)}
                  </ul>
                  <p className="scp-recipe-validation" role="note" data-testid="recipe-validation-note">{post.recipeDetails.validationNote}</p>
                  <Link href="/calculators/cold-process-soap" className="scp-recipe-calculator-link" data-testid="link-recipe-calculator">
                    Recalculate this batch in SoapSpice <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </section>
              )}
              {post.body.map((section, index) => (
                <section
                  key={`${post.slug}-section-${index}`}
                  id={`article-${post.slug}-section-${index + 1}`}
                  className="scp-body-section"
                  aria-labelledby={`article-${post.slug}-section-${index + 1}-heading`}
                  data-testid={`article-section-${index + 1}`}
                >
                  <p className="scp-body-number">{String(index + 1).padStart(2, '0')} <span>/</span></p>
                  <div>
                    <h2 id={`article-${post.slug}-section-${index + 1}-heading`}>{section.heading}</h2>
                    {section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${post.slug}-paragraph-${index}-${paragraphIndex}`}>{paragraph}</p>)}
                    {section.table && (
                      <div className="scp-formula-table-wrap">
                        <table className="scp-formula-table scp-content-table">
                          <caption>{section.table.caption}</caption>
                          <thead>
                            <tr>{section.table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rowIndex) => (
                              <tr key={`${post.slug}-table-row-${index}-${rowIndex}`}>
                                {row.map((cell, cellIndex) => cellIndex === 0
                                  ? <th scope="row" key={`${rowIndex}-${cellIndex}`}>{cell}</th>
                                  : <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {section.bullets && section.bullets.length > 0 && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={`${post.slug}-bullet-${index}-${bulletIndex}`}>{bullet}</li>)}</ul>}
                    {section.images && section.images.length > 0 && (
                      <div className="scp-step-images is-multi" role="group" aria-label={`Illustrations for ${section.heading}`}>
                        {section.images.map((image, imageIndex) => (
                          <figure className="scp-step-image" key={`${post.slug}-section-image-${index}-${imageIndex}`} data-testid="article-section-image">
                            <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
                            <figcaption>{image.caption}</figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                    {section.steps && section.steps.length > 0 && (
                      <ol className="scp-steps">
                        {section.steps.map((step, stepIndex) => {
                          const text = typeof step === 'string' ? step : step.text;
                          const images = typeof step === 'string' ? [] : step.images ?? [];
                          return (
                            <li key={`${post.slug}-step-${index}-${stepIndex}`}>
                              <span>{String(stepIndex + 1).padStart(2, '0')}</span>
                              <div className="scp-step-content">
                                <p className="scp-step-copy">{text}</p>
                                {images.length > 0 && (
                                  <div className={`scp-step-images${images.length > 1 ? ' is-multi' : ''}`}>
                                    {images.map((image, imageIndex) => (
                                      <figure className="scp-step-image" key={`${post.slug}-step-image-${stepIndex}-${imageIndex}`} data-testid="article-step-image">
                                        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
                                        <figcaption>{image.caption}</figcaption>
                                      </figure>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                </section>
              ))}
              {post.citations && post.citations.length > 0 && !latestArticleSlugs.has(post.slug) && (
                <aside className="scp-citations" aria-labelledby="scp-citations-title" data-testid="post-citations">
                  <div className="scp-citation-mark"><ExternalLink size={17} aria-hidden="true" /></div>
                  <div>
                    <p className="scp-section-label">Follow the source</p>
                    <h2 id="scp-citations-title">Further reading</h2>
                    <p className="scp-citation-context">{post.citationContext ?? 'This post uses a SoapSpice-written summary. Visit the publisher for its original content and instructions.'}</p>
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
              <ShoppingGroup title="Ingredients" items={post.ingredients} group="ingredient" />
              <ShoppingGroup title="Equipment" items={post.equipment} group="equipment" />
            </div>
            <div className="scp-shopping-action">
              <a
                className="amazon-price-button"
                href={shoppingLink.href}
                target="_blank"
                rel={shoppingLink.isAffiliate ? 'sponsored nofollow noopener' : 'nofollow noopener'}
                referrerPolicy="strict-origin-when-cross-origin"
                aria-label={`Find what you need at Amazon${shoppingLink.isAffiliate ? ', affiliate link, we may earn a commission' : ''} (opens in a new tab)`}
                data-testid="link-amazon-article-shopping"
              >
                Find what you need at Amazon
              </a>
              {shoppingLink.isAffiliate && <span className="amazon-affiliate-note">Affiliate link</span>}
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
