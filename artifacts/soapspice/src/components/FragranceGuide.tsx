import { CircleAlert } from 'lucide-react';
import { combinedScentStrength, fragranceScentGuide, GRAMS_PER_OUNCE, type FragranceRow } from '@/lib/formulation';
import { selectedSupplierFragrance } from '@/lib/supplier-fragrances';

type FragranceGuideProps = {
  fragrances: FragranceRow[];
  totalOilGrams: number;
  naohGrams: number;
};

const cell = 'px-4 py-3 text-sm';
const header = 'px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]';

function amount(grams: number, unit: 'g' | 'oz'): string {
  return (unit === 'g' ? grams : grams / GRAMS_PER_OUNCE).toFixed(2);
}

export default function FragranceGuide({ fragrances, totalOilGrams, naohGrams }: FragranceGuideProps) {
  if (fragrances.length === 0) return null;
  const combined = combinedScentStrength(fragrances, totalOilGrams, naohGrams);

  return (
    <section aria-labelledby="results-scent-heading" className="min-w-0 2xl:col-span-2">
      <h3 id="results-scent-heading" className="font-bold text-[hsl(var(--foreground))]">Scent strength &amp; IFRA screen</h3>
      <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        Guidance uses the unscented batch weight (oils + NaOH + estimated liquid), not oils alone.
        {' '}The medium scent starting point is 0.7 oz per lb of total soap. Light (0.35 oz/lb) and strong (1.00 oz/lb) are SoapSpice guide levels, not fragrance-specific recommendations.
      </p>

      <div className="mt-4 rounded-2xl border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] p-4 sm:p-5" data-testid="guide-combined-scent">
        <h4 className="text-xs font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">All fragrances combined</h4>
        <p className="mt-2 font-display text-xl text-[hsl(var(--foreground))]">
          {amount(combined.totalGrams, 'g')} g · {amount(combined.totalGrams, 'oz')} oz
        </p>
        <p className="mt-1 text-xs leading-5 text-[hsl(var(--foreground))]">
          {combined.ouncesPerPound.toFixed(2)} oz/lb of the {amount(combined.guideBatchGrams, 'g')} g unscented guide batch · <strong>{combined.strengthLabel}</strong> on the SoapSpice scent scale.
          {' '}This compares total scent strength only; it does not verify IFRA safety of a blend.
        </p>
      </div>

      <div className="mt-4 space-y-5">
        {fragrances.map((fragrance) => {
          const guide = fragranceScentGuide(fragrance, totalOilGrams, naohGrams, fragrances.length);
          const selectedSupplier = selectedSupplierFragrance(fragrance);
          const sourceIsLink = fragrance.ifraSourceUrl && /^https?:\/\//i.test(fragrance.ifraSourceUrl);
          const status = guide.maximumGrams === null
            ? 'No supplier IFRA maximum was entered. The automatic dose is held at zero; the general scent guide is not safety checked.'
            : guide.exceeds
              ? `Entered ${amount(guide.enteredGrams, 'g')} g exceeds the conservative ${amount(guide.maximumGrams, 'g')} g screen by ${amount(guide.enteredGrams - guide.maximumGrams, 'g')} g. Reduce the amount or verify the finished product with your supplier.`
              : `Entered ${amount(guide.enteredGrams, 'g')} g is within the conservative ${amount(guide.maximumGrams, 'g')} g screen. This does not certify the finished soap or a blend.`;
          return (
            <div key={fragrance.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 sm:p-5" data-testid={`guide-fragrance-${fragrance.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-xl">{fragrance.name}</h4>
                {sourceIsLink && <a href={fragrance.ifraSourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[hsl(var(--primary))] underline underline-offset-2">Supplier IFRA statement ↗</a>}
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Guide batch: {amount(guide.unscentedBatchGrams, 'g')} g · {amount(guide.unscentedBatchGrams, 'oz')} oz, before fragrance.
              </p>
              {selectedSupplier && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Supplier SKU {selectedSupplier.sku} · IFRA 51 Category 9 (soap) · statement assessed {selectedSupplier.assessedOn}. Check for a newer supplier statement before making.
                </p>
              )}
              <div
                role={guide.exceeds ? 'alert' : 'status'}
                className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold leading-5 ${guide.exceeds ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : guide.maximumGrams === null ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]'}`}
                data-testid={`status-ifra-${fragrance.id}`}
              >
                <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {status}
              </div>
              <div className="mt-3 overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-white">
                <table className="w-full min-w-[700px] border-collapse text-left" data-testid={`table-scent-guide-${fragrance.id}`}>
                  <caption className="sr-only">Whole-batch scent strength targets and supplier limit screening for {fragrance.name}</caption>
                  <thead className="bg-[hsl(var(--secondary)/.55)]">
                    <tr>
                      <th scope="col" className={header}>Scent level</th>
                      <th scope="col" className={header}>Concentration basis</th>
                      <th scope="col" className={`${header} text-right`}>Grams</th>
                      <th scope="col" className={`${header} text-right`}>Ounces</th>
                      <th scope="col" className={header}>IFRA check on equal share</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[hsl(var(--border))] bg-[hsl(var(--primary)/.04)]" data-testid={`row-guide-${fragrance.id}-maximum`}>
                      <th scope="row" className={`${cell} font-bold`}>Maximum <span className="block text-[10px] font-normal text-[hsl(var(--muted-foreground))]">Conservative screen, not a recommendation</span></th>
                      <td className={cell}>{guide.maximumGrams === null ? 'Supplier soap-specific rate needed' : `${fragrance.ifraMaxPercent}% of finished product (supplier rate)`}</td>
                      <td className={`${cell} text-right font-data`}>{guide.maximumGrams === null ? '—' : amount(guide.maximumGrams, 'g')}</td>
                      <td className={`${cell} text-right font-data`}>{guide.maximumGrams === null ? '—' : amount(guide.maximumGrams, 'oz')}</td>
                      <td className={cell}>{guide.maximumGrams === null ? 'Not checked' : 'Oil-weight screening ceiling'}</td>
                    </tr>
                    {guide.tiers.map((tier) => (
                      <tr key={tier.label} className="border-t border-[hsl(var(--border))]" data-testid={`row-guide-${fragrance.id}-${tier.label.toLowerCase()}`}>
                        <th scope="row" className={`${cell} font-medium`}>{tier.label}</th>
                        <td className={cell}>{tier.ouncesPerPound.toFixed(2)} oz/lb · {tier.percentOfBatch.toFixed(2)}% of guide batch · {amount(tier.grams / fragrances.length, 'g')} g per fragrance</td>
                        <td className={`${cell} text-right font-data`}>{amount(tier.grams, 'g')}</td>
                        <td className={`${cell} text-right font-data`}>{amount(tier.grams, 'oz')}</td>
                        <td className={`${cell} ${tier.exceeds ? 'font-bold text-[hsl(var(--destructive))]' : ''}`}>
                          {guide.maximumGrams === null ? 'Not checked' : tier.exceeds ? 'Above supplied limit' : 'Within screen'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        IFRA rates are stated for finished product. Because cured weight is unknown, the maximum shown uses oil weight as a conservative screening base; it is not an exact permitted dose or a compliance certificate. Strength rows are whole-batch targets repeated for context under each fragrance, not additive allowances; the target is split evenly first, then each fragrance is capped by its own screen, so the final blend can be below the target and uneven. Individual IFRA screens cannot assess shared restricted ingredients in a blend.
      </p>
    </section>
  );
}