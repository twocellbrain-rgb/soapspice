import { Check, FileSpreadsheet } from 'lucide-react';
import { fragranceIfraScreen, GRAMS_PER_OUNCE, type FragranceRow } from '@/lib/formulation';
import FragranceGuide from './FragranceGuide';

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
const header = 'px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]';

function mass(grams: number, unit: 'g' | 'oz' | 'lb'): string {
  if (unit === 'g') return grams.toFixed(2);
  if (unit === 'oz') return (grams / GRAMS_PER_OUNCE).toFixed(2);
  return (grams / (GRAMS_PER_OUNCE * 16)).toFixed(3);
}

function unitLabel(unit: OilInputUnit | FragranceRow['unit']): string {
  return unit === 'percent' ? '%' : unit;
}

export default function FormulaResults({
  oils,
  oilInputUnit,
  fragrances,
  result,
  liquidName,
  superfat,
}: FormulaResultsProps) {
  const lyeByOil = new Map(result.ingredientLye.map((line) => [line.id, line]));
  const totalOilGrams = oils.reduce((sum, oil) => sum + oil.weight, 0);

  return (
    <section
      aria-labelledby="formula-results-heading"
      className="print-card rounded-3xl border border-[hsl(var(--primary)/.25)] bg-white p-5 shadow-card sm:p-7 lg:col-span-2"
      data-testid="result-validated-formula"
    >
      <header className="flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">
            <Check size={15} aria-hidden="true" /> NaOH calculation checked
          </p>
          <h2 id="formula-results-heading" className="mt-2 font-display text-3xl">Your batch at a glance</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Amounts are weights. Physical volume varies by ingredient density.
          </p>
        </div>
        <FileSpreadsheet className="hidden text-[hsl(var(--primary))] sm:block" size={24} aria-hidden="true" />
      </header>

      <div className="mt-6 grid gap-6 2xl:grid-cols-2">
        <section aria-labelledby="results-required-heading" className="min-w-0">
          <h3 id="results-required-heading" className="mb-3 font-bold text-[hsl(var(--foreground))]">Required amounts</h3>
          <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
            <table className="w-full min-w-[540px] border-collapse text-left" data-testid="table-required-amounts">
              <caption className="sr-only">Required sodium hydroxide and liquid amounts and total batch weight</caption>
              <thead className="bg-[hsl(var(--background))]">
                <tr>
                  <th scope="col" className={header}>Material</th>
                  <th scope="col" className={`${header} text-right`}>Grams</th>
                  <th scope="col" className={`${header} text-right`}>Ounces</th>
                  <th scope="col" className={`${header} text-right`}>Pounds</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[hsl(var(--border))]">
                  <th scope="row" className={`${cell} font-medium`}>Total oils</th>
                  <td className={`${cell} text-right font-data`}>{mass(totalOilGrams, 'g')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(totalOilGrams, 'oz')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(totalOilGrams, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))]">
                  <th scope="row" className={`${cell} font-medium`}>NaOH (sodium hydroxide) before superfat</th>
                  <td className={`${cell} text-right font-data`}>{mass(result.naohBeforeSuperfat, 'g')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.naohBeforeSuperfat, 'oz')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.naohBeforeSuperfat, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))] bg-[hsl(var(--primary)/.04)]">
                  <th scope="row" className={`${cell} font-bold text-[hsl(var(--primary))]`}>NaOH required · {superfat}% superfat</th>
                  <td className={`${cell} text-right font-data font-bold text-[hsl(var(--primary))]`} data-testid="result-naoh">{mass(result.naoh, 'g')}</td>
                  <td className={`${cell} text-right font-data font-bold text-[hsl(var(--primary))]`}>{mass(result.naoh, 'oz')}</td>
                  <td className={`${cell} text-right font-data font-bold text-[hsl(var(--primary))]`}>{mass(result.naoh, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))]">
                  <th scope="row" className={cell} data-testid="text-liquid-type">{liquidName} for NaOH solution</th>
                  <td className={`${cell} text-right font-data`} data-testid="result-liquid">{mass(result.liquid, 'g')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.liquid, 'oz')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.liquid, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))]">
                  <th scope="row" className={cell}>Combined NaOH + liquid</th>
                  <td className={`${cell} text-right font-data`}>{mass(result.total, 'g')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.total, 'oz')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.total, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))]">
                  <th scope="row" className={cell}>Total fragrance</th>
                  <td className={`${cell} text-right font-data`} data-testid="result-fragrance-total">{mass(result.fragranceTotalGrams, 'g')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.fragranceTotalGrams, 'oz')}</td>
                  <td className={`${cell} text-right font-data`}>{mass(result.fragranceTotalGrams, 'lb')}</td>
                </tr>
                <tr className="border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                  <th scope="row" className={`${cell} font-bold text-[hsl(var(--secondary-foreground))]`}>Total batch weight</th>
                  <td className={`${cell} text-right font-data font-bold`} data-testid="result-batch-total">{mass(result.batchTotal, 'g')}</td>
                  <td className={`${cell} text-right font-data font-bold`}>{mass(result.batchTotal, 'oz')}</td>
                  <td className={`${cell} text-right font-data font-bold`}>{mass(result.batchTotal, 'lb')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Liquid is a starting estimate at about 22% of the complete pre-saponification batch. NaOH calculations assume 100% sodium hydroxide purity. Verify the supplier’s NaOH purity and SAP values; check fragrance limits with the supplier.
          </p>
        </section>

        <section aria-labelledby="results-oils-heading" className="min-w-0">
          <h3 id="results-oils-heading" className="mb-3 font-bold text-[hsl(var(--foreground))]">Oil inputs</h3>
          <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
            <table className="w-full min-w-[660px] border-collapse text-left" data-testid="table-oil-inputs">
              <caption className="sr-only">Entered oil amounts with percentages and converted weights</caption>
              <thead className="bg-[hsl(var(--background))]">
                <tr>
                  <th scope="col" className={header}>Ingredient · SAP</th>
                  <th scope="col" className={`${header} text-right`}>Entered</th>
                  <th scope="col" className={`${header} text-right`}>% oils</th>
                  <th scope="col" className={`${header} text-right`}>Grams</th>
                  <th scope="col" className={`${header} text-right`}>Ounces</th>
                  <th scope="col" className={`${header} text-right`}>NaOH · 0% SF</th>
                </tr>
              </thead>
              <tbody>
                {oils.map((oil) => {
                  const inputAmount = oilInputUnit === 'percent'
                    ? oil.percentage
                    : oilInputUnit === 'oz'
                      ? oil.weight / GRAMS_PER_OUNCE
                      : oil.weight;
                  const lye = lyeByOil.get(oil.id);
                  return (
                    <tr key={oil.id} className="border-t border-[hsl(var(--border))]" data-testid={`result-oil-${oil.id}`}>
                      <th scope="row" className={`${cell} font-medium`}>
                        {oil.name}
                        <span className="mt-1 block text-[10px] text-[hsl(var(--muted-foreground))]">SAP {oil.sap.toFixed(3)}</span>
                      </th>
                      <td className={`${cell} whitespace-nowrap text-right font-data`}>{inputAmount.toFixed(2)} {unitLabel(oilInputUnit)}</td>
                      <td className={`${cell} text-right font-data`}>{oil.percentage.toFixed(2)}%</td>
                      <td className={`${cell} text-right font-data`}>{mass(oil.weight, 'g')}</td>
                      <td className={`${cell} text-right font-data`}>{mass(oil.weight, 'oz')}</td>
                      <td className={`${cell} text-right font-data`}>{mass(lye?.theoreticalNaoh ?? 0, 'g')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="results-fragrance-heading" className="min-w-0 2xl:col-span-2">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="results-fragrance-heading" className="font-bold text-[hsl(var(--foreground))]">Fragrance inputs</h3>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Each automatic dose is capped by its supplier IFRA screen; missing limits hold the dose at zero.</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
            <table className="w-full min-w-[720px] border-collapse text-left" data-testid="table-fragrance-inputs">
              <caption className="sr-only">Entered fragrance amounts and converted weights</caption>
              <thead className="bg-[hsl(var(--background))]">
                <tr>
                  <th scope="col" className={header}>Fragrance</th>
                  <th scope="col" className={`${header} text-right`}>Entered</th>
                  <th scope="col" className={`${header} text-right`}>Grams</th>
                  <th scope="col" className={`${header} text-right`}>Ounces</th>
                  <th scope="col" className={`${header} text-right`}>% of oils</th>
                  <th scope="col" className={header}>IFRA screen</th>
                </tr>
              </thead>
              <tbody>
                {fragrances.length === 0 ? (
                  <tr className="border-t border-[hsl(var(--border))]">
                    <td colSpan={6} className={`${cell} text-[hsl(var(--muted-foreground))]`}>No fragrance added · unscented batch</td>
                  </tr>
                ) : fragrances.map((fragrance) => {
                  const grams = fragrance.unit === 'g'
                    ? fragrance.amount
                    : fragrance.unit === 'oz'
                      ? fragrance.amount * GRAMS_PER_OUNCE
                      : totalOilGrams * fragrance.amount / 100;
                  const percent = totalOilGrams > 0 ? grams / totalOilGrams * 100 : 0;
                  const screen = fragranceIfraScreen(fragrance, totalOilGrams);
                  return (
                    <tr key={fragrance.id} className="border-t border-[hsl(var(--border))]" data-testid={`result-fragrance-${fragrance.id}`}>
                      <th scope="row" className={`${cell} font-medium`}>{fragrance.name}</th>
                      <td className={`${cell} whitespace-nowrap text-right font-data`}>{fragrance.amount.toFixed(2)} {unitLabel(fragrance.unit)}</td>
                      <td className={`${cell} text-right font-data`}>{mass(grams, 'g')}</td>
                      <td className={`${cell} text-right font-data`}>{mass(grams, 'oz')}</td>
                      <td className={`${cell} text-right font-data`}>{percent.toFixed(2)}%</td>
                      <td className={`${cell} whitespace-nowrap ${screen.exceeds ? 'font-bold text-[hsl(var(--destructive))]' : ''}`} data-testid={`result-ifra-${fragrance.id}`}>
                        {screen.maximumGrams === null ? 'Not checked' : screen.exceeds ? 'Above limit' : 'Within screen'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <FragranceGuide fragrances={fragrances} totalOilGrams={totalOilGrams} naohGrams={result.naoh} />
      </div>
    </section>
  );
}