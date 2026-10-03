import { useState } from 'react';
import { CircleAlert, Plus, Trash2 } from 'lucide-react';
import type { FragranceRow, ScentStrength } from '@/lib/formulation';
import { fragranceIfraScreen, fragranceWeightGrams, fragrancesAtDoseTarget, scentStrengthAmounts } from '@/lib/formulation';
import { BRAMBLE_BERRY_FRAGRANCES, chooseSupplierFragrance, renameFragrance, selectedSupplierFragrance } from '@/lib/supplier-fragrances';

type FragranceSectionProps = {
  fragrances: FragranceRow[];
  totalOilGrams: number;
  onChange: (next: FragranceRow[]) => void;
  scentStrength: ScentStrength;
  onScentStrengthChange: (strength: ScentStrength) => void;
  strengthAmounts: ReturnType<typeof scentStrengthAmounts>;
};

const fieldClass =
  'h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] outline-none transition-colors focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)]';

function displayGrams(grams: number) {
  return Number.isFinite(grams) ? grams.toFixed(2) : '0.00';
}

function displayAmount(amount: number, unit: FragranceRow['unit']) {
  return Number.isFinite(amount) ? amount.toFixed(unit === 'percent' ? 3 : 2) : '0.00';
}

function amountUnitLabel(unit: FragranceRow['unit']) {
  return unit === 'percent' ? '% of oils' : unit;
}

