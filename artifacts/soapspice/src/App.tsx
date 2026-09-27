import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Check,
  CircleAlert,
  ExternalLink,
  FlaskConical,
  Leaf,
  Menu,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { getGetIngredientQueryKey, useGetIngredient, useGetIngredients } from '@workspace/api-client-react';
import { calculateNaohFormula, GRAMS_PER_OUNCE, LIQUID_BATCH_FRACTION, validateNaohFormula, type FragranceRow } from '@/lib/formulation';
import FragranceSection from '@/components/FragranceSection';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './bright-crafted.css';

const queryClient = new QueryClient();
const publicImages = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}images/`;

type Ingredient = {
  id: string;
  name: string;
  alternateNames: string[];
  category: 'oil' | 'butter';
  description: string;
  naohSap: number;
  kohSap: number;
  sapSourceTitle: string;
  sapSourceUrl: string;
  verificationStatus: 'source-linked-needs-review' | 'administrator-verified';
};

type OilRow = {
  id: string;
  name: string;
  percentage: number;
  weight: number;
};

type SavedRecipe = {
  id: string;
  name: string;
  savedAt: string;
  batchSize: number;
  unit: 'g' | 'oz' | 'lb';
  superfat: number;
  concentration?: number; // Only present in formulas saved before automatic liquid calculation.
  oils: OilRow[];
  fragrances?: FragranceRow[];
  liquidType?: LiquidType;
  customLiquid?: string;
  oilInputUnit?: OilInputUnit;
  liquidMethod?: 'batch-22';
};

type OilInputUnit = 'percent' | 'g' | 'oz';
type LiquidType = 'distilled-water' | 'goat-milk' | 'cow-milk' | 'other';
const liquidNames: Record<Exclude<LiquidType, 'other'>, string> = {
  'distilled-water': 'Distilled water',
  'goat-milk': 'Goat milk',
  'cow-milk': 'Cow milk',
};

const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] disabled:cursor-not-allowed disabled:opacity-45';
const buttonQuiet = 'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]';

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="soap-shell">
      <div className="sc-ribbon" aria-label="Create, calculate, craft">
        <span>CREATE</span><i /><span>CALCULATE</span><i /><span>CRAFT</span>
        <span className="sc-ribbon-note">A little more joy in every batch</span>
      </div>
      <header className="sc-header">
        <div className="sc-header-inner">
          <Link href="/" data-testid="link-brand" className="sc-brand">
            <img src={`${publicImages}soapspice-logo.webp`} alt="SoapSpice — your soapmaking companion" width="1200" height="701" />
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="sc-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} data-testid="button-toggle-navigation">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`sc-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <Link href="/calculators/cold-process-soap" onClick={() => setMenuOpen(false)} data-testid="link-calculator">Calculator</Link>
            <Link href="/ingredients" onClick={() => setMenuOpen(false)} data-testid="link-ingredients">Ingredient catalog</Link>
            <Link href="/calculators/cold-process-soap" onClick={() => setMenuOpen(false)} data-testid="link-start-formula" className="sc-nav-cta">Start a formula <ArrowRight size={16} /></Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="sc-footer">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3"><img src={`${publicImages}soapspice-logo.webp`} alt="" width="1200" height="701" /><span>Ingredient choices, made clearer.</span></div>
          <p>NaOH cold-process bars only · source-linked values need review</p>
        </div>
      </footer>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <section className="sc-page-intro mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
      <div className="max-w-3xl animate-rise">
        <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />{eyebrow}</div>
        <h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{description}</p>
        {children}
      </div>
      <img className="sc-intro-photo" src={`${publicImages}crafted-soap-detail.webp`} alt="" aria-hidden="true" width="1024" height="1024" />
    </section>
  );
}

function LoadingRows() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-48 animate-pulse rounded-3xl bg-[hsl(var(--muted))]" />)}</div>;
}

function QueryState({ isLoading, isError, onRetry }: { isLoading: boolean; isError: boolean; onRetry: () => void }) {
  if (isLoading) return <LoadingRows />;
  if (isError) return <div className="rounded-3xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.06)] p-8 text-center"><CircleAlert className="mx-auto mb-3 text-[hsl(var(--destructive))]" /><h2 className="font-display text-2xl">The catalog took a pause.</h2><p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">We could not load ingredient data. Try again before building a formula.</p><button className={`${buttonQuiet} mt-5`} type="button" onClick={onRetry} data-testid="button-retry-query">Try again</button></div>;
  return null;
}

