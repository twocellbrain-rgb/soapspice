import { ArrowLeft, Check, CircleAlert, Download, Pencil, Printer, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import { CALCULATOR_PATH } from '@/lib/calculator-draft';

const primary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] disabled:cursor-not-allowed disabled:opacity-45';
const quiet = 'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-45';

type HeaderProps = {
  fresh: boolean;
  name: string;
  superfat: number;
  liquidName: string;
  onExport: () => void;
  onPrint: () => void;
  onShoppingList: () => void;
};

export function ResultsHeader({ fresh, name, superfat, liquidName, onExport, onPrint, onShoppingList }: HeaderProps) {
  return (
    <section className="sc-calculator-intro mx-auto max-w-7xl px-5 pb-8 pt-10 lg:px-8 lg:pt-14">
      <Link href={CALCULATOR_PATH} className="print-hide mb-6 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-back-to-inputs">
        <ArrowLeft size={16} /> Back to your inputs
      </Link>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl animate-rise">
          <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Results / NaOH cold process
          </div>
          <h1 className="break-words font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-6xl" data-testid="text-results-name">
            {fresh ? name : 'Your results'}
          </h1>
          {fresh && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Check size={16} className="text-[hsl(var(--primary))]" /> Validated · {superfat}% superfat · {liquidName}
            </p>
          )}
        </div>
        {fresh && (
          <div className="print-hide flex flex-wrap gap-2">
            <Link href={CALCULATOR_PATH} className={quiet} data-testid="link-edit-formula"><Pencil size={16} /> Edit formula</Link>
            <button type="button" onClick={onExport} className={quiet} data-testid="button-export-results"><Download size={16} /> Export .json</button>
            <button type="button" onClick={onShoppingList} className={quiet} data-testid="button-first-batch-shopping-list"><ShoppingCart size={16} /> First-batch shopping list</button>
            <button type="button" onClick={onPrint} className={primary} data-testid="button-print-results"><Printer size={16} /> Print batch sheet</button>
          </div>
        )}
      </div>
    </section>
  );
}

export function ResultsRecovery({ hasDraft }: { hasDraft: boolean }) {
  return (
    <div role="status" className="rounded-3xl border border-dashed border-[hsl(var(--primary)/.35)] bg-white p-8 shadow-card sm:p-10" data-testid="status-results-recovery">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
        <CircleAlert size={22} />
      </div>
      <h2 className="mt-5 font-display text-3xl">
        {hasDraft ? 'This formula needs a fresh check.' : 'No validated formula yet.'}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {hasDraft
          ? 'Your inputs are still here, but they changed or the ingredient data moved since the last validation. Head back, review, and validate again to see updated amounts.'
          : 'Results appear here after you validate a formula in the calculator. Saved browser formulas can be opened from the calculator too.'}
      </p>
      <Link href={CALCULATOR_PATH} className={`${primary} mt-6`} data-testid="link-recovery-calculator">
        <ArrowLeft size={16} /> {hasDraft ? 'Review and revalidate' : 'Open the calculator'}
      </Link>
    </div>
  );
}