export default function FragranceSection({
  fragrances,
  totalOilGrams,
  onChange,
  scentStrength,
  onScentStrengthChange,
  strengthAmounts,
}: FragranceSectionProps) {
  const [unscentedConfirmed, setUnscentedConfirmed] = useState(false);
  const updateRow = (id: string, changes: Partial<FragranceRow>) => {
    onChange(fragrances.map((row) => row.id === id ? { ...row, ...changes } : row));
  };
  const replaceRow = (id: string, next: FragranceRow) => {
    onChange(fragrances.map((row) => row.id === id ? next : row));
  };

  const addRow = () => {
    setUnscentedConfirmed(false);
    onChange([...fragrances, { id: crypto.randomUUID(), name: '', amount: 0, unit: 'g' }]);
  };

  const totalGrams = fragrances.reduce(
    (sum, row) => sum + fragranceWeightGrams(row, totalOilGrams),
    0,
  );

  return (
    <section
      aria-labelledby="fragrance-heading"
      className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7"
    >
      <div className="flex flex-col gap-5 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 03 / optional</p>
          <h2 id="fragrance-heading" className="mt-2 font-display text-3xl text-[hsl(var(--foreground))]">Add your fragrance</h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Choose a fragrance from the menu. The calculator sets its amount from your batch size and selected scent strength.
          </p>
        </div>
        {fragrances.length > 0 && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            data-testid="button-add-fragrance"
          >
            <Plus size={17} aria-hidden="true" /> Add another fragrance
          </button>
        )}
      </div>

      {fragrances.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5 sm:p-6" data-testid="prompt-add-fragrance">
          <h3 className="font-bold text-[hsl(var(--foreground))]">Are you adding fragrance to this batch?</h3>
          <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">You can leave it unscented, or choose a fragrance and let the calculator set the amount.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setUnscentedConfirmed(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))]"
              data-testid="button-no-fragrance"
            >
              No, keep it unscented
            </button>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white transition hover:brightness-95"
              data-testid="button-add-fragrance"
            >
              <Plus size={16} aria-hidden="true" /> Yes, choose a fragrance
            </button>
          </div>
          {unscentedConfirmed && <p className="mt-3 text-xs font-semibold text-[hsl(var(--primary))]" role="status">Unscented batch selected. You can add a fragrance later.</p>}
        </div>
      ) : (
        <section className="mt-6 rounded-2xl border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.04)] p-4 sm:p-5" aria-labelledby="fragrance-strength-heading" data-testid="fragrance-strength-picker">
          <h3 id="fragrance-strength-heading" className="font-bold text-[hsl(var(--foreground))]">Choose a scent strength for the whole batch</h3>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Amounts use the unscented batch estimate (oils, NaOH, and estimated liquid). Multiple fragrances share the total evenly, then each amount is capped at its conservative IFRA screen. Without a valid supplier maximum, that fragrance stays at 0 until you enter one.
          </p>
          {totalOilGrams <= 0 || strengthAmounts.every((tier) => tier.grams <= 0) ? (
            <p className="mt-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]" role="status">Complete valid oil weights and SAP details to calculate fragrance amounts.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {strengthAmounts.map((tier) => {
                const selected = scentStrength === tier.key;
                const cappedRows = fragrancesAtDoseTarget(fragrances, tier.grams, totalOilGrams);
                const cappedBatchGrams = cappedRows.reduce(
                  (sum, row) => sum + fragranceWeightGrams(row, totalOilGrams),
                  0,
                );
                const isCapped = cappedBatchGrams + 1e-9 < tier.grams;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onScentStrengthChange(tier.key)}
                    className={`grid gap-1 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${selected ? 'border-[hsl(var(--primary))] bg-white shadow-sm ring-2 ring-[hsl(var(--primary)/.15)]' : 'border-[hsl(var(--border))] bg-white/70 hover:border-[hsl(var(--primary)/.6)]'}`}
                    data-testid={`button-scent-strength-${tier.key}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground))]">{tier.label}</span>
                    <span className="font-data text-lg font-bold text-[hsl(var(--primary))]" data-testid={`text-scent-dose-${tier.key}`}>{displayGrams(cappedBatchGrams)} g</span>
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{(cappedBatchGrams / 28.349523125).toFixed(2)} oz total after IFRA screens</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {isCapped ? `Guide target ${displayGrams(tier.grams)} g · reduced by IFRA limit(s)` : `Guide target ${displayGrams(tier.grams)} g`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div className="space-y-3 pt-6">
        {fragrances.map((row, index) => {
          const grams = fragranceWeightGrams(row, totalOilGrams);
          const ifra = fragranceIfraScreen(row, totalOilGrams);
          const targetPerFragranceGrams = (strengthAmounts.find((tier) => tier.key === scentStrength)?.grams ?? 0) / fragrances.length;
          const cappedByIfra = ifra.maximumGrams !== null && targetPerFragranceGrams > ifra.maximumGrams + 1e-9;
          const selectedSupplier = selectedSupplierFragrance(row);
          return (
            <div
              key={row.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
              data-testid={`row-fragrance-${row.id}`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                  Fragrance {String(index + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(fragrances.filter((item) => item.id !== row.id))}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                  aria-label={`Remove fragrance ${index + 1}${row.name ? `, ${row.name}` : ''}`}
                  data-testid={`button-remove-fragrance-${row.id}`}
                >
                  <Trash2 size={15} aria-hidden="true" /> Remove
                </button>
              </div>
              <div className="mb-4 rounded-xl border border-[hsl(var(--primary)/.25)] bg-white p-3">
                <label htmlFor={`supplier-fragrance-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Choose a documented fragrance <span className="font-normal text-[hsl(var(--muted-foreground))]">(or choose manual entry)</span></label>
                <select
                  id={`supplier-fragrance-${row.id}`}
                  value={selectedSupplier?.sku ?? ''}
                  onChange={(event) => replaceRow(row.id, chooseSupplierFragrance(row, event.target.value))}
                  className={fieldClass}
                  data-testid={`select-supplier-fragrance-${row.id}`}
                >
                  <option value="">Manual / another supplier</option>
                  {BRAMBLE_BERRY_FRAGRANCES.map((product) => (
                    <option key={product.sku} value={product.sku}>{product.name} · {product.sku}</option>
                  ))}
                </select>
                {selectedSupplier ? (
                  <p className="mt-2 text-xs leading-5 text-[hsl(var(--primary))]" data-testid={`supplier-source-${row.id}`}>
                    <strong>{selectedSupplier.ifraMaxPercent}% IFRA 51 Category 9 (soap)</strong> · SKU {selectedSupplier.sku} · statement assessed {selectedSupplier.assessedOn}.{' '}
                    <a href={selectedSupplier.productUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">Supplier product</a> ·{' '}
                    <a href={selectedSupplier.ifraUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">IFRA statement</a>.
                    {' '}Recheck the current statement before making a batch.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Choose one of the six source-linked menu options, or enter another supplier’s fragrance and its own IFRA limit below. Similar names are not interchangeable.</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(240px,.8fr)]">
                <div>
                  <label htmlFor={`fragrance-name-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Fragrance name</label>
                  <input
                    id={`fragrance-name-${row.id}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => replaceRow(row.id, renameFragrance(row, event.target.value))}
                    placeholder="Choose from the menu or enter another fragrance"
                    autoComplete="off"
                    className={fieldClass}
                    data-testid={`input-fragrance-name-${row.id}`}
                  />
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] px-3 py-2">
                  <div className="grid grid-cols-[minmax(0,1fr)_115px] items-end gap-3">
                    <div>
                      <span className="text-xs font-bold text-[hsl(var(--foreground))]">Calculated amount</span>
                      <p className="mt-1 font-data text-lg font-bold text-[hsl(var(--primary))]" data-testid={`text-fragrance-amount-${row.id}`}>
                        {displayAmount(row.amount, row.unit)} {amountUnitLabel(row.unit)}
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Unit</span>
                      <select
                        value={row.unit}
                        onChange={(event) => updateRow(row.id, { unit: event.target.value as FragranceRow['unit'] })}
                        className={`${fieldClass} h-9 px-2 text-xs`}
                        data-testid={`select-fragrance-unit-${row.id}`}
                      >
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="percent">% of oil weight</option>
                      </select>
                    </label>
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
                    <span data-testid={`text-fragrance-grams-${row.id}`}>{displayGrams(grams)} g equivalent</span> · updates with batch size, strength, and IFRA limit.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 border-t border-[hsl(var(--border))] pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`fragrance-ifra-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Supplier IFRA maximum for bar soap (%)</label>
                  <input
                    id={`fragrance-ifra-${row.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    inputMode="decimal"
                    value={row.ifraMaxPercent ?? ''}
                    readOnly={Boolean(selectedSupplier)}
                    onChange={(event) => {
                      if (!selectedSupplier) updateRow(row.id, { ifraMaxPercent: event.target.value === '' ? undefined : Number(event.target.value) });
                    }}
                    placeholder="From this fragrance’s IFRA statement"
                    className={`${fieldClass} font-data ${selectedSupplier ? 'bg-[hsl(var(--secondary)/.6)]' : ''}`}
                    data-testid={`input-fragrance-ifra-${row.id}`}
                  />
                  <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{selectedSupplier ? 'Filled from the linked supplier statement. Switch to manual above to enter a different rate.' : 'Use the rate for this exact fragrance and soap application, as % of finished product. Enter 0 if not permitted.'}</p>
                </div>
                <div>
                  {selectedSupplier ? (
                    <span className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Supplier IFRA document link</span>
                  ) : (
                    <label htmlFor={`fragrance-ifra-source-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Supplier IFRA document link <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label>
                  )}
                  {selectedSupplier ? (
                    <a
                      id={`fragrance-ifra-source-${row.id}`}
                      href={selectedSupplier.ifraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${fieldClass} inline-flex items-center font-semibold text-[hsl(var(--primary))] underline underline-offset-2`}
                      data-testid={`link-fragrance-ifra-source-${row.id}`}
                    >
                      View linked supplier statement ↗
                    </a>
                  ) : (
                    <input
                      id={`fragrance-ifra-source-${row.id}`}
                      type="url"
                      maxLength={500}
                      value={row.ifraSourceUrl ?? ''}
                      onChange={(event) => updateRow(row.id, { ifraSourceUrl: event.target.value || undefined })}
                      placeholder="https://supplier.example/ifra.pdf"
                      className={fieldClass}
                      data-testid={`input-fragrance-ifra-source-${row.id}`}
                    />
                  )}
                </div>
              </div>
              {row.ifraMaxPercent === undefined ? (
                <p className="mt-3 text-xs font-medium text-[hsl(var(--muted-foreground))]" data-testid={`status-ifra-input-${row.id}`}>
                  IFRA maximum not supplied. Automatic dose is held at zero until you enter this exact fragrance’s soap limit.
                </p>
              ) : ifra.maximumGrams === null ? (
                <p role="alert" className="mt-3 rounded-xl bg-[hsl(var(--destructive)/.1)] px-3 py-2 text-xs font-bold text-[hsl(var(--destructive))]" data-testid={`status-ifra-input-${row.id}`}>
                  Enter an IFRA maximum from 0% to 100% for this fragrance’s bar-soap application.
                </p>
              ) : row.ifraMaxPercent === 0 ? (
                <p role="alert" className="mt-3 rounded-xl bg-[hsl(var(--destructive)/.1)] px-3 py-2 text-xs font-bold text-[hsl(var(--destructive))]" data-testid={`status-ifra-input-${row.id}`}>
                  The supplied limit is 0%, so this fragrance is not permitted in this batch.
                </p>
              ) : totalOilGrams > 0 && strengthAmounts.some((tier) => tier.grams > 0) && row.amount === 0 && ifra.maximumGrams !== null ? (
                <p role="status" className="mt-3 rounded-xl bg-[hsl(var(--accent)/.14)] px-3 py-2 text-xs font-bold text-[hsl(var(--accent-foreground))]" data-testid={`status-ifra-input-${row.id}`}>
                  This dose rounds down to 0 {amountUnitLabel(row.unit)} at the selected unit precision. Choose a finer unit or use a larger batch.
                </p>
              ) : totalOilGrams > 0 && (row.amount > 0 || cappedByIfra) ? (
                <p
                  role="status"
                  className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold ${cappedByIfra ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]'}`}
                  data-testid={`status-ifra-input-${row.id}`}
                >
                  {cappedByIfra
                    ? `Dose automatically capped at ${displayGrams(grams)} g to stay within the conservative ${ifra.maximumGrams!.toFixed(2)} g screen for this oil weight. Verify the finished bar with the supplier.`
                    : `Calculated dose is within the conservative IFRA screen of ${ifra.maximumGrams!.toFixed(2)} g for this oil weight. Verify the finished bar with the supplier.`}
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Fragrance share</span>
                <strong className="font-data text-sm text-[hsl(var(--primary))]">{displayGrams(grams)} g</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-[hsl(var(--secondary))] px-4 py-3 text-sm font-bold text-[hsl(var(--secondary-foreground))]">
        <span>Total fragrance</span>
        <strong className="font-data text-lg" data-testid="text-fragrance-total">{displayGrams(totalGrams)} g</strong>
      </div>

      <div role="note" className="mt-4 flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] px-4 py-3 text-xs leading-5 text-[hsl(var(--accent-foreground))]">
        <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Check before making.</strong> The six documented entries use product-linked IFRA 51 statements assessed in September 2026; verify the supplier’s current statement for your exact product and batch. For other products, enter the matching soap-specific maximum yourself; without it, the automatic dose stays at zero. Our conservative screen uses oil weight because cured soap weight is not known. Blends need separate supplier review. Fragrance changes liquid, never NaOH.</p>
      </div>
    </section>
  );
}