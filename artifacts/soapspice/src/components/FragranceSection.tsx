import { CircleAlert, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { FragranceRow } from '@/lib/formulation';
import { fragranceIfraScreen, fragranceWeightGrams } from '@/lib/formulation';
import { BRAMBLE_BERRY_FRAGRANCES, chooseSupplierFragrance, renameFragrance, selectedSupplierFragrance } from '@/lib/supplier-fragrances';

type FragranceSectionProps = {
  fragrances: FragranceRow[];
  totalOilGrams: number;
  onChange: (next: FragranceRow[]) => void;
};

const fragranceSuggestions = [
  'Lavender',
  'Sweet orange',
  'Cedarwood',
  'Rose geranium',
  'Peppermint',
  'Oat milk & honey',
];

const fieldClass =
  'h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] outline-none transition-colors focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)]';

function displayGrams(grams: number) {
  return Number.isFinite(grams) ? grams.toFixed(2) : '0.00';
}

export default function FragranceSection({
  fragrances,
  totalOilGrams,
  onChange,
}: FragranceSectionProps) {
  const updateRow = (id: string, changes: Partial<FragranceRow>) => {
    onChange(fragrances.map((row) => row.id === id ? { ...row, ...changes } : row));
  };
  const replaceRow = (id: string, next: FragranceRow) => {
    onChange(fragrances.map((row) => row.id === id ? next : row));
  };

  const addRow = () => {
    onChange([...fragrances, { id: crypto.randomUUID(), name: '', amount: 0, unit: 'percent' }]);
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
            Select an exact Bramble Berry product to fill its published soap IFRA limit, or enter a different fragrance manually.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
          data-testid="button-add-fragrance"
        >
          <Plus size={17} aria-hidden="true" /> Add fragrance
        </button>
      </div>

      <datalist id="soapspice-fragrance-suggestions">
        {fragranceSuggestions.map((name) => <option key={name} value={name} />)}
      </datalist>

      <div className="space-y-3 pt-6">
        {fragrances.length === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-6 text-sm text-[hsl(var(--muted-foreground))]">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
            <p>No fragrance added yet. Leave this step empty for an unscented batch, or add as many scents as you like.</p>
          </div>
        ) : fragrances.map((row, index) => {
          const grams = fragranceWeightGrams(row, totalOilGrams);
          const ifra = fragranceIfraScreen(row, totalOilGrams);
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
                <label htmlFor={`supplier-fragrance-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Bramble Berry fragrance oil <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label>
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
                  <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Six document-checked products are available. Similar names from other suppliers are not interchangeable; enter their own IFRA limit below.</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(100px,.45fr)_minmax(130px,.55fr)]">
                <div>
                  <label htmlFor={`fragrance-name-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Fragrance name</label>
                  <input
                    id={`fragrance-name-${row.id}`}
                    type="text"
                    list="soapspice-fragrance-suggestions"
                    value={row.name}
                    onChange={(event) => replaceRow(row.id, renameFragrance(row, event.target.value))}
                    placeholder="e.g. Lavender"
                    autoComplete="off"
                    className={fieldClass}
                    data-testid={`input-fragrance-name-${row.id}`}
                  />
                </div>
                <div>
                  <label htmlFor={`fragrance-amount-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Amount</label>
                  <input
                    id={`fragrance-amount-${row.id}`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={Number.isFinite(row.amount) ? row.amount : 0}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateRow(row.id, { amount: Number.isFinite(value) ? Math.max(0, value) : 0 });
                    }}
                    className={`${fieldClass} font-data`}
                    data-testid={`input-fragrance-amount-${row.id}`}
                  />
                </div>
                <div>
                  <label htmlFor={`fragrance-unit-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Unit</label>
                  <select
                    id={`fragrance-unit-${row.id}`}
                    value={row.unit}
                    onChange={(event) => updateRow(row.id, { unit: event.target.value as FragranceRow['unit'] })}
                    className={fieldClass}
                    data-testid={`select-fragrance-unit-${row.id}`}
                  >
                    <option value="percent">% of total oil weight</option>
                    <option value="g">Grams (g)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
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
                  <label htmlFor={`fragrance-ifra-source-${row.id}`} className="mb-2 block text-xs font-bold text-[hsl(var(--foreground))]">Supplier IFRA document link <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label>
                  <input
                    id={`fragrance-ifra-source-${row.id}`}
                    type="url"
                    maxLength={500}
                    value={row.ifraSourceUrl ?? ''}
                    readOnly={Boolean(selectedSupplier)}
                    onChange={(event) => {
                      if (!selectedSupplier) updateRow(row.id, { ifraSourceUrl: event.target.value || undefined });
                    }}
                    placeholder="https://supplier.example/ifra.pdf"
                    className={`${fieldClass} ${selectedSupplier ? 'bg-[hsl(var(--secondary)/.6)]' : ''}`}
                    data-testid={`input-fragrance-ifra-source-${row.id}`}
                  />
                </div>
              </div>
              {row.ifraMaxPercent === undefined ? (
                <p className="mt-3 text-xs font-medium text-[hsl(var(--muted-foreground))]" data-testid={`status-ifra-input-${row.id}`}>
                  IFRA maximum not supplied. This fragrance cannot be safety-screened yet.
                </p>
              ) : ifra.maximumGrams === null ? (
                <p role="alert" className="mt-3 rounded-xl bg-[hsl(var(--destructive)/.1)] px-3 py-2 text-xs font-bold text-[hsl(var(--destructive))]" data-testid={`status-ifra-input-${row.id}`}>
                  Enter an IFRA maximum from 0% to 100% for this fragrance’s bar-soap application.
                </p>
              ) : totalOilGrams > 0 && row.amount > 0 ? (
                <p
                  role={ifra.exceeds ? 'alert' : 'status'}
                  className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold ${ifra.exceeds ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]'}`}
                  data-testid={`status-ifra-input-${row.id}`}
                >
                  {ifra.exceeds
                    ? `Above the conservative IFRA screen by ${(ifra.enteredGrams - ifra.maximumGrams!).toFixed(2)} g. Reduce the fragrance or verify finished-product usage with the supplier.`
                    : `Within the conservative IFRA screen of ${ifra.maximumGrams!.toFixed(2)} g for this oil weight. Verify the finished bar with the supplier.`}
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Converted weight</span>
                <strong className="font-data text-sm text-[hsl(var(--primary))]" data-testid={`text-fragrance-grams-${row.id}`}>
                  {displayGrams(grams)} g
                </strong>
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
        <p><strong>Check before making.</strong> The six Bramble Berry entries use product-linked IFRA 51 statements checked in September 2026; verify the supplier’s current statement for your exact product and batch. For other products, enter the matching soap-specific maximum yourself; a missing rate stays unverified. Our conservative screen uses oil weight because cured soap weight is not known. Blends need separate supplier review. Fragrance changes liquid, never NaOH.</p>
      </div>
    </section>
  );
}