import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'wouter';
import { RESULTS_PATH } from '@/lib/calculator-draft';
import FormulaResults from '@/components/FormulaResults';
import CalculatorIngredientProductRecommendations from '@/components/CalculatorIngredientProductRecommendations';
import { loadPrintableFormula } from '@/lib/formula-sheet';

export default function FormulaPrintPage() {
  const [formula] = useState(loadPrintableFormula);

  if (!formula) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Batch and shopping sheet</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-[hsl(var(--foreground))]">This batch sheet is no longer available</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          Return to your results, or revalidate in the calculator, then open a fresh batch sheet.
        </p>
        <Link
          href={RESULTS_PATH}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white"
          data-testid="link-return-to-calculator"
        >
          <ArrowLeft size={16} /> Back to results
        </Link>
      </main>
    );
  }

  const createdAt = new Date(formula.generatedAt);

  return (
    <main className="print-sheet mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="print-hide mb-7 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={RESULTS_PATH}
          className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"
          data-testid="link-return-to-calculator"
        >
          <ArrowLeft size={16} /> Back to results
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white"
          data-testid="button-print-formula-page"
        >
          <Printer size={16} /> Print or save sheet as PDF
        </button>
      </div>

      <article>
        <header className="print-page-title mb-7 border-b border-[hsl(var(--border))] pb-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">SoapSpice · Batch formula and shopping links</p>
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
          fragranceUnit={formula.oilInputUnit === 'oz' ? 'oz' : 'g'}
          fragrances={formula.fragrances}
          result={formula.result}
          liquidName={formula.liquidName}
          superfat={formula.superfat}
        />
        <CalculatorIngredientProductRecommendations
          selections={formula.oils.map(({ id, name }) => ({ id, name }))}
          additionalMaterials={[
            ...formula.fragrances.map((fragrance) => ({
              id: `fragrance-${fragrance.id}`,
              name: fragrance.name,
              searchQuery: `${fragrance.name} fragrance oil soap making`,
            })),
            {
              id: 'sodium-hydroxide',
              name: 'Sodium hydroxide (NaOH)',
              searchQuery: 'sodium hydroxide NaOH soap making',
            },
            {
              id: 'mixing-liquid',
              name: formula.liquidName,
              searchQuery: `${formula.liquidName} soap making`,
            },
          ]}
        />

        <footer className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Safety check:</strong> Verify the NaOH purity and every SAP value against your sources and the sodium hydroxide product label. Wear eye protection, gloves, and long sleeves; add NaOH to liquid, never liquid to NaOH. Fragrance doses are capped against conservative supplier IFRA screens; a missing limit holds the dose at zero, and the cap is not a compliance certificate.
        </footer>
      </article>
    </main>
  );
}