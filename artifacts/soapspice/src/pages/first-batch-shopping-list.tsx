import { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, ShoppingBasket, Wrench } from 'lucide-react';
import { Link } from 'wouter';
import AmazonDisclosure from '@/components/AmazonDisclosure';
import FirstBatchMethod from '@/components/FirstBatchMethod';
import { buildFirstBatchShoppingList, formatBatchWeight, type BatchShoppingItem } from '@/lib/first-batch-shopping';
import { loadPrintableFormula } from '@/lib/formula-sheet';
import { createStarterFormula } from '@/lib/starter-batch';

function ShoppingItem({ item }: { item: BatchShoppingItem }) {
  const isZeroFragrance = isZeroFragranceItem(item);
  return (
    <li className={`fb-item${!item.amount ? ' fb-item-supply' : ''}${isZeroFragrance ? ' fb-item-warning' : ''}`} data-testid={`shopping-item-${item.id}`}>
      <div className="fb-item-copy">
        <div className="fb-item-heading">
          <h3>{item.name}</h3>
          <span className={`fb-level ${item.level}`}>{item.level === 'verify' ? 'verify first' : item.level}</span>
        </div>
        <p className="fb-detail">{item.detail}</p>
        {isZeroFragrance && (
          <p className="fb-zero-warning" role="note">
            Important: the calculator dose for this fragrance is zero. Do not add it to this batch unless you have checked a current supplier safety limit and recalculated the formula.
          </p>
        )}
      </div>
      {item.amount && <p className="fb-amount" data-testid={`text-amount-${item.id}`}><span className="fb-amount-label">Measure</span>{item.amount}</p>}
      <AmazonLink item={item} />
    </li>
  );
}

type DisplayUnit = 'g' | 'oz';

function AmazonLink({ item }: { item: BatchShoppingItem }) {
  return (
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
      <ExternalLink size={16} aria-hidden="true" />
    </a>
  );
}

function isZeroFragranceItem(item: BatchShoppingItem) {
  return item.id.startsWith('fragrance-') && item.weightGrams === 0;
}

