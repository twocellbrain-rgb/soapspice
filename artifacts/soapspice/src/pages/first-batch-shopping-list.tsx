import { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, ShoppingBasket, Wrench } from 'lucide-react';
import { Link } from 'wouter';
import AmazonDisclosure from '@/components/AmazonDisclosure';
import { buildFirstBatchShoppingList, type BatchShoppingItem } from '@/lib/first-batch-shopping';
import { loadPrintableFormula } from '@/lib/formula-sheet';

function ShoppingItem({ item }: { item: BatchShoppingItem }) {
  const isZeroFragrance = item.id.startsWith('fragrance-') && item.amount?.startsWith('0.00');
  return (
    <li className={`fb-item${isZeroFragrance ? ' fb-item-warning' : ''}`} data-testid={`shopping-item-${item.id}`}>
      <div className="fb-item-copy">
        <div className="fb-item-heading">
          <h3>{item.name}</h3>
          <span className={`fb-level ${item.level}`}>{item.level === 'verify' ? 'verify first' : item.level}</span>
        </div>
        {item.amount && <p className="fb-amount" data-testid={`text-amount-${item.id}`}>{item.amount}</p>}
        <p className="fb-detail">{item.detail}</p>
        {isZeroFragrance && (
          <p className="fb-zero-warning" role="note">
            Important: the calculator dose for this fragrance is zero. Do not add it to this batch unless you have checked a current supplier safety limit and recalculated the formula.
          </p>
        )}
      </div>
      <a
        className="fb-amazon-link print-hide"
        href={item.href}
        target="_blank"
        rel={item.isAffiliate ? 'sponsored nofollow noopener' : 'nofollow noopener'}
        referrerPolicy="strict-origin-when-cross-origin"
        aria-label={`Check Amazon for price: ${item.name}${item.isAffiliate ? ', paid link' : ''} (opens in a new tab)`}
        data-testid={`link-amazon-${item.id}`}
      >
        Check Amazon for price{item.isAffiliate && <span className="fb-paid">Paid link</span>}
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </li>
  );
}

function ItemSection({
  id,
  title,
  intro,
  items,
  icon,
}: {
  id: string;
  title: string;
  intro: string;
  items: BatchShoppingItem[];
  icon: 'basket' | 'tools' | 'safety';
}) {
  const Icon = icon === 'basket' ? ShoppingBasket : icon === 'tools' ? Wrench : ShieldCheck;
  return (
    <section className="fb-section" aria-labelledby={id}>
      <header className="fb-section-head">
        <span className={`fb-section-icon ${icon}`}><Icon size={20} aria-hidden="true" /></span>
        <div>
          <p className="fb-kicker">Your checklist</p>
          <h2 id={id}>{title}</h2>
          <p className="fb-section-intro">{intro}</p>
        </div>
      </header>
      {items.length > 0 ? (
        <ul className="fb-item-list">
          {items.map((item) => <ShoppingItem key={item.id} item={item} />)}
        </ul>
      ) : (
        <p className="fb-empty-note">Nothing is listed here for this batch.</p>
      )}
    </section>
  );
}