function Home() {
  return (
    <Shell>
      <div className="sc-home">
        <section className="sc-hero">
          <div className="sc-hero-copy">
            <div className="sc-eyebrow"><Sparkles size={15} /> A friendlier way to formulate</div>
            <h1>Make soap with<br /><em>more yes.</em><br /><span>Less guesswork.</span></h1>
            <p className="sc-hero-intro">Oils, butters, and good ideas deserve a recipe you can understand. Bring your curiosity; we’ll take care of the careful math.</p>
            <div className="sc-hero-actions">
              <Link href="/calculators/cold-process-soap" className="sc-button-dark" data-testid="link-home-calculator">Open the cold-process calculator <ArrowRight size={17} /></Link>
              <Link href="/ingredients" className="sc-text-link" data-testid="link-home-catalog">Browse ingredients <BookOpen size={16} /></Link>
            </div>
            <div className="sc-proof"><span><ShieldCheck size={17} /></span><span><strong>Clear numbers, cited sources.</strong><br />SAP values shown plainly, ready for your review.</span></div>
          </div>
          <div className="sc-hero-art">
            <div className="sc-orbit sc-orbit-one" /><div className="sc-orbit sc-orbit-two" />
            <div className="sc-photo-frame">
              <img src={`${publicImages}crafted-soap-hero.webp`} alt="Colorful handmade soap bars with citrus and botanicals" className="sc-hero-photo" width="1024" height="1024" />
              <div className="sc-photo-sticker">Made<br />by hand<span><Sparkles size={14} /></span></div>
            </div>
            <div className="sc-batch-note"><span className="sc-note-topline"><FlaskConical size={14} /> YOUR FIRST BATCH</span><strong>Curiosity<br />looks good on you.</strong><span className="sc-swatches"><i /><i /><i /><i /></span></div>
            <div className="sc-side-label">SMALL BATCH / BIG JOY</div>
          </div>
        </section>
        <section className="sc-manifesto">
          <div className="sc-manifesto-head"><span className="sc-eyebrow"><i /> The good stuff, in order</span><h2>From what’s in your bowl<br />to what’s on your bar.</h2></div>
          <div className="sc-steps">
            <article><span className="sc-step-no">01 / INGREDIENTS</span><div className="sc-step-icon sc-step-leaf"><Leaf size={22} /></div><h3>Choose with context.</h3><p>Explore what an oil brings to a bar, not just what it’s called.</p><Link href="/ingredients" className="sc-step-link" data-testid="card-home-ingredients">Explore the field guide <ArrowRight size={15} /></Link></article>
            <article><span className="sc-step-no">02 / THE MATH</span><div className="sc-step-icon sc-step-flask"><FlaskConical size={22} /></div><h3>See every number.</h3><p>NaOH and water calculations trace back to ingredient SAP values.</p><Link href="/calculators/cold-process-soap" className="sc-step-link">See how it adds up <ArrowRight size={15} /></Link></article>
            <article><span className="sc-step-no">03 / YOUR BATCH</span><div className="sc-step-icon sc-step-spark"><Sparkles size={22} /></div><h3>Make it yours.</h3><p>Save your formula in your browser, print it, then get making.</p><Link href="/calculators/cold-process-soap" className="sc-step-link" data-testid="card-home-calculator">Build your first bar <ArrowRight size={15} /></Link></article>
          </div>
        </section>
        <section className="sc-feature">
          <div className="sc-feature-photo">
            <img src={`${publicImages}crafted-soap-detail.webp`} alt="Close-up of a hand-cut marbled soap bar in coral, cream, and teal" width="1024" height="1024" />
            <div><span>01</span> A bar with a story in every swirl</div>
          </div>
          <div className="sc-feature-copy">
            <span className="sc-eyebrow">A calmer first batch is a better first batch</span>
            <h2>Good soap starts<br />with good questions.</h2>
            <p>What does olive oil bring? Why does this number matter? SoapSpice helps you follow the thread from ingredient to finished bar—without taking the fun out of figuring it out.</p>
            <div className="sc-feature-links">
              <Link href="/ingredients" className="sc-feature-link" data-testid="link-home-feature-ingredients"><span className="sc-feature-icon"><BookOpen size={19} /></span><span><strong>Ingredient field guide</strong><small>Read the why behind your oils and butters.</small></span><ArrowRight size={17} /></Link>
              <Link href="/calculators/cold-process-soap" className="sc-feature-link" data-testid="link-home-feature-calculator"><span className="sc-feature-icon warm"><FlaskConical size={19} /></span><span><strong>Build your first bar</strong><small>A straightforward cold-process NaOH formula.</small></span><ArrowRight size={17} /></Link>
            </div>
          </div>
        </section>
        <section className="sc-caveat">
          <div className="sc-caveat-mark"><ShieldCheck size={24} /></div>
          <div><span className="sc-eyebrow">Careful by design</span><h2>Useful data. Sources in sight.</h2><p>Ingredient SAP values are source-linked references, not a substitute for checking your supplier’s data. Review every formula and use appropriate cold-process safety practices before making.</p></div>
          <Link href="/ingredients" className="sc-caveat-link">Review ingredients <ArrowRight size={15} /></Link>
        </section>
      </div>
    </Shell>
  );
}

