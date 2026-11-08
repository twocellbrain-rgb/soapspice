import { Check } from 'lucide-react';
import { fragranceIfraScreen, fragranceWeightGrams, GRAMS_PER_OUNCE, type FragranceRow } from '@/lib/formulation';

export type OilResultRow = {
  id: string;
  name: string;
  percentage: number;
  weight: number;
  sap: number;
};

type OilInputUnit = 'percent' | 'g' | 'oz';
export type FormulaCalculation = ReturnType<typeof import('@/lib/formulation').calculateNaohFormula>;

type FormulaResultsProps = {
  oils: OilResultRow[];
  oilInputUnit: OilInputUnit;
  fragrances: FragranceRow[];
  result: FormulaCalculation;
  liquidName: string;
  superfat: number;
};

const cell = 'px-4 py-3 text-sm';
const heading = 'px-4 py-3 text-left text-xs font-bold text-[hsl(var(--muted-foreground))]';

export default function FormulaResults({
  oils, oilInputUnit, fragrances, result, liquidName, superfat,
}: FormulaResultsProps) {
  const unit = oilInputUnit === 'oz' ? 'oz' : 'g';
  const totalOilGrams = oils.reduce((sum, oil) => sum + oil.weight, 0);
  const amount = (grams: number) => `${(unit === 'oz' ? grams / GRAMS_PER_OUNCE : grams).toFixed(2)} ${unit}`;
  const requiredAmounts = [
    { id: 'result-oils-total', name: 'Total oils', grams: totalOilGrams },
    { id: 'result-naoh', name: `NaOH required · ${superfat}% superfat`, grams: result.naoh },
    { id: 'result-liquid', name: `${liquidName} for NaOH solution`, grams: result.liquid },
    { id: 'result-fragrance-total', name: fragrances.length ? 'Total fragrance' : 'Fragrance · unscented', grams: result.fragranceTotalGrams },
  ];

  return (
    <section
      aria-labelledby="formula-results-heading"
      className="print-card rounded-3xl border border-[hsl(var(--primary)/.25)] bg-white p-5 shadow-card sm:p-7"
      data-testid="result-validated-formula"
      data-weight-unit={unit}
    >
      <header className="border-b border-[hsl(var(--border))] pb-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">
          <Check size={15} aria-hidden="true" /> NaOH calculation checked
        </p>
        <h2 id="formula-results-heading" className="mt-2 font-display text-3xl">Your batch at a glance</h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          All amounts are weights in {unit === 'oz' ? 'ounces (oz)' : 'grams (g)'}, not volume.
          {oilInputUnit === 'percent' && ' Percentage-based oil inputs are shown in grams for weighing.'}
          {' '}Sodium hydroxide (NaOH) is commonly called lye.
        </p>
      </header>

      <section className="mt-6" aria-labelledby="results-required-heading">
        <h3 id="results-required-heading" className="mb-3 font-bold">Required amounts</h3>
        <table className="w-full border-collapse text-left" data-testid="table-required-amounts">
          <caption className="sr-only">Required amounts in {unit}</caption>
          <thead className="bg-[hsl(var(--background))]">
            <tr><th scope="col" className={heading}>Material</th><th scope="col" className={`${heading} text-right`}>Weight ({unit})</th></tr>
          </thead>
          <tbody>
            {requiredAmounts.map((row) => (
              <tr key={row.id} className={`border-t border-[hsl(var(--border))]${row.id === 'result-naoh' ? ' bg-[hsl(var(--primary)/.06)] font-bold text-[hsl(var(--primary))]' : ''}`}>
                <th scope="row" className={`${cell} font-medium`} data-testid={row.id === 'result-liquid' ? 'text-liquid-type' : undefined}>{row.name}</th>
                <td className={`${cell} whitespace-nowrap text-right font-data`} data-testid={row.id}>{amount(row.grams)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          Liquid is a starting estimate at about 22% of the complete pre-saponification batch, not an optimized water amount. NaOH assumes 100% purity. Verify your supplier’s NaOH purity and oil SAP values before making soap.
        </p>
      </section>

      <section className="mt-6" aria-labelledby="results-oils-heading">
        <h3 id="results-oils-heading" className="mb-3 font-bold">Oils to weigh</h3>
        <table className="w-full border-collapse text-left" data-testid="table-oil-inputs">
          <caption className="sr-only">Each selected oil in {unit}</caption>
          <thead className="bg-[hsl(var(--background))]">
            <tr><th scope="col" className={heading}>Ingredient</th><th scope="col" className={`${heading} text-right`}>Weight ({unit})</th></tr>
          </thead>
          <tbody>
            {oils.map((oil) => (
              <tr key={oil.id} className="border-t border-[hsl(var(--border))]" data-testid={`result-oil-${oil.id}`}>
                <th scope="row" className={`${cell} font-medium`}>{oil.name}</th>
                <td className={`${cell} whitespace-nowrap text-right font-data`}>{amount(oil.weight)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {fragrances.length > 0 && <section className="mt-6" aria-labelledby="results-fragrance-heading">
        <h3 id="results-fragrance-heading" className="mb-3 font-bold">Fragrance to weigh</h3>
        <table className="w-full border-collapse text-left" data-testid="table-fragrance-inputs">
          <caption className="sr-only">Each selected fragrance in {unit}</caption>
          <thead className="bg-[hsl(var(--background))]">
            <tr><th scope="col" className={heading}>Fragrance</th><th scope="col" className={`${heading} text-right`}>Weight ({unit})</th></tr>
          </thead>
          <tbody>
            {fragrances.map((fragrance) => {
              const screen = fragranceIfraScreen(fragrance, totalOilGrams);
              const warning = screen.maximumGrams === null || screen.exceeds;
              return (
                <tr key={fragrance.id} className="border-t border-[hsl(var(--border))]" data-testid={`result-fragrance-${fragrance.id}`}>
                  <th scope="row" className={`${cell} font-medium`}>
                    {fragrance.name}
                    <span className={`mt-1 block text-xs ${warning ? 'font-bold text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`result-ifra-${fragrance.id}`}>
                      {screen.maximumGrams === null ? 'Supplier limit missing — verify before use' : screen.exceeds ? 'Above supplier screen — do not use this dose' : 'Within supplier screen; verify before use'}
                    </span>
                  </th>
                  <td className={`${cell} whitespace-nowrap text-right font-data`}>{amount(fragranceWeightGrams(fragrance, totalOilGrams))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          IFRA screening is not a compliance certificate and cannot assess shared restricted ingredients in a fragrance blend. Confirm the exact supplier’s current soap-specific limit before use.
        </p>
      </section>}
    </section>
  );
}
