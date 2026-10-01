import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'wouter';
import FormulaResults, {
  type FormulaCalculation,
  type OilResultRow,
} from '@/components/FormulaResults';
import CalculatorIngredientProductRecommendations from '@/components/CalculatorIngredientProductRecommendations';
import type { FragranceRow } from '@/lib/formulation';

type PrintableFormula = {
  name: string;
  oils: OilResultRow[];
  oilInputUnit: 'percent' | 'g' | 'oz';
  fragrances: FragranceRow[];
  result: FormulaCalculation;
  liquidName: string;
  superfat: number;
  generatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPrintableFormula(value: unknown): value is PrintableFormula {
  if (!isRecord(value) || !isRecord(value.result)) return false;
  const result = value.result;
  const requiredNumbers = [
    'naoh',
    'naohBeforeSuperfat',
    'liquid',
    'total',
    'fragranceTotalGrams',
    'batchTotal',
  ];
  return typeof value.name === 'string' &&
    Array.isArray(value.oils) &&
    value.oils.every((oil) =>
      isRecord(oil) &&
      typeof oil.id === 'string' &&
      typeof oil.name === 'string' &&
      typeof oil.percentage === 'number' &&
      typeof oil.weight === 'number' &&
      typeof oil.sap === 'number',
    ) &&
    ['percent', 'g', 'oz'].includes(String(value.oilInputUnit)) &&
    Array.isArray(value.fragrances) &&
    Array.isArray(result.ingredientLye) &&
    result.ingredientLye.every((line) =>
      isRecord(line) && typeof line.id === 'string' && typeof line.theoreticalNaoh === 'number',
    ) &&
    requiredNumbers.every((key) => typeof result[key] === 'number') &&
    typeof value.liquidName === 'string' &&
    typeof value.superfat === 'number' &&
    typeof value.generatedAt === 'string';
}

function loadPrintableFormula(): PrintableFormula | null {
  try {
    const draftId = new URLSearchParams(window.location.search).get('draft');
    if (!draftId || !/^[a-f0-9-]{36}$/i.test(draftId)) return null;
    const storageKey = `soapspice-print:${draftId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    localStorage.removeItem(storageKey);
    const parsed: unknown = JSON.parse(raw);
    return isPrintableFormula(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function FormulaPrintPage() {
  const [formula] = useState(loadPrintableFormula);

  if (!formula) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Printable formula</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-[hsl(var(--foreground))]">This print sheet is no longer available</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          Return to the calculator, validate your formula, and open a fresh printable result.
        </p>
        <Link
          href="/calculators/cold-process-soap"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white"
          data-testid="link-return-to-calculator"
        >
          <ArrowLeft size={16} /> Back to calculator
        </Link>
      </main>
    );
  }

  const createdAt = new Date(formula.generatedAt);

  return (
    <main className="print-sheet mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="print-hide mb-7 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/calculators/cold-process-soap"
          className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"
          data-testid="link-return-to-calculator"
        >
          <ArrowLeft size={16} /> Back to calculator
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white"
          data-testid="button-print-formula-page"
        >
          <Printer size={16} /> Print or save as PDF
        </button>
      </div>

      <article>
        <header className="print-page-title mb-7 border-b border-[hsl(var(--border))] pb-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">SoapSpice · Batch sheet</p>
          <h1 className="mt-3 break-words font-display text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl" data-testid="text-print-formula-name">
            {formula.name}
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            Validated {Number.isNaN(createdAt.valueOf()) ? 'just now' : createdAt.toLocaleString()} · {formula.superfat}% superfat · {formula.liquidName}
          </p>
        </header>

        <FormulaResults
          oils={formula.oils}
          oilInputUnit={formula.oilInputUnit}
          fragrances={formula.fragrances}
          result={formula.result}
          liquidName={formula.liquidName}
          superfat={formula.superfat}
        />
        <CalculatorIngredientProductRecommendations
          selections={formula.oils.map(({ id, name }) => ({ id, name }))}
        />

        <footer className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Safety check:</strong> Verify the NaOH purity and every SAP value against your sources and lye label. Wear eye protection, gloves, and long sleeves; add lye to liquid, never liquid to lye. Missing fragrance limits are not verified.
        </footer>
      </article>
    </main>
  );
}