function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'oil' | 'butter'>('all');
  const query = useGetIngredients({ search: search || undefined, category: category === 'all' ? undefined : category });
  const ingredients = (query.data ?? []) as Ingredient[];
  return (
    <Shell>
      <PageIntro eyebrow="Ingredient catalog" title="Know what goes into the bar." description="A small, source-linked field guide for the oils and butters you reach for most. Search by name or browse by role.">
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search oils, butters, aliases..." className="h-12 w-full rounded-full border border-[hsl(var(--input))] bg-white pl-11 pr-5 text-sm outline-none ring-[hsl(var(--primary))] focus:ring-2" data-testid="input-search-ingredients" /></label>
          <div className="flex rounded-full border border-[hsl(var(--border))] bg-white p-1">
            {(['all', 'oil', 'butter'] as const).map((value) => <button type="button" key={value} onClick={() => setCategory(value)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${category === value ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`} data-testid={`button-filter-${value}`}>{value === 'all' ? 'All' : `${value}s`}</button>)}
          </div>
        </div>
      </PageIntro>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} />
        {!query.isLoading && !query.isError && ingredients.length === 0 && <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-white p-14 text-center"><Search className="mx-auto mb-4 text-[hsl(var(--primary))]" /><h2 className="font-display text-3xl">No ingredients match that search.</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try a broader name, or clear the filters.</p><button type="button" onClick={() => { setSearch(''); setCategory('all'); }} className={`${buttonQuiet} mt-5`} data-testid="button-clear-filters">Clear filters</button></div>}
        {!query.isLoading && !query.isError && ingredients.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ingredients.map((ingredient, index) => <Link href={`/ingredients/${ingredient.id}`} key={ingredient.id} className="group flex min-h-[245px] flex-col rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-[hsl(var(--primary)/.35)] hover:shadow-lift animate-rise" style={{ animationDelay: `${Math.min(index * 45, 280)}ms` }} data-testid={`card-ingredient-${ingredient.id}`}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--secondary-foreground))]">{ingredient.category}</span><ArrowRight size={18} className="text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-1 group-hover:text-[hsl(var(--primary))]" /></div><h2 className="mt-8 font-display text-3xl leading-none">{ingredient.name}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{ingredient.description}</p><div className="mt-auto flex items-center gap-2 pt-5 text-xs font-bold text-[hsl(var(--primary))]"><span className="font-data">{ingredient.naohSap.toFixed(3)}</span> NaOH SAP <span className="ml-auto text-[hsl(var(--muted-foreground))]">{ingredient.verificationStatus === 'administrator-verified' ? 'Verified' : 'Review pending'}</span></div></Link>)}</div>}
      </section>
    </Shell>
  );
}

function IngredientDetailPage() {
  const params = useParams<{ ingredientId: string }>();
  const id = params.ingredientId ?? '';
  const query = useGetIngredient(id, { query: { enabled: Boolean(id), queryKey: getGetIngredientQueryKey(id) } });
  const ingredient = query.data as Ingredient | undefined;
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
        <Link href="/ingredients" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-back-catalog">← Back to catalog</Link>
        {query.isLoading && <div className="h-96 animate-pulse rounded-3xl bg-[hsl(var(--muted))]" />}
        {query.isError && <QueryState isLoading={false} isError onRetry={() => void query.refetch()} />}
        {!query.isLoading && !query.isError && ingredient && <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]"><div className="animate-rise"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--secondary-foreground))]">{ingredient.category}</span><span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--primary))]"><ShieldCheck size={14} /> {ingredient.verificationStatus === 'administrator-verified' ? 'Administrator verified' : 'Source linked · review pending'}</span></div><h1 className="mt-7 font-display text-6xl leading-[.94] tracking-[-.05em] sm:text-8xl">{ingredient.name}</h1><p className="mt-7 max-w-2xl text-xl leading-9 text-[hsl(var(--muted-foreground))]">{ingredient.description}</p><div className="mt-8 flex flex-wrap gap-2">{ingredient.alternateNames.map((name) => <span key={name} className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">{name}</span>)}</div><Link href={`/calculators/cold-process-soap?ingredient=${ingredient.id}`} className={`${buttonPrimary} mt-10`} data-testid="link-use-in-calculator">Use in calculator <ArrowRight size={16} /></Link></div><aside className="rounded-3xl bg-[hsl(193_46%_22%)] p-7 text-[hsl(var(--background))] shadow-lift sm:p-9"><div className="mb-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><FlaskConical size={25} /></div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Soapmaking numbers</p><div className="mt-5 grid gap-5"><div className="border-b border-white/15 pb-5"><span className="text-sm text-white/65">NaOH SAP value</span><strong className="mt-1 block font-data text-4xl">{ingredient.naohSap.toFixed(3)}</strong><span className="text-xs text-white/55">g NaOH / g fat</span></div><div className="border-b border-white/15 pb-5"><span className="text-sm text-white/65">KOH SAP value</span><strong className="mt-1 block font-data text-4xl">{ingredient.kohSap.toFixed(3)}</strong><span className="text-xs text-white/55">g KOH / g fat</span></div><div><span className="text-sm text-white/65">Data source</span><a href={ingredient.sapSourceUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-start gap-2 text-sm font-bold leading-5 text-[hsl(var(--accent))] hover:underline" data-testid="link-ingredient-source">{ingredient.sapSourceTitle}<ExternalLink size={14} className="mt-0.5 shrink-0" /></a></div></div></aside></div>}
      </section>
    </Shell>
  );
}

function CalculatorPage() {
  const catalogQuery = useGetIngredients();
  const ingredients = (catalogQuery.data ?? []) as Ingredient[];
  const seeded = useRef(false);
  const [batchSize, setBatchSize] = useState(1000);
  const [unit, setUnit] = useState<'g' | 'oz' | 'lb'>('g');
  const [superfat, setSuperfat] = useState(5);
  const [oilInputUnit, setOilInputUnit] = useState<OilInputUnit>('percent');
  const [liquidType, setLiquidType] = useState<LiquidType>('distilled-water');
  const [customLiquid, setCustomLiquid] = useState('');
  const [legacyLiquidNotice, setLegacyLiquidNotice] = useState('');
  const [oils, setOils] = useState<OilRow[]>([]);
  const [fragrances, setFragrances] = useState<FragranceRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [validated, setValidated] = useState(false);
  const [validatedFingerprint, setValidatedFingerprint] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [recipeName, setRecipeName] = useState('My first bar');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('soapspice-recipes') ?? '[]');
      return Array.isArray(stored) ? stored as SavedRecipe[] : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (!seeded.current && ingredients.length > 0) {
      const requested = new URLSearchParams(window.location.search).get('ingredient');
      const ingredient = ingredients.find((item) => item.id === requested);
      if (ingredient) {
        setOils([{ id: ingredient.id, name: ingredient.name, percentage: 100, weight: 1000 }]);
      }
      seeded.current = true;
    }
  }, [ingredients]);

  const ingredientMap = useMemo(() => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])), [ingredients]);
  const totalPercent = oils.reduce((sum, oil) => sum + oil.percentage, 0);
  const totalOilGrams = unit === 'oz' ? batchSize * GRAMS_PER_OUNCE : unit === 'lb' ? batchSize * GRAMS_PER_OUNCE * 16 : batchSize;
  const liquidName = liquidType === 'other' ? customLiquid.trim() || 'Other liquid' : liquidNames[liquidType];
  const formulaInput = useMemo(
    () => ({ oils, ingredients: ingredientMap, totalOilGrams, superfat, fragrances }),
    [oils, ingredientMap, totalOilGrams, superfat, fragrances],
  );
  const formulaFingerprint = JSON.stringify({
    oils, totalOilGrams, superfat, fragrances, liquidType, customLiquid,
    sapValues: oils.map((oil) => [oil.id, ingredientMap.get(oil.id)?.naohSap ?? null]),
  });
  const catalogUnavailable = catalogQuery.isLoading || catalogQuery.isFetching || catalogQuery.isError;
  const currentErrors = useMemo(() => [
    ...validateNaohFormula(formulaInput),
    ...(liquidType === 'other' && !customLiquid.trim() ? ['Name the liquid you plan to use.'] : []),
    ...(catalogUnavailable ? ['Wait for the ingredient catalog to finish loading before validating.'] : []),
  ], [formulaInput, liquidType, customLiquid, catalogUnavailable]);
  const calculation = useMemo(
    () => currentErrors.length === 0 ? calculateNaohFormula(formulaInput) : null,
    [formulaInput, currentErrors],
  );
  const freshValidation = validated && validatedFingerprint === formulaFingerprint && validationErrors.length === 0 && currentErrors.length === 0;
  const visibleResult = freshValidation ? calculation : null;

  const updateOils = (next: OilRow[]) => { setOils(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const changePercent = (id: string, value: number) => updateOils(oils.map((oil) => oil.id === id ? { ...oil, percentage: value, weight: totalOilGrams * value / 100 } : oil));
  const changeWeight = (id: string, value: number) => updateOils(oils.map((oil) => oil.id === id ? { ...oil, weight: value, percentage: totalOilGrams ? (value / totalOilGrams) * 100 : 0 } : oil));
  const changeOilAmount = (id: string, value: number) => {
    if (oilInputUnit === 'percent') changePercent(id, value);
    else changeWeight(id, oilInputUnit === 'oz' ? value * GRAMS_PER_OUNCE : value);
  };
  const updateBatch = (value: number) => { setBatchSize(value); setOils(oils.map((oil) => ({ ...oil, weight: (value * (unit === 'oz' ? GRAMS_PER_OUNCE : unit === 'lb' ? GRAMS_PER_OUNCE * 16 : 1)) * oil.percentage / 100 }))); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const changeUnit = (nextUnit: 'g' | 'oz' | 'lb') => {
    const grams = totalOilGrams;
    setUnit(nextUnit);
    setBatchSize(nextUnit === 'oz' ? grams / GRAMS_PER_OUNCE : nextUnit === 'lb' ? grams / (GRAMS_PER_OUNCE * 16) : grams);
    setValidated(false);
    setValidationErrors([]);
    setSaveFeedback('');
  };
  const addOil = () => {
    const ingredient = ingredientMap.get(selectedId);
    if (!ingredient || oils.some((oil) => oil.id === ingredient.id)) return;
    updateOils([...oils, { id: ingredient.id, name: ingredient.name, percentage: 0, weight: 0 }]);
    setSelectedId('');
  };
  const removeOil = (id: string) => updateOils(oils.filter((oil) => oil.id !== id));
  const updateFragrances = (next: FragranceRow[]) => { setFragrances(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const validate = () => {
    setValidationErrors(currentErrors); setValidatedFingerprint(currentErrors.length ? '' : formulaFingerprint); setValidated(true); setSaveFeedback('');
  };
  const saveRecipe = () => {
    if (currentErrors.length || !calculation || !freshValidation) {
      setValidationErrors(currentErrors);
      setValidated(currentErrors.length > 0);
      setSaveFeedback(currentErrors.length
        ? 'Not saved. Resolve the formula issues above and try again.'
        : 'Not saved. Validate the current formula before saving.');
      return;
    }
    const recipe: SavedRecipe = { id: `${Date.now()}`, name: recipeName.trim() || 'Untitled formula', savedAt: new Date().toISOString(), batchSize, unit, superfat, oils, fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod: 'batch-22' };
    const next = [recipe, ...savedRecipes];
    try {
      localStorage.setItem('soapspice-recipes', JSON.stringify(next));
      setSavedRecipes(next);
      setValidated(true);
      setValidationErrors([]);
      setLegacyLiquidNotice('');
      setSaveFeedback(`Saved “${recipe.name}” in this browser.`);
    } catch {
      setSaveFeedback('Could not save in this browser. Storage may be full or unavailable.');
    }
  };
  const loadRecipe = (id: string) => {
    const recipe = savedRecipes.find((saved) => saved.id === id);
    if (!recipe) return;
    seeded.current = true;
    setRecipeName(recipe.name); setBatchSize(recipe.batchSize); setUnit(recipe.unit); setSuperfat(recipe.superfat);
    setOils(recipe.oils); setFragrances(recipe.fragrances ?? []);
    setLiquidType(recipe.liquidType ?? 'distilled-water'); setCustomLiquid(recipe.customLiquid ?? '');
    setOilInputUnit(recipe.oilInputUnit ?? 'percent'); setValidated(false); setValidatedFingerprint(''); setValidationErrors([]);
    setLegacyLiquidNotice(recipe.liquidMethod === 'batch-22' ? ''
      : typeof recipe.concentration === 'number'
        ? `This saved formula used ${recipe.concentration}% lye concentration. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.`
        : 'This saved formula used the earlier 2:1 liquid-to-NaOH baseline. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.');
    setSaveFeedback(`Opened “${recipe.name}”. Validate it against the current catalog before printing.`);
  };
  const available = ingredients.filter((ingredient) => !oils.some((oil) => oil.id === ingredient.id));

  return (
    <Shell>
      <section className="sc-calculator-intro mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-3xl animate-rise"><div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Calculator / NaOH cold process</div><h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-6xl">Turn a good idea into a <span className="text-[hsl(var(--primary))]">clear formula.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Build a bar from source-linked SAP values. This first release supports NaOH cold-process bars only.</p></div><div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))]"><CircleAlert size={18} /> Always wear proper safety gear.</div></div>
        <div role="note" data-testid="notice-sap-review" className="mt-8 flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--secondary))] px-5 py-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span><strong>Source-linked, not yet administrator reviewed.</strong> Reference SAP values still need administrator review. Check the linked sources and independently verify the formula before handling lye.</span></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 lg:grid-cols-[1.4fr_.6fr] lg:px-8">
        <div className="space-y-6">
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 01</p><h2 className="mt-2 font-display text-3xl">Choose your ingredients</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Enter oils in grams, ounces, or percent of the total oil weight.</p></div><div className="flex items-center gap-2"><select aria-label="Add an ingredient" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-11 max-w-[190px] rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-add-ingredient"><option value="">Add an ingredient</option>{available.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><button type="button" onClick={addOil} disabled={!selectedId} className={`${buttonPrimary} h-11 px-4`} data-testid="button-add-ingredient"><Plus size={17} /> Add</button></div></div>
            {catalogQuery.isLoading && <div className="space-y-3 pt-6"><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /></div>}
            {catalogQuery.isError && <div className="pt-6"><QueryState isLoading={false} isError onRetry={() => void catalogQuery.refetch()} /></div>}
            {!catalogQuery.isLoading && !catalogQuery.isError && <div className="pt-6">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <label htmlFor="oil-input-unit" className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Enter oil amounts in</label>
                <select id="oil-input-unit" value={oilInputUnit} onChange={(event) => setOilInputUnit(event.target.value as OilInputUnit)} className="h-10 rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-oil-input-unit">
                  <option value="percent">Percent (%)</option><option value="g">Grams (g)</option><option value="oz">Ounces (oz)</option>
                </select>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Switch units without changing the formula.</span>
              </div>
              <div className="hidden grid-cols-[minmax(0,1fr)_145px_38px] gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:grid"><span>Ingredient</span><span>{oilInputUnit === 'percent' ? 'Percent (%)' : oilInputUnit === 'g' ? 'Weight (g)' : 'Weight (oz)'}</span><span /></div>
              {oils.length === 0 && <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Choose an ingredient above to begin.</div>}
              {oils.map((oil) => {
                const amount = oilInputUnit === 'percent' ? oil.percentage : oilInputUnit === 'oz' ? oil.weight / GRAMS_PER_OUNCE : oil.weight;
                return <div key={oil.id} className="mb-3 grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:grid-cols-[minmax(0,1fr)_145px_38px] sm:items-center">
                  <div><div className="flex items-center gap-2 font-bold">{oil.name}<span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">{ingredientMap.get(oil.id)?.category}</span></div><a href={ingredientMap.get(oil.id)?.sapSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--primary))] hover:underline" data-testid={`link-source-${oil.id}`}>SAP {ingredientMap.get(oil.id)?.naohSap.toFixed(3)} <ExternalLink size={11} /></a><p className="mt-1 font-data text-[11px] text-[hsl(var(--muted-foreground))]">{oil.percentage.toFixed(1)}% · {oil.weight.toFixed(1)} g · {(oil.weight / GRAMS_PER_OUNCE).toFixed(2)} oz</p></div>
                  <label className="flex items-center gap-2 sm:block"><span className="text-xs text-[hsl(var(--muted-foreground))] sm:hidden">{oilInputUnit === 'percent' ? 'Percent' : oilInputUnit === 'g' ? 'Grams' : 'Ounces'}</span><input type="number" min="0" step="any" value={Number.isFinite(amount) ? Number(amount.toFixed(oilInputUnit === 'percent' ? 2 : 3)) : 0} onChange={(event) => changeOilAmount(oil.id, Number(event.target.value))} className="h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid={`input-amount-${oil.id}`} /></label>
                  <button type="button" onClick={() => removeOil(oil.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))]" aria-label={`Remove ${oil.name}`} data-testid={`button-remove-${oil.id}`}><Trash2 size={16} /></button>
                </div>;
              })}
              <div className={`mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${Math.abs(totalPercent - 100) <= .01 ? 'bg-[hsl(184_75%_35%/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--destructive)/.08)] text-[hsl(var(--destructive))]'}`}><span>Oil formula total</span><span className="font-data">{totalPercent.toFixed(1)}%</span></div>
            </div>}
          </div>
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 02</p><h2 className="mt-2 font-display text-3xl">Set the batch</h2><div className="mt-6 grid gap-5 sm:grid-cols-3"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Total oil weight</span><input type="number" min="1" value={batchSize} onChange={(event) => updateBatch(Number(event.target.value))} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="input-batch-size" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Weight unit</span><select value={unit} onChange={(event) => changeUnit(event.target.value as 'g' | 'oz' | 'lb')} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-weight-unit"><option value="g">Grams</option><option value="oz">Ounces</option><option value="lb">Pounds</option></select></label><div className="rounded-xl bg-[hsl(var(--secondary))] p-3"><span className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">Working total</span><strong className="mt-1 block font-data text-xl text-[hsl(var(--secondary-foreground))]">{totalOilGrams.toFixed(1)} g</strong><span className="text-xs text-[hsl(var(--secondary-foreground)/.7)]">converted for the math</span></div></div></div>
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 03</p>
            <h2 className="mt-2 font-display text-3xl">Choose your mixing liquid</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block"><span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><span>Superfat</span><span className="font-data text-[hsl(var(--primary))]">{superfat}%</span></span><input type="range" min="0" max="15" step="0.5" value={superfat} onChange={(event) => { setSuperfat(Number(event.target.value)); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="w-full accent-[hsl(var(--primary))]" data-testid="input-superfat" /><div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]"><span>0%</span><span>15%</span></div></label>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Liquid for lye solution</span><select value={liquidType} onChange={(event) => { setLiquidType(event.target.value as LiquidType); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-liquid-type"><option value="distilled-water">Distilled water</option><option value="goat-milk">Goat milk</option><option value="cow-milk">Cow milk</option><option value="other">Other liquid</option></select></label>
            </div>
            {liquidType === 'other' && <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Liquid name</span><input type="text" value={customLiquid} onChange={(event) => { setCustomLiquid(event.target.value); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} placeholder="e.g. Coconut milk" className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="input-custom-liquid" /></label>}
            <div role="note" className="mt-5 rounded-2xl bg-[hsl(var(--secondary))] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]" data-testid="notice-liquid-ratio"><strong>Automatic starting estimate:</strong> Liquid is approximately 22% of the complete batch before saponification (oils + NaOH + fragrance + liquid), not 22% of oils alone. Oil SAP values and superfat determine NaOH assuming 100% pure lye; fragrance adds to batch weight and changes this liquid estimate slightly, but never the NaOH amount. This is our approximation of a typical liquid share, not a verified Bramble Berry formula or a recipe-specific optimum. Check your lye label and follow a tested recipe.</div>
            {legacyLiquidNotice && <div role="alert" className="mt-4 rounded-2xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-4 text-sm leading-6 text-[hsl(var(--destructive))]" data-testid="notice-legacy-liquid">{legacyLiquidNotice}</div>}
            {liquidType !== 'distilled-water' && <div role="note" className="mt-4 rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><strong>Milk and other liquids need extra care.</strong> Sugars and fats are not included in this lye calculation. Use a tested method for your chosen liquid and check the supplier or recipe guidance before making soap.</div>}
            {superfat > 10 && <div role="status" data-testid="status-high-superfat" className="mt-5 flex gap-3 rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert size={19} className="mt-0.5 shrink-0" /><span><strong>High-superfat advisory.</strong> Above 10% superfat can leave a softer bar and more unsaponified oils. Consider testing a small batch and checking shelf life.</span></div>}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--accent)/.08)] p-4 text-sm leading-6 text-[hsl(var(--accent-foreground))]"><strong>Safety first.</strong> Slowly add lye to the measured liquid, never liquid to lye. Wear eye protection, gloves, and long sleeves, and work with ventilation. Milk mixtures need careful temperature control.</div>
          </div>
          <FragranceSection fragrances={fragrances} totalOilGrams={totalOilGrams} onChange={updateFragrances} />
          <div className="print-card rounded-3xl border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] p-5 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 05</p><h2 className="mt-2 font-display text-3xl">Check your formula</h2><p className="mt-2 max-w-lg text-sm text-[hsl(var(--muted-foreground))]">Validate the oil percentages, NaOH math, and fragrance amounts before you print or save. Fragrance safety limits are not checked here.</p></div><button type="button" onClick={validate} className={`${buttonPrimary} shrink-0`} data-testid="button-validate-formula"><Check size={17} /> Validate formula</button></div>{validated && <div className={`mt-5 rounded-2xl p-4 text-sm ${validationErrors.length ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : freshValidation ? 'bg-[hsl(184_75%_35%/.12)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--secondary-foreground))]'}`} data-testid="status-validation">{validationErrors.length ? <ul className="list-disc space-y-1 pl-5">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul> : freshValidation ? <div className="flex items-center gap-2 font-bold"><Check size={17} /> Lye math checked. Review the liquid recommendation and any fragrance usage limits below.</div> : <div className="flex items-center gap-2 font-bold"><CircleAlert size={17} /> Formula or ingredient data changed. Validate again before saving or printing.</div>}</div>}</div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="print-card rounded-3xl bg-[hsl(193_46%_22%)] p-6 text-[hsl(var(--background))] shadow-lift sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Your formula</p><h2 className="mt-2 font-display text-3xl">NaOH + liquid</h2></div><Beaker className="text-[hsl(var(--accent))]" size={25} /></div>
            {visibleResult ? (
              <div data-testid="result-validated-formula">
                <div className="mt-8 space-y-4">
                  <div className="flex items-end justify-between gap-2 border-b border-white/15 pb-4"><span className="text-sm text-white/65">Sodium hydroxide (NaOH)</span><strong className="text-right font-data text-2xl text-[hsl(var(--accent))]" data-testid="result-naoh">{visibleResult.naoh.toFixed(1)} g<span className="block text-sm font-normal text-white/75">{(visibleResult.naoh / GRAMS_PER_OUNCE).toFixed(2)} oz</span></strong></div>
                  <div className="flex items-end justify-between gap-2 border-b border-white/15 pb-4"><span className="text-sm text-white/65" data-testid="text-liquid-type">{liquidName}</span><strong className="text-right font-data text-2xl" data-testid="result-liquid">{visibleResult.liquid.toFixed(1)} g<span className="block text-sm font-normal text-white/75">{(visibleResult.liquid / GRAMS_PER_OUNCE).toFixed(2)} oz</span></strong></div>
                  <div className="flex items-end justify-between gap-2 border-b border-white/15 pb-4"><span className="text-sm text-white/65">Lye + liquid</span><strong className="font-data text-xl">{visibleResult.total.toFixed(1)} g</strong></div>
                  {visibleResult.fragranceTotalGrams > 0 && <div className="flex items-end justify-between gap-2 border-b border-white/15 pb-4"><span className="text-sm text-white/65">Fragrance total</span><strong className="text-right font-data text-xl" data-testid="result-fragrance-total">{visibleResult.fragranceTotalGrams.toFixed(1)} g<span className="block text-sm font-normal text-white/75">{(visibleResult.fragranceTotalGrams / GRAMS_PER_OUNCE).toFixed(2)} oz</span></strong></div>}
                  <div className="flex items-end justify-between gap-2"><span className="text-sm text-white/65">Pre-saponification batch</span><strong className="text-right font-data text-xl" data-testid="result-batch-total">{visibleResult.batchTotal.toFixed(1)} g<span className="block text-sm font-normal text-white/75">{(visibleResult.batchTotal / GRAMS_PER_OUNCE).toFixed(2)} oz</span></strong></div>
                </div>
                <div className="mt-7 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/80">Liquid targets about 22% of the pre-saponification batch, not a recipe-specific optimum. NaOH assumes 100% purity. Verify your lye label and SAP references; fragrance usage limits must be checked separately. This is not an approval of the recipe.</div>
              </div>
            ) : <div role="status" data-testid="status-formula-placeholder" className="mt-8 rounded-2xl border border-dashed border-white/30 bg-white/10 p-5 text-sm leading-6 text-white/80">Your NaOH, chosen liquid, and fragrance totals will appear here after you add oils and explicitly validate a complete formula. Changes to a validated recipe require a new check.</div>}
          </div>
          {visibleResult && <details className="print-card group rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-card" data-testid="details-calculation">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-[hsl(var(--foreground))]" data-testid="summary-calculation-details"><span className="flex items-center gap-2"><FlaskConical size={18} className="text-[hsl(var(--primary))]" /> Calculation details</span><span className="text-xs font-medium text-[hsl(var(--primary))] group-open:hidden">Show breakdown +</span><span className="hidden text-xs font-medium text-[hsl(var(--primary))] group-open:inline">Hide breakdown −</span></summary>
            <div className="mt-5 space-y-4 border-t border-[hsl(var(--border))] pt-5 text-sm">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">NaOH before superfat · ingredient by ingredient</p>
              {visibleResult.ingredientLye.map((line) => {
                const ingredient = ingredientMap.get(line.id);
                return <div key={line.id} className="border-b border-[hsl(var(--border))] pb-3" data-testid={`detail-sap-${line.id}`}><div className="flex justify-between gap-3"><span className="font-bold">{ingredient?.name ?? line.id}</span><span className="shrink-0 font-data">{line.theoreticalNaoh.toFixed(2)} g</span></div><p className="mt-1 font-data text-xs text-[hsl(var(--muted-foreground))]">{line.weight.toFixed(2)} g oil × {line.sap.toFixed(4)} g NaOH/g oil</p>{ingredient && <a href={ingredient.sapSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline" data-testid={`link-detail-source-${line.id}`}>{ingredient.sapSourceTitle} · review pending <ExternalLink size={11} /></a>}</div>;
              })}
              <div className="flex justify-between gap-3"><span>Theoretical NaOH, 0% superfat</span><strong className="font-data">{visibleResult.naohBeforeSuperfat.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3"><span>NaOH after {superfat}% superfat<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">{visibleResult.naohBeforeSuperfat.toFixed(2)} × (1 − {superfat}/100)</span></span><strong className="font-data">{visibleResult.naoh.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3"><span>{liquidName} · {LIQUID_BATCH_FRACTION * 100}% of full batch<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">({totalOilGrams.toFixed(2)} g oils + {visibleResult.naoh.toFixed(2)} g NaOH + {visibleResult.fragranceTotalGrams.toFixed(2)} g fragrance) × 22 / 78</span></span><strong className="shrink-0 font-data">{visibleResult.liquid.toFixed(2)} g</strong></div>
              {visibleResult.fragranceDetails.map((row) => <div key={row.id} className="flex justify-between gap-3"><span>{row.name} fragrance<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">Included in liquid estimate; no NaOH added</span></span><strong className="font-data">{row.weightGrams.toFixed(2)} g</strong></div>)}
              <div className="flex justify-between gap-3 border-t border-[hsl(var(--border))] pt-4"><span>Total oils</span><strong className="font-data">{totalOilGrams.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3"><span>Total fragrance</span><strong className="font-data">{visibleResult.fragranceTotalGrams.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3"><span>Total before saponification<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">oils + NaOH + liquid + fragrance</span></span><strong className="font-data">{visibleResult.batchTotal.toFixed(2)} g</strong></div>
            </div>
          </details>}
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-card"><div className="flex items-center gap-2 text-[hsl(var(--primary))]"><ShieldCheck size={17} /><h2 className="font-bold">Save this batch</h2></div><input value={recipeName} onChange={(event) => { setRecipeName(event.target.value); setSaveFeedback(''); }} className="mt-4 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" placeholder="Recipe name" data-testid="input-recipe-name" /><button type="button" onClick={saveRecipe} className={`${buttonPrimary} mt-3 w-full`} data-testid="button-save-recipe">Save in this browser</button>{saveFeedback && <p role="status" className={`mt-3 rounded-xl p-3 text-sm ${saveFeedback.startsWith('Saved') ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--secondary-foreground))]'}`} data-testid="status-save-feedback">{saveFeedback}</p>}{savedRecipes.length > 0 && <div className="mt-5 border-t border-[hsl(var(--border))] pt-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Saved formulas</p><div className="mt-2 space-y-1">{savedRecipes.map((recipe) => <button type="button" key={recipe.id} onClick={() => loadRecipe(recipe.id)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-bold hover:bg-[hsl(var(--secondary))]" data-testid={`button-load-recipe-${recipe.id}`}><span className="truncate">{recipe.name}</span><span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">{new Date(recipe.savedAt).toLocaleDateString()}</span></button>)}</div></div>}</div>
          <button type="button" onClick={() => { if (visibleResult) window.print(); }} disabled={!visibleResult} className={`${buttonQuiet} print-hide w-full disabled:cursor-not-allowed disabled:opacity-45`} data-testid="button-print-formula"><Printer size={17} /> Print formula</button>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6"><div className="flex items-center gap-2 text-[hsl(var(--secondary-foreground))]"><CircleAlert size={17} /><h2 className="font-bold">A note on the numbers</h2></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--secondary-foreground)/.8)]">SAP values are linked to their sources, but still need administrator review. Treat every result as a starting point and verify your process independently.</p></div>
        </aside>
      </section>
    </Shell>
  );
}

function Router() {
  const [location] = useLocation();
  useEffect(() => {
    let title: string;
    let description: string;
    if (location === '/') {
      title = 'SoapSpice | Make soap with more confidence';
      description = 'Explore source-linked soapmaking ingredients and build clear NaOH cold-process bar formulas with SoapSpice.';
    } else if (location === '/calculators/cold-process-soap') {
      title = 'Cold-Process Soap Calculator | SoapSpice';
      description = 'Calculate NaOH and water for cold-process bar soap from source-linked oil and butter SAP values. Review your formula and lye safety guidance.';
    } else if (location === '/ingredients') {
      title = 'Soapmaking Ingredient Catalog | SoapSpice';
      description = 'Search oils and butters for cold-process soapmaking, with descriptions, NaOH SAP values, and linked reference sources.';
    } else if (location.startsWith('/ingredients/')) {
      const slug = location.slice('/ingredients/'.length);
      let decoded = slug;
      try { decoded = decodeURIComponent(slug); } catch { /* Keep the slug if malformed. */ }
      const ingredientName = decoded.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      title = `${ingredientName} Soapmaking Ingredient | SoapSpice`;
      description = `Explore ${ingredientName} for cold-process soapmaking, including its source-linked NaOH SAP value and ingredient details.`;
    } else {
      title = 'Page not found | SoapSpice';
      description = 'Explore SoapSpice ingredients and the NaOH cold-process soap calculator.';
    }
    document.title = title;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', description);
    }
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', title);
    }
  }, [location]);
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/calculators/cold-process-soap" component={CalculatorPage} /><Route path="/ingredients" component={IngredientsPage} /><Route path="/ingredients/:ingredientId" component={IngredientDetailPage} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;