export default function FirstBatchShoppingListPage() {
  const [formula] = useState(loadPrintableFormula);

  if (!formula) {
    return (
      <main className="fb-page">
        <section className="fb-recovery" aria-labelledby="fb-recovery-title">
          <span className="fb-recovery-mark"><ShoppingBasket size={25} aria-hidden="true" /></span>
          <p className="fb-kicker">Your batch list</p>
          <h1 id="fb-recovery-title">Let’s bring your batch back.</h1>
          <p>
            We couldn’t find a validated formula snapshot in this browser. Head back to the calculator, review your ingredients, and validate the formula to make a fresh shopping list.
          </p>
          <Link href="/calculators/cold-process-soap" className="fb-primary-link" data-testid="link-recovery-calculator">
            Return to the calculator <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  const list = buildFirstBatchShoppingList(formula);
  const hasZeroFragrance = list.materials.some((item) => item.id.startsWith('fragrance-') && item.amount?.startsWith('0.00'));

  return (
    <main className="fb-page">
      <div className="fb-wrap">
        <Link href="/calculators/cold-process-soap" className="fb-back-link" data-testid="link-back-calculator">
          <ArrowLeft size={16} aria-hidden="true" /> Back to calculator
        </Link>

        <header className="fb-hero">
          <div className="fb-hero-copy">
            <p className="fb-kicker"><span /> SoapSpice · Your first batch, in order</p>
            <h1>Everything you need.<br /><em>Nothing to guess.</em></h1>
            <p className="fb-lede">
              A practical shopping checklist for <strong>{formula.name || 'your soap batch'}</strong>. Keep the calculator weights beside you as you shop and measure.
            </p>
            <div className="fb-hero-meta">
              <span><strong>01</strong> Exact batch weights</span>
              <span><strong>02</strong> Tools &amp; protection</span>
              <span><strong>03</strong> Ready when you are</span>
            </div>
          </div>
          <aside className="fb-batch-card" aria-label="Batch notes">
            <div className="fb-card-stamp"><ShieldCheck size={21} aria-hidden="true" /></div>
            <p className="fb-card-label">BEFORE YOU SHOP</p>
            <h2>Weigh it.<br />Don’t eyeball it.</h2>
            <p>Your list uses the calculator’s weight units: <strong>{list.unit}</strong>. No cup conversions, no volume estimates.</p>
            <div className="fb-card-rule"><span /> NaOH cold process <span /></div>
          </aside>
        </header>

        <div className="fb-main">
          <div className="fb-note-row">
            <div className="fb-naoh-note">
              <span className="fb-note-icon"><ShieldCheck size={19} aria-hidden="true" /></span>
              <p><strong>Sodium hydroxide means NaOH.</strong> This calculator assumes 100% NaOH purity. Check the product label and verify the formula before making your batch.</p>
            </div>
            {!list.fragranceSelected ? (
              <div className="fb-scent-note" role="status">
                <span className="fb-scent-dot" />
                <p><strong>Unscented batch.</strong> No fragrance was selected for this formula.</p>
              </div>
            ) : hasZeroFragrance ? (
              <div className="fb-scent-note warning" role="alert">
                <span className="fb-scent-dot" />
                <p><strong>Pause on fragrance.</strong> At least one calculator dose is zero; review the highlighted item before buying or using it.</p>
              </div>
            ) : (
              <div className="fb-scent-note" role="status">
                <span className="fb-scent-dot" />
                <p><strong>Fragrance selected.</strong> Confirm each dose against the supplier’s current limit before use.</p>
              </div>
            )}
          </div>

          <div className="fb-list-heading">
            <div>
              <p className="fb-kicker">The useful bit</p>
              <h2>Your shopping list</h2>
            </div>
            <p>Amazon opens in a new tab. Search results are not verified product recommendations; check the listing for fit and suitability.</p>
          </div>
          <div className="fb-disclosure-wrap"><AmazonDisclosure /></div>

          <div className="fb-content-grid">
            <div className="fb-primary-column">
              <ItemSection id="fb-materials-title" title="Batch materials" intro="The oils and measured ingredients your formula calls for." items={list.materials} icon="basket" />
            </div>
            <aside className="fb-side-column">
              <ItemSection id="fb-tools-title" title="Tools" intro="Set up a dedicated workspace before you begin." items={list.tools} icon="tools" />
              <ItemSection id="fb-safety-title" title="Safety equipment" intro="Protect your eyes and skin while handling NaOH." items={list.safety} icon="safety" />
            </aside>
          </div>

          <footer className="fb-footer-note">
            <div className="fb-safety-heading">
              <span className="fb-footer-mark">BEFORE YOU BEGIN</span>
              <h2>Safety, step by step</h2>
              <p>Cold-process soapmaking uses caustic sodium hydroxide. Set up carefully and follow product labels.</p>
            </div>
            <ul className="fb-safety-checklist">
              <li>Work with good ventilation.</li>
              <li>Keep children and pets out of the work area.</li>
              <li>Wear chemical splash goggles, compatible gloves, and long sleeves.</li>
              <li>Add NaOH slowly to liquid—never pour liquid onto NaOH.</li>
              <li>Never use aluminum for NaOH or soapmaking tools.</li>
            </ul>
          </footer>
          <p className="fb-formula-caveat"><strong>Important:</strong> The calculator assumes 100% NaOH purity and is not a substitute for a tested recipe. Formula amounts are weights, not volume measurements; use a scale and do not convert them to cups.</p>
        </div>
      </div>
    </main>
  );
}