function MaterialsTable({ items, unit, onUnitChange }: { items: BatchShoppingItem[]; unit: DisplayUnit; onUnitChange: (unit: DisplayUnit) => void }) {
  const unitLabel = unit === 'oz' ? 'ounces' : 'grams';
  return (
    <section className="fb-section fb-materials" aria-labelledby="fb-materials-title">
      <header className="fb-section-head fb-materials-head">
        <span className="fb-section-icon basket"><ShoppingBasket size={20} aria-hidden="true" /></span>
        <div>
          <p className="fb-kicker">Step 1 of 3</p>
          <h2 id="fb-materials-title">Batch materials</h2>
          <p className="fb-section-intro">The oils and measured ingredients your formula calls for, with the weight to measure.</p>
        </div>
        <fieldset className="fb-unit-toggle print-hide" data-testid="unit-selector">
          <legend>Show weights in</legend>
          <div>
            {(['g', 'oz'] as const).map((option) => (
              <label key={option} className={unit === option ? 'is-active' : undefined}>
                <input
                  type="radio"
                  name="fb-display-unit"
                  value={option}
                  checked={unit === option}
                  onChange={() => onUnitChange(option)}
                  data-testid={`radio-unit-${option}`}
                />
                <span>{option === 'g' ? 'Grams (g)' : 'Ounces (oz)'}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </header>
      <p className="fb-sr-only" aria-live="polite">Weights shown in {unitLabel}.</p>
      <div className="fb-table-wrap">
        <table className="fb-table" data-testid="table-materials">
          <caption>Ingredients to weigh for this batch, shown in {unitLabel}. Display only; the formula is unchanged.</caption>
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">Weight ({unit})</th>
              <th scope="col">Note</th>
              <th scope="col" className="print-hide">Amazon</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const zero = isZeroFragranceItem(item);
              return (
                <tr key={item.id} className={zero ? 'fb-row-warning' : undefined} data-testid={`shopping-item-${item.id}`}>
                  <th scope="row" data-label="Ingredient">
                    <span className="fb-row-name">{item.name}</span>
                    <span className={`fb-level ${item.level}`}>{item.level === 'verify' ? 'verify first' : item.level}</span>
                  </th>
                  <td data-label="Weight" className="fb-cell-amount">
                    <span className="fb-amount" data-testid={`text-amount-${item.id}`}>{item.amount}</span>
                  </td>
                  <td data-label="Note" className="fb-cell-note">
                    <p className="fb-detail">{item.detail}</p>
                    {zero && (
                      <p className="fb-zero-warning" role="note">
                        Important: the calculator dose for this fragrance is zero. Do not add it to this batch unless you have checked a current supplier safety limit and recalculated the formula.
                      </p>
                    )}
                  </td>
                  <td className="fb-cell-link print-hide"><AmazonLink item={item} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ItemSection({
  id,
  title,
  intro,
  items,
  icon,
  step,
}: {
  step: string;
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
          <p className="fb-kicker">Step {step} of 3</p>
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
  const [{ formula, isExample }] = useState(() => {
    const stored = loadPrintableFormula();
    const hasDraft = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('draft');
    return { formula: stored ?? (hasDraft ? null : createStarterFormula()), isExample: !stored && !hasDraft };
  });
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>(() => (formula?.oilInputUnit === 'oz' ? 'oz' : 'g'));

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

  const list = buildFirstBatchShoppingList(formula, displayUnit);
  const hasZeroFragrance = list.materials.some(isZeroFragranceItem);
  const totalOilGrams = formula.oils.reduce((sum, oil) => sum + oil.weight, 0);
  const totalOils = formatBatchWeight(totalOilGrams, list.unit);

  return (
    <main className="fb-page">
      <div className="fb-wrap">
        <Link href="/calculators/cold-process-soap" className="fb-back-link" data-testid="link-back-calculator">
          <ArrowLeft size={16} aria-hidden="true" /> Back to calculator
        </Link>

        <header className="fb-hero">
          <div className="fb-hero-copy">
            <p className="fb-kicker"><span /> SoapSpice · Your first batch, in order</p>
            <h1>Everything you need.<br /><em>A clear place to start.</em></h1>
            <p className="fb-lede">
              A practical shopping checklist for <strong>{isExample ? 'your unscented starter batch' : formula.name || 'your soap batch'}</strong>. Keep the calculator weights beside you as you shop and measure.
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
            <p>Weights are shown in <strong data-testid="text-display-unit">{list.unit === 'oz' ? 'ounces (oz)' : 'grams (g)'}</strong> for <strong data-testid="text-total-oils">{totalOils}</strong> of oils. Switch units in the table; the formula stays the same. No cup conversions, no volume estimates.</p>
            <div className="fb-card-rule"><span /> NaOH cold process <span /></div>
          </aside>
        </header>

        <div className="fb-main">
          {isExample && <section className="fb-starter-notice" aria-labelledby="fb-starter-title" data-testid="notice-starter-example">
            <p className="fb-kicker"><span /> Calculator-generated example</p>
            <h2 id="fb-starter-title">Your first-batch planning guide</h2>
            <p>This list is built from a SoapSpice calculator example so you can see what a first batch involves: <strong>{totalOils} of oils</strong> (70% olive oil, 20% coconut oil 76°, 10% shea butter), <strong>5% superfat</strong>, and <strong>unscented</strong>. The NaOH and liquid weights below come straight from the calculator. Use the liquid amount as a cold-process starting estimate and review it against your chosen soapmaking method.</p>
            <p>Before you make soap, check your exact oil grades, your supplier’s SAP values, and the NaOH purity on the label. Want your own amounts? Validate your formula in the calculator and choose “First-batch shopping list” on the results page to open your actual batch here.</p>
            <Link href="/calculators/cold-process-soap" className="fb-primary-link">Calculate your own batch <ArrowRight size={17} aria-hidden="true" /></Link>
          </section>}
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
            <MaterialsTable items={list.materials} unit={list.unit} onUnitChange={setDisplayUnit} />
            <ItemSection id="fb-tools-title" step="2" title="Tools" intro="Set up a dedicated workspace before you begin." items={list.tools} icon="tools" />
            <ItemSection id="fb-safety-title" step="3" title="Safety equipment" intro="Protect your eyes and skin while handling NaOH." items={list.safety} icon="safety" />
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
          <FirstBatchMethod isExample={isExample} />
        </div>
      </div>
    </main>
  );
}
