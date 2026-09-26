import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Check,
  CircleAlert,
  Droplets,
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
import logo from '@assets/soap_1790462514377.png';
import { calculateNaohFormula, validateNaohFormula } from '@/lib/formulation';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

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
  concentration: number;
  oils: OilRow[];
};

const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] disabled:cursor-not-allowed disabled:opacity-45';
const buttonQuiet = 'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]';

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.94)] backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" data-testid="link-brand" className="flex items-center gap-3">
            <img src={logo} alt="SoapSpice" className="h-14 w-auto object-contain" />
            <span className="hidden border-l border-[hsl(var(--border))] pl-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))] sm:block">Create · calculate · craft</span>
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-2 text-[hsl(var(--foreground))] md:hidden" aria-label="Toggle navigation" data-testid="button-toggle-navigation">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`${menuOpen ? 'absolute left-4 right-4 top-[70px] flex' : 'hidden'} flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-lift md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`} aria-label="Main navigation">
            <Link href="/calculators/cold-process-soap" onClick={() => setMenuOpen(false)} data-testid="link-calculator" className="rounded-full px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">Calculator</Link>
            <Link href="/ingredients" onClick={() => setMenuOpen(false)} data-testid="link-ingredients" className="rounded-full px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">Ingredient catalog</Link>
            <Link href="/calculators/cold-process-soap" onClick={() => setMenuOpen(false)} data-testid="link-start-formula" className={`${buttonPrimary} px-4 py-2.5`}>Start a formula <ArrowRight size={15} /></Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(38_28%_94%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3"><img src={logo} alt="" className="h-9 w-auto object-contain" /><span>Ingredient choices, made clearer.</span></div>
          <p>NaOH cold-process bars only · source-linked values need review</p>
        </div>
      </footer>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
      <div className="max-w-3xl animate-rise">
        <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />{eyebrow}</div>
        <h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{description}</p>
        {children}
      </div>
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
      <div className="overflow-hidden">
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--secondary-foreground))]"><Sparkles size={14} className="text-[hsl(var(--accent))]" /> A friendlier way to formulate</div>
            <h1 className="max-w-3xl font-display text-6xl leading-[.94] tracking-[-.055em] text-[hsl(var(--foreground))] sm:text-7xl lg:text-[6.8rem]">Make soap with <span className="text-[hsl(var(--primary))]">more yes</span> and less guesswork.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">SoapSpice turns oils, butters, and trusted source data into a recipe you can actually understand. Choose ingredients with curiosity. We will handle the math.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/calculators/cold-process-soap" className={buttonPrimary} data-testid="link-home-calculator">Open the cold-process calculator <ArrowRight size={17} /></Link>
              <Link href="/ingredients" className={buttonQuiet} data-testid="link-home-catalog">Browse ingredients <BookOpen size={16} /></Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]"><ShieldCheck size={17} className="text-[hsl(var(--primary))]" /> Source-linked SAP values, shown plainly</div>
          </div>
          <div className="relative min-h-[390px] animate-rise animate-rise-delay-1 sm:min-h-[500px]">
            <div className="absolute right-0 top-4 h-[330px] w-[330px] rounded-full bg-[hsl(var(--accent)/.16)] blur-2xl sm:h-[480px] sm:w-[480px]" />
            <div className="absolute right-[7%] top-8 h-[330px] w-[330px] rounded-[44%_56%_52%_48%] bg-[hsl(var(--primary))] sm:h-[450px] sm:w-[450px]" />
            <div className="absolute right-[14%] top-16 z-10 flex h-[300px] w-[300px] rotate-3 items-center justify-center rounded-[42%_58%_54%_46%] border-[12px] border-[hsl(var(--secondary))] bg-[hsl(42_76%_90%)] shadow-lift sm:h-[408px] sm:w-[408px]">
              <div className="h-[190px] w-[190px] -rotate-6 rounded-[45%_55%_50%_50%] bg-[hsl(35_100%_62%)] shadow-[inset_-18px_-18px_0_hsl(35_95%_52%),0_16px_22px_rgba(38,69,70,.18)] sm:h-[240px] sm:w-[240px]">
                <div className="mt-16 ml-10 w-[140px] rotate-3 rounded border-2 border-[hsl(27_74%_20%/.18)] bg-[hsl(39_90%_81%)] px-3 py-2 text-center sm:ml-14 sm:w-[165px]"><span className="font-display text-lg text-[hsl(var(--foreground))]">sunlit oat</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.15em] text-[hsl(var(--primary))]">small batch / 01</span></div>
              </div>
            </div>
            <div className="absolute bottom-3 left-0 z-20 max-w-[210px] rounded-2xl border border-[hsl(var(--border))] bg-white p-4 shadow-card sm:left-2"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]"><FlaskConical size={14} /> Formula note</div><p className="text-sm font-medium leading-5">Your best recipe is one you can explain.</p></div>
            <div className="absolute right-0 top-1 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-card"><Droplets size={25} /></div>
          </div>
        </section>
        <section className="border-y border-[hsl(var(--border))] bg-[hsl(193_46%_22%)] text-[hsl(var(--background))]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 lg:px-8">
            <div><span className="font-data text-sm text-[hsl(var(--accent))]">01</span><h2 className="mt-3 font-display text-3xl">Choose with context</h2><p className="mt-2 text-sm leading-6 text-[hsl(40_40%_97%/.72)]">Explore what an oil brings to a bar, not just what it is called.</p></div>
            <div><span className="font-data text-sm text-[hsl(var(--accent))]">02</span><h2 className="mt-3 font-display text-3xl">See the math</h2><p className="mt-2 text-sm leading-6 text-[hsl(40_40%_97%/.72)]">Every NaOH and water number traces back to an ingredient SAP value.</p></div>
            <div><span className="font-data text-sm text-[hsl(var(--accent))]">03</span><h2 className="mt-3 font-display text-3xl">Craft with confidence</h2><p className="mt-2 text-sm leading-6 text-[hsl(40_40%_97%/.72)]">Save the formula in your browser, print it, and make it yours.</p></div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24">
          <div><div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><Leaf size={15} /> Start somewhere good</div><h2 className="font-display text-5xl leading-none tracking-[-.04em]">A calmer first batch is a better first batch.</h2></div>
          <div className="grid gap-4 sm:grid-cols-2"><Link href="/ingredients" className="group rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift" data-testid="card-home-ingredients"><div className="mb-12 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(184_75%_35%/.1)] text-[hsl(var(--primary))]"><Leaf size={21} /></div><h3 className="font-display text-2xl">Ingredient field guide</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Read the why behind your oils and butters.</p><ArrowRight className="mt-5 transition group-hover:translate-x-1" size={18} /></Link><Link href="/calculators/cold-process-soap" className="group rounded-3xl bg-[hsl(var(--accent))] p-6 text-[hsl(var(--accent-foreground))] shadow-card transition hover:-translate-y-1 hover:shadow-lift" data-testid="card-home-calculator"><div className="mb-12 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/40"><Beaker size={21} /></div><h3 className="font-display text-2xl">Build your first bar</h3><p className="mt-2 text-sm leading-6 opacity-80">A straightforward NaOH formula for cold-process soap.</p><ArrowRight className="mt-5 transition group-hover:translate-x-1" size={18} /></Link></div>
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
  const [concentration, setConcentration] = useState(33);
  const [oils, setOils] = useState<OilRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [validated, setValidated] = useState(false);
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
  const totalOilGrams = unit === 'oz' ? batchSize * 28.3495 : unit === 'lb' ? batchSize * 453.592 : batchSize;
  const formulaInput = useMemo(
    () => ({ oils, ingredients: ingredientMap, totalOilGrams, superfat, concentration }),
    [oils, ingredientMap, totalOilGrams, superfat, concentration],
  );
  const currentErrors = useMemo(() => validateNaohFormula(formulaInput), [formulaInput]);
  const calculation = useMemo(
    () => currentErrors.length === 0 ? calculateNaohFormula(formulaInput) : null,
    [formulaInput, currentErrors],
  );
  const visibleResult = validated && validationErrors.length === 0 && currentErrors.length === 0 ? calculation : null;

  const updateOils = (next: OilRow[]) => { setOils(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const changePercent = (id: string, value: number) => updateOils(oils.map((oil) => oil.id === id ? { ...oil, percentage: value, weight: totalOilGrams * value / 100 } : oil));
  const changeWeight = (id: string, value: number) => updateOils(oils.map((oil) => oil.id === id ? { ...oil, weight: value, percentage: totalOilGrams ? (value / totalOilGrams) * 100 : 0 } : oil));
  const updateBatch = (value: number) => { setBatchSize(value); setOils(oils.map((oil) => ({ ...oil, weight: (value * (unit === 'oz' ? 28.3495 : unit === 'lb' ? 453.592 : 1)) * oil.percentage / 100 }))); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const changeUnit = (nextUnit: 'g' | 'oz' | 'lb') => {
    const grams = totalOilGrams;
    setUnit(nextUnit);
    setBatchSize(nextUnit === 'oz' ? grams / 28.3495 : nextUnit === 'lb' ? grams / 453.592 : grams);
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
  const validate = () => {
    setValidationErrors(currentErrors); setValidated(true); setSaveFeedback('');
  };
  const saveRecipe = () => {
    if (currentErrors.length || !calculation) {
      setValidationErrors(currentErrors.length ? currentErrors : ['Please check the formula before saving.']);
      setValidated(true);
      setSaveFeedback('Not saved. Resolve the formula issues above and try again.');
      return;
    }
    const recipe: SavedRecipe = { id: `${Date.now()}`, name: recipeName.trim() || 'Untitled formula', savedAt: new Date().toISOString(), batchSize, unit, superfat, concentration, oils };
    const next = [recipe, ...savedRecipes];
    try {
      localStorage.setItem('soapspice-recipes', JSON.stringify(next));
      setSavedRecipes(next);
      setValidated(true);
      setValidationErrors([]);
      setSaveFeedback(`Saved “${recipe.name}” in this browser.`);
    } catch {
      setSaveFeedback('Could not save in this browser. Storage may be full or unavailable.');
    }
  };
  const loadRecipe = (id: string) => {
    const recipe = savedRecipes.find((saved) => saved.id === id);
    if (!recipe) return;
    setRecipeName(recipe.name); setBatchSize(recipe.batchSize); setUnit(recipe.unit); setSuperfat(recipe.superfat); setConcentration(recipe.concentration); setOils(recipe.oils); setValidated(false); setValidationErrors([]); setSaveFeedback(`Opened “${recipe.name}”. Validate it against the current catalog before printing.`);
  };
  const available = ingredients.filter((ingredient) => !oils.some((oil) => oil.id === ingredient.id));

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-3xl animate-rise"><div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Calculator / NaOH cold process</div><h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-6xl">Turn a good idea into a <span className="text-[hsl(var(--primary))]">clear formula.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Build a bar from source-linked SAP values. This first release supports NaOH cold-process bars only.</p></div><div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))]"><CircleAlert size={18} /> Always wear proper safety gear.</div></div>
        <div role="note" data-testid="notice-sap-review" className="mt-8 flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--secondary))] px-5 py-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span><strong>Source-linked, not yet administrator reviewed.</strong> Reference SAP values still need administrator review. Check the linked sources and independently verify the formula before handling lye.</span></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 lg:grid-cols-[1.4fr_.6fr] lg:px-8">
        <div className="space-y-6">
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 01</p><h2 className="mt-2 font-display text-3xl">Choose your ingredients</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Set the percentages first. We will keep the grams in step.</p></div><div className="flex items-center gap-2"><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-11 max-w-[190px] rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-add-ingredient"><option value="">Add an ingredient</option>{available.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><button type="button" onClick={addOil} disabled={!selectedId} className={`${buttonPrimary} h-11 px-4`} data-testid="button-add-ingredient"><Plus size={17} /> Add</button></div></div>
            {catalogQuery.isLoading && <div className="space-y-3 pt-6"><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /></div>}
            {catalogQuery.isError && <div className="pt-6"><QueryState isLoading={false} isError onRetry={() => void catalogQuery.refetch()} /></div>}
            {!catalogQuery.isLoading && !catalogQuery.isError && <div className="pt-6"><div className="hidden grid-cols-[1fr_100px_120px_38px] gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:grid"><span>Ingredient</span><span>Percent</span><span>Weight (g)</span><span /></div>{oils.length === 0 && <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Choose an ingredient above to begin.</div>}{oils.map((oil) => <div key={oil.id} className="mb-3 grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:grid-cols-[1fr_100px_120px_38px] sm:items-center"><div><div className="flex items-center gap-2 font-bold">{oil.name}<span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">{ingredientMap.get(oil.id)?.category}</span></div><a href={ingredientMap.get(oil.id)?.sapSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--primary))] hover:underline" data-testid={`link-source-${oil.id}`}>SAP {ingredientMap.get(oil.id)?.naohSap.toFixed(3)} <ExternalLink size={11} /></a></div><label className="flex items-center gap-2 sm:block"><span className="text-xs text-[hsl(var(--muted-foreground))] sm:hidden">Percent</span><input type="number" min="0" step="0.1" value={Number.isFinite(oil.percentage) ? Number(oil.percentage.toFixed(2)) : 0} onChange={(event) => changePercent(oil.id, Number(event.target.value))} className="h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid={`input-percent-${oil.id}`} /><span className="hidden sm:block sm:mt-1 sm:text-[10px] sm:text-[hsl(var(--muted-foreground))]">percent</span></label><label className="flex items-center gap-2 sm:block"><span className="text-xs text-[hsl(var(--muted-foreground))] sm:hidden">Weight g</span><input type="number" min="0" step="0.1" value={Number.isFinite(oil.weight) ? Number(oil.weight.toFixed(1)) : 0} onChange={(event) => changeWeight(oil.id, Number(event.target.value))} className="h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid={`input-weight-${oil.id}`} /><span className="hidden sm:block sm:mt-1 sm:text-[10px] sm:text-[hsl(var(--muted-foreground))]">grams</span></label><button type="button" onClick={() => removeOil(oil.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))]" aria-label={`Remove ${oil.name}`} data-testid={`button-remove-${oil.id}`}><Trash2 size={16} /></button></div>)}<div className={`mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${Math.abs(totalPercent - 100) <= .01 ? 'bg-[hsl(184_75%_35%/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--destructive)/.08)] text-[hsl(var(--destructive))]'}`}><span>Formula total</span><span className="font-data">{totalPercent.toFixed(1)}%</span></div></div>}
          </div>
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 02</p><h2 className="mt-2 font-display text-3xl">Set the batch</h2><div className="mt-6 grid gap-5 sm:grid-cols-3"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Total oil weight</span><input type="number" min="1" value={batchSize} onChange={(event) => updateBatch(Number(event.target.value))} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="input-batch-size" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Weight unit</span><select value={unit} onChange={(event) => changeUnit(event.target.value as 'g' | 'oz' | 'lb')} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-weight-unit"><option value="g">Grams</option><option value="oz">Ounces</option><option value="lb">Pounds</option></select></label><div className="rounded-xl bg-[hsl(var(--secondary))] p-3"><span className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">Working total</span><strong className="mt-1 block font-data text-xl text-[hsl(var(--secondary-foreground))]">{totalOilGrams.toFixed(1)} g</strong><span className="text-xs text-[hsl(var(--secondary-foreground)/.7)]">converted for the math</span></div></div></div>
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 03</p>
            <h2 className="mt-2 font-display text-3xl">Dial in the lye solution</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block"><span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><span>Superfat</span><span className="font-data text-[hsl(var(--primary))]">{superfat}%</span></span><input type="range" min="0" max="15" step="0.5" value={superfat} onChange={(event) => { setSuperfat(Number(event.target.value)); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="w-full accent-[hsl(var(--primary))]" data-testid="input-superfat" /><div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]"><span>0%</span><span>15%</span></div></label>
              <label className="block"><span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><span>Lye concentration</span><span className="font-data text-[hsl(var(--primary))]">{concentration}%</span></span><input type="range" min="25" max="50" step="1" value={concentration} onChange={(event) => { setConcentration(Number(event.target.value)); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="w-full accent-[hsl(var(--primary))]" data-testid="input-concentration" /><div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]"><span>25%</span><span>50%</span></div></label>
            </div>
            {superfat > 10 && <div role="status" data-testid="status-high-superfat" className="mt-5 flex gap-3 rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert size={19} className="mt-0.5 shrink-0" /><span><strong>High-superfat advisory.</strong> Above 10% superfat can leave a softer bar and more unsaponified oils. Consider testing a small batch and checking shelf life.</span></div>}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--accent)/.08)] p-4 text-sm leading-6 text-[hsl(var(--accent-foreground))]"><strong>Safety first.</strong> Add lye to water, never water to lye. Wear eye protection, gloves, and long sleeves, and work with ventilation.</div>
          </div>
          <div className="print-card rounded-3xl border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] p-5 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 04</p><h2 className="mt-2 font-display text-3xl">Check your formula</h2><p className="mt-2 max-w-lg text-sm text-[hsl(var(--muted-foreground))]">Validate the percentages and SAP inputs before you print or save this batch.</p></div><button type="button" onClick={validate} className={`${buttonPrimary} shrink-0`} data-testid="button-validate-formula"><Check size={17} /> Validate formula</button></div>{validated && <div className={`mt-5 rounded-2xl p-4 text-sm ${validationErrors.length ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : 'bg-[hsl(184_75%_35%/.12)] text-[hsl(var(--primary))]'}`}>{validationErrors.length ? <ul className="list-disc space-y-1 pl-5">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul> : <div className="flex items-center gap-2 font-bold"><Check size={17} /> Looks good. This formula is ready to review below.</div>}</div>}</div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="print-card rounded-3xl bg-[hsl(193_46%_22%)] p-6 text-[hsl(var(--background))] shadow-lift sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Your formula</p><h2 className="mt-2 font-display text-3xl">NaOH + water</h2></div><Beaker className="text-[hsl(var(--accent))]" size={25} /></div>
            {visibleResult ? (
              <div data-testid="result-validated-formula">
                <div className="mt-8 space-y-4">
                  <div className="flex items-end justify-between border-b border-white/15 pb-4"><span className="text-sm text-white/65">Sodium hydroxide</span><strong className="font-data text-3xl text-[hsl(var(--accent))]" data-testid="result-naoh">{visibleResult.naoh.toFixed(1)} g</strong></div>
                  <div className="flex items-end justify-between border-b border-white/15 pb-4"><span className="text-sm text-white/65">Distilled water</span><strong className="font-data text-3xl" data-testid="result-water">{visibleResult.water.toFixed(1)} g</strong></div>
                  <div className="flex items-end justify-between border-b border-white/15 pb-4"><span className="text-sm text-white/65">Lye solution</span><strong className="font-data text-xl">{visibleResult.total.toFixed(1)} g</strong></div>
                  <div className="flex items-end justify-between"><span className="text-sm text-white/65">Pre-saponification batch</span><strong className="font-data text-xl" data-testid="result-batch-total">{visibleResult.batchTotal.toFixed(1)} g</strong></div>
                </div>
                <div className="mt-7 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/80">Calculated with source-linked NaOH SAP values. These references still need administrator review; this is not an approval of the recipe.</div>
              </div>
            ) : <div role="status" data-testid="status-formula-placeholder" className="mt-8 rounded-2xl border border-dashed border-white/30 bg-white/10 p-5 text-sm leading-6 text-white/80">Your NaOH and water amounts will appear here after you add oils and explicitly validate a complete formula. Changes to a validated recipe require a new check.</div>}
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
              <div className="flex justify-between gap-3"><span>Water at {concentration}% lye concentration<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">{visibleResult.naoh.toFixed(2)} × (100/{concentration} − 1)</span></span><strong className="font-data">{visibleResult.water.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3 border-t border-[hsl(var(--border))] pt-4"><span>Total oils</span><strong className="font-data">{totalOilGrams.toFixed(2)} g</strong></div>
              <div className="flex justify-between gap-3"><span>Total before saponification<br /><span className="text-xs text-[hsl(var(--muted-foreground))]">oils + NaOH + water</span></span><strong className="font-data">{visibleResult.batchTotal.toFixed(2)} g</strong></div>
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