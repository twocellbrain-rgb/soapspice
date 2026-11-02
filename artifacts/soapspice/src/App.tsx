import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, Show, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowRight,
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
import { Link, Route, Switch, Redirect, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { getGetIngredientQueryKey, useGetIngredient, useGetIngredients, useGetIngredientStaff, getGetIngredientStaffQueryKey, useListRecipes, getListRecipesQueryKey, createRecipe, updateRecipe, deleteRecipe, importRecipe } from '@workspace/api-client-react';
import type { RecipeInput, Recipe } from '@workspace/api-client-react';
import { calculateNaohFormula, fragrancesAtScentStrength, GRAMS_PER_OUNCE, inferScentStrength, oilWeightTotal, percentagesFromWeights, scentStrengthAmounts, validateNaohFormula, type FragranceRow, type ScentStrength } from '@/lib/formulation';
import FragranceSection from '@/components/FragranceSection';
import FormulaResults from '@/components/FormulaResults';
import IngredientAdmin from '@/components/IngredientAdmin';
import StarterGuideAdmin from '@/components/StarterGuideAdmin';
import CalculatorIngredientProductRecommendations from '@/components/CalculatorIngredientProductRecommendations';
import CalculatorIngredientProductsAdmin from '@/components/CalculatorIngredientProductsAdmin';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import SoapmakingGlossaryPage from '@/pages/soapmaking-glossary';
import HowToStartSoapmakingPage from '@/pages/how-to-start-soapmaking';
import SoapmakingLibraryPage from '@/pages/soapmaking-library';
import FormulaPrintPage from '@/pages/formula-print';
import NotFound from '@/pages/not-found';
import './bright-crafted.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
// Replit's managed Clerk integration injects this at publish/build time. It is
// intentionally empty in development, when Clerk calls its development FAPI
// directly. Do not hardcode a path or infer production from NODE_ENV here:
// the deployment supplies the correct proxy URL for its own hostname.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}
if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: { logoPlacement: 'inside' as const, logoLinkUrl: basePath || '/', logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: '#147d80', colorForeground: '#193d40', colorMutedForeground: '#536a6b',
    colorDanger: '#b03636', colorBackground: '#fffdf8', colorInput: '#ffffff',
    colorInputForeground: '#193d40', colorNeutral: '#c4d0cb',
    fontFamily: 'DM Sans, sans-serif', borderRadius: '0.9rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#193d40]', headerSubtitle: 'text-[#536a6b]',
    socialButtonsBlockButtonText: 'text-[#193d40]', formFieldLabel: 'text-[#193d40]',
    footerActionLink: 'text-[#147d80]', footerActionText: 'text-[#536a6b]',
    dividerText: 'text-[#536a6b]', identityPreviewEditButton: 'text-[#147d80]',
    formFieldSuccessText: 'text-[#147d80]', alertText: 'text-[#193d40]',
    formButtonPrimary: 'bg-[#147d80] text-white', formFieldInput: 'bg-white text-[#193d40]',
  },
};
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
  sapProvenance: string;
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

function AccountNav({ onNavigate }: { onNavigate: () => void }) {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const staff = useGetIngredientStaff({ query: { queryKey: getGetIngredientStaffQueryKey(), enabled: Boolean(isSignedIn), retry: false } });
  return <>
    <Show when="signed-in">
      <Link href="/my-formulas" onClick={onNavigate}>My formulas</Link>
      {staff.data && <Link href="/ingredient-admin" onClick={onNavigate}>Review ingredients</Link>}
      {staff.data && <Link href="/starter-guide-admin" onClick={onNavigate}>Manage starter guide</Link>}
      {staff.data && <Link href="/calculator-product-admin" onClick={onNavigate}>Manage calculator product cards</Link>}
      <button type="button" onClick={() => { onNavigate(); void signOut({ redirectUrl: basePath || '/' }); }}>Sign out</button>
    </Show>
    <Show when="signed-out">
      <Link href="/sign-in" onClick={onNavigate}>Sign in</Link>
      <Link href="/sign-up" onClick={onNavigate}>Create account</Link>
    </Show>
  </>;
}

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
  const [location] = useLocation();
  const closeMenu = () => setMenuOpen(false);
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
            <Link href="/calculators/cold-process-soap" onClick={closeMenu} aria-current={location === '/calculators/cold-process-soap' || location === '/my-formulas' ? 'page' : undefined} data-testid="link-calculator">Calculator</Link>
            <Link href="/ingredients" onClick={closeMenu} aria-current={location === '/ingredients' || location.startsWith('/ingredients/') ? 'page' : undefined} data-testid="link-ingredients">Ingredient catalog</Link>
            <Link href="/how-to-start-soapmaking" onClick={closeMenu} aria-current={location === '/how-to-start-soapmaking' ? 'page' : undefined} data-testid="link-how-to-start">How to start</Link>
            <Link href="/soapmaking-glossary" onClick={closeMenu} aria-current={location === '/soapmaking-glossary' ? 'page' : undefined} data-testid="link-glossary">Glossary</Link>
            <Link href="/soapmaking-library" onClick={closeMenu} aria-current={location === '/soapmaking-library' ? 'page' : undefined} data-testid="link-soapmaking-library">Source library</Link>
            <AccountNav onNavigate={closeMenu} />
            <Link href="/calculators/cold-process-soap" onClick={closeMenu} data-testid="link-start-formula" className="sc-nav-cta">Start a formula <ArrowRight size={16} /></Link>
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
      <img className="sc-intro-photo" src={`${publicImages}soap-ingredient-flatlay.webp`} alt="Soap and botanical materials arranged for a handmade batch" width="1600" height="1067" />
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
            <article><span className="sc-step-no">03 / YOUR BATCH</span><div className="sc-step-icon sc-step-spark"><Sparkles size={22} /></div><h3>Make it yours.</h3><p>Save your formula to your account, print it, then get making.</p><Link href="/calculators/cold-process-soap" className="sc-step-link" data-testid="card-home-calculator">Build your first bar <ArrowRight size={15} /></Link></article>
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
        <section className="sc-inspiration" aria-labelledby="sc-inspiration-title">
          <div className="sc-inspiration-head">
            <div>
              <span className="sc-eyebrow">Color, texture, and craft</span>
              <h2 id="sc-inspiration-title">A little inspiration for your next batch.</h2>
            </div>
            <p>Every handmade bar has its own colors, textures, and finishing touches. Find a detail you love and make it your own.</p>
          </div>
          <div className="sc-inspiration-grid">
            <figure className="sc-inspiration-card">
              <img src={`${publicImages}soap-inspiration-color.webp`} alt="Colorful swirled soap bars displayed with wooden tools" width="1600" height="1067" loading="lazy" />
              <figcaption>Color and craft in every cut</figcaption>
            </figure>
            <figure className="sc-inspiration-card">
              <img src={`${publicImages}soap-inspiration-stack.webp`} alt="Three bright handmade soap bars stacked beside woven cloths" width="1600" height="1063" loading="lazy" />
              <figcaption>Play with color and texture</figcaption>
            </figure>
            <figure className="sc-inspiration-card">
              <img src={`${publicImages}soap-inspiration-earthy.webp`} alt="Warm-toned soap bars displayed beside cinnamon sticks and a small jar" width="1600" height="938" loading="lazy" />
              <figcaption>Earthy colors, natural details</figcaption>
            </figure>
            <figure className="sc-inspiration-card">
              <img src={`${publicImages}soap-inspiration-botanical.webp`} alt="Finished handmade bars arranged with leaves and pink blossoms" width="1600" height="925" loading="lazy" />
              <figcaption>Botanical finishing touches</figcaption>
            </figure>
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
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const client = useQueryClient();
  const recipesQuery = useListRecipes({ query: { queryKey: getListRecipesQueryKey(), enabled: Boolean(isSignedIn), staleTime: 0, refetchOnMount: 'always' } });
  const catalogQuery = useGetIngredients();
  const ingredients = (catalogQuery.data ?? []) as Ingredient[];
  const seeded = useRef(false);
  const [superfat, setSuperfat] = useState(5);
  const [oilInputUnit, setOilInputUnit] = useState<OilInputUnit>('g');
  const [percentBaseGrams, setPercentBaseGrams] = useState(0);
  const [liquidType, setLiquidType] = useState<LiquidType>('distilled-water');
  const [customLiquid, setCustomLiquid] = useState('');
  const [legacyLiquidNotice, setLegacyLiquidNotice] = useState('');
  const [oils, setOils] = useState<OilRow[]>([]);
  const [fragrances, setFragrances] = useState<FragranceRow[]>([]);
  const [scentStrength, setScentStrength] = useState<ScentStrength>('medium');
  const [selectedId, setSelectedId] = useState('');
  const [validated, setValidated] = useState(false);
  const [validatedFingerprint, setValidatedFingerprint] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [recipeName, setRecipeName] = useState('My first bar');
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [openedSnapshot, setOpenedSnapshot] = useState<Recipe | null>(null);
  const [busy, setBusy] = useState(false);
  const [browserRecipes] = useState<SavedRecipe[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('soapspice-recipes') ?? '[]');
      return Array.isArray(stored) ? stored.filter((item): item is SavedRecipe => typeof item === 'object' && item !== null && typeof item.id === 'string' && Array.isArray(item.oils)) : [];
    } catch { return []; }
  });
  const [importedIds, setImportedIds] = useState<string[]>([]);
  useEffect(() => {
    setActiveRecipeId(null); setOpenedSnapshot(null);
    if (!user?.id) { setImportedIds([]); return; }
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(`soapspice-imported-${user.id}`) ?? '[]');
      setImportedIds(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []);
    } catch { setImportedIds([]); }
  }, [user?.id]);

  useEffect(() => {
    if (!seeded.current && ingredients.length > 0) {
      const requested = new URLSearchParams(window.location.search).get('ingredient');
      const ingredient = ingredients.find((item) => item.id === requested);
      if (ingredient) {
        setOils([{ id: ingredient.id, name: ingredient.name, percentage: 0, weight: 0 }]);
      }
      seeded.current = true;
    }
  }, [ingredients]);

  const ingredientMap = useMemo(() => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])), [ingredients]);
  const totalPercent = oils.reduce((sum, oil) => sum + oil.percentage, 0);
  const totalOilGrams = oilWeightTotal(oils);
  const liquidName = liquidType === 'other' ? customLiquid.trim() || 'Other liquid' : liquidNames[liquidType];
  const baseFormulaInput = useMemo(
    () => ({ oils, ingredients: ingredientMap, totalOilGrams, superfat }),
    [oils, ingredientMap, totalOilGrams, superfat],
  );
  const baseCalculation = useMemo(
    () => validateNaohFormula(baseFormulaInput).length === 0
      ? calculateNaohFormula(baseFormulaInput)
      : null,
    [baseFormulaInput],
  );
  const strengthAmounts = useMemo(
    () => scentStrengthAmounts(totalOilGrams, baseCalculation?.naoh ?? Number.NaN),
    [totalOilGrams, baseCalculation?.naoh],
  );
  const calculatedFragrances = useMemo(
    () => fragrancesAtScentStrength(
      fragrances,
      scentStrength,
      totalOilGrams,
      baseCalculation?.naoh ?? Number.NaN,
    ),
    [fragrances, scentStrength, totalOilGrams, baseCalculation?.naoh],
  );
  const formulaInput = useMemo(
    () => ({ oils, ingredients: ingredientMap, totalOilGrams, superfat, fragrances: calculatedFragrances }),
    [oils, ingredientMap, totalOilGrams, superfat, calculatedFragrances],
  );
  const formulaFingerprint = JSON.stringify({
    oils, totalOilGrams, superfat, fragrances: calculatedFragrances, scentStrength, liquidType, customLiquid,
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
  const savedRecipes = recipesQuery.data ?? [];
  const catalogWarnings = openedSnapshot?.oils.flatMap(oil => {
    const current = ingredientMap.get(oil.id);
    if (!current) return [`${oil.name} is missing from the current catalog. Replace it before saving or exporting.`];
    if (oil.savedSap === null) return [`${oil.name}: this older save has no historical SAP snapshot. Current NaOH SAP is ${current.naohSap.toFixed(4)}; verify its source.`];
    if (Math.abs(oil.savedSap - current.naohSap) > 0.0000001) return [`${oil.name}: NaOH SAP changed from ${oil.savedSap.toFixed(4)} to ${current.naohSap.toFixed(4)}. Revalidate before using.`];
    return [];
  }) ?? [];

  const inferRecipeScentStrength = (
    recipeFragrances: FragranceRow[] | undefined,
    recipeOils: { id: string; weight: number; savedSap?: number | null }[],
    recipeSuperfat: number,
  ) => {
    const recipeOilGrams = oilWeightTotal(recipeOils);
    const recipeNaohGrams = recipeOils.reduce((sum, oil) => {
      const sap = ingredientMap.get(oil.id)?.naohSap ?? oil.savedSap ?? 0;
      return sum + oil.weight * sap * (1 - recipeSuperfat / 100);
    }, 0);
    return inferScentStrength(recipeFragrances ?? [], recipeOilGrams, recipeNaohGrams);
  };

  const updateOils = (next: OilRow[]) => { setOils(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const changePercent = (id: string, value: number) => updateOils(oils.map((oil) => oil.id === id ? { ...oil, percentage: value, weight: percentBaseGrams * value / 100 } : oil));
  const changeWeight = (id: string, value: number) => updateOils(percentagesFromWeights(oils.map((oil) => oil.id === id ? { ...oil, weight: value } : oil)));
  const changeOilAmount = (id: string, value: number) => {
    if (oilInputUnit === 'percent') changePercent(id, value);
    else changeWeight(id, oilInputUnit === 'oz' ? value * GRAMS_PER_OUNCE : value);
  };
  const changeOilInputUnit = (nextUnit: OilInputUnit) => {
    if (nextUnit === 'percent') {
      if (totalOilGrams <= 0) return;
      setPercentBaseGrams(totalOilGrams);
      setOils(percentagesFromWeights(oils));
    } else if (oilInputUnit === 'percent') {
      setOils(percentagesFromWeights(oils));
    }
    setOilInputUnit(nextUnit);
    setValidated(false); setValidationErrors([]); setSaveFeedback('');
  };
  const addOil = () => {
    const ingredient = ingredientMap.get(selectedId);
    if (!ingredient || oils.some((oil) => oil.id === ingredient.id)) return;
    updateOils([...oils, { id: ingredient.id, name: ingredient.name, percentage: 0, weight: 0 }]);
    setSelectedId('');
  };
  const removeOil = (id: string) => {
    const next = oils.filter((oil) => oil.id !== id);
    if (next.length === 0) {
      setOilInputUnit('g');
      setPercentBaseGrams(0);
    }
    updateOils(oilInputUnit === 'percent' ? next : percentagesFromWeights(next));
  };
  const updateFragrances = (next: FragranceRow[]) => { setFragrances(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const updateScentStrength = (next: ScentStrength) => { setScentStrength(next); setValidated(false); setValidationErrors([]); setSaveFeedback(''); };
  const validate = () => {
    setValidationErrors(currentErrors); setValidatedFingerprint(currentErrors.length ? '' : formulaFingerprint); setValidated(true); setSaveFeedback('');
  };
  const recipeInput = (): RecipeInput => ({
    name: recipeName.trim() || 'Untitled formula', batchSize: totalOilGrams, unit: 'g', superfat, oils: oils.map(oil => ({ id: oil.id, percentage: oil.percentage, weight: oil.weight })),
    fragrances: calculatedFragrances, liquidType, customLiquid, oilInputUnit, liquidMethod: 'batch-22',
  });
  const refreshRecipes = () => client.invalidateQueries({ queryKey: getListRecipesQueryKey() });
  const saveRecipe = async () => {
    if (!isSignedIn) { setSaveFeedback('Sign in to save across devices. Earlier browser saves remain below.'); return; }
    if (currentErrors.length || !calculation || !freshValidation) {
      setValidationErrors(currentErrors);
      setValidated(currentErrors.length > 0);
      setSaveFeedback(currentErrors.length
        ? 'Not saved. Resolve the formula issues above and try again.'
        : 'Not saved. Validate the current formula before saving.');
      return;
    }
    setBusy(true);
    try {
      const saved = activeRecipeId ? await updateRecipe(activeRecipeId, recipeInput()) : await createRecipe(recipeInput());
      setActiveRecipeId(saved.id); setOpenedSnapshot(saved);
      await refreshRecipes();
      setValidated(true);
      setValidationErrors([]);
      setLegacyLiquidNotice('');
      setSaveFeedback(`Saved “${saved.name}” to your account.`);
    } catch {
      setSaveFeedback('Could not save to your account. Changes remain on this page; try again.');
    } finally { setBusy(false); }
  };
  const loadRecipe = (id: string) => {
    const recipe = savedRecipes.find((saved) => saved.id === id);
    if (!recipe) return;
    setActiveRecipeId(recipe.id); setOpenedSnapshot(recipe);
    seeded.current = true;
    setRecipeName(recipe.name); setSuperfat(recipe.superfat);
    setScentStrength(inferRecipeScentStrength(recipe.fragrances, recipe.oils, recipe.superfat));
    setPercentBaseGrams(oilWeightTotal(recipe.oils));
    setOils(recipe.oils.map(o => ({ id: o.id, name: ingredientMap.get(o.id)?.name ?? o.name, percentage: o.percentage, weight: o.weight })));
    setFragrances(recipe.fragrances ?? []);
    setLiquidType(recipe.liquidType ?? 'distilled-water'); setCustomLiquid(recipe.customLiquid ?? '');
    setOilInputUnit(recipe.oilInputUnit ?? 'percent'); setValidated(false); setValidatedFingerprint(''); setValidationErrors([]);
    setLegacyLiquidNotice(recipe.liquidMethod === 'batch-22' ? ''
      : typeof recipe.concentration === 'number'
        ? `This saved formula used a ${recipe.concentration}% sodium hydroxide solution concentration. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.`
        : 'This saved formula used the earlier 2:1 liquid-to-NaOH baseline. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.');
    setSaveFeedback(`Opened “${recipe.name}”. Validate it against the current catalog before printing.`);
  };
  const openBrowserRecipe = (recipe: SavedRecipe) => {
    setActiveRecipeId(null);
    setOpenedSnapshot({
      id: recipe.id, name: recipe.name, batchSize: recipe.batchSize, unit: recipe.unit,
      superfat: recipe.superfat, concentration: recipe.concentration, imported: true,
      createdAt: recipe.savedAt, updatedAt: recipe.savedAt,
      fragrances: recipe.fragrances, liquidType: recipe.liquidType, customLiquid: recipe.customLiquid,
      oilInputUnit: recipe.oilInputUnit, liquidMethod: recipe.liquidMethod,
      oils: recipe.oils.map(o => ({ id: o.id, name: o.name, percentage: o.percentage, weight: o.weight, savedSap: null })),
    });
    seeded.current = true;
    setScentStrength(inferRecipeScentStrength(recipe.fragrances, recipe.oils, recipe.superfat));
    setRecipeName(recipe.name); setSuperfat(recipe.superfat);
    setPercentBaseGrams(oilWeightTotal(recipe.oils));
    setOils(recipe.oils); setFragrances(recipe.fragrances ?? []);
    setLiquidType(recipe.liquidType ?? 'distilled-water'); setCustomLiquid(recipe.customLiquid ?? '');
    setOilInputUnit(recipe.oilInputUnit ?? 'percent'); setValidated(false); setValidatedFingerprint(''); setValidationErrors([]);
    setLegacyLiquidNotice(recipe.liquidMethod === 'batch-22' ? ''
      : typeof recipe.concentration === 'number'
        ? `This saved formula used a ${recipe.concentration}% sodium hydroxide solution concentration. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.`
        : 'This saved formula used the earlier 2:1 liquid-to-NaOH baseline. Its liquid amount now uses the 22%-of-total-batch estimate and may change. Review before making soap.');
    setSaveFeedback(`Opened the browser copy of “${recipe.name}”. The original remains untouched.`);
  };
  const importBrowserRecipe = async (recipe: SavedRecipe) => {
    if (!user?.id || busy) return;
    setBusy(true);
    try {
      await importRecipe({
        legacyId: recipe.id, name: (recipe.name || 'Untitled formula').slice(0, 120),
        batchSize: recipe.batchSize, unit: recipe.unit, superfat: recipe.superfat,
        concentration: recipe.concentration, fragrances: recipe.fragrances,
        liquidType: recipe.liquidType, customLiquid: recipe.customLiquid, oilInputUnit: recipe.oilInputUnit,
        liquidMethod: recipe.liquidMethod,
        oils: recipe.oils.map(o => ({ id: o.id, name: o.name, percentage: o.percentage, weight: o.weight })),
      });
      const next = [...new Set([...importedIds, recipe.id])];
      localStorage.setItem(`soapspice-imported-${user.id}`, JSON.stringify(next));
      setImportedIds(next);
      await refreshRecipes();
      setSaveFeedback(`Imported “${recipe.name}” as a draft. The browser copy remains untouched.`);
    } catch {
      setSaveFeedback(`Could not import “${recipe.name}”. The original is still here; check its values and retry.`);
    } finally { setBusy(false); }
  };
  const removeRecipe = async (recipe: Recipe) => {
    if (!window.confirm(`Delete “${recipe.name}” from your account? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteRecipe(recipe.id);
      if (activeRecipeId === recipe.id) { setActiveRecipeId(null); setOpenedSnapshot(null); setValidated(false); }
      await refreshRecipes();
      setSaveFeedback(`Deleted “${recipe.name}”.`);
    } catch { setSaveFeedback('Could not delete this formula. Try again.'); }
    finally { setBusy(false); }
  };
  const duplicateRecipe = async (recipe: Recipe) => {
    setBusy(true);
    try {
      await createRecipe({
        name: `${recipe.name} (copy)`.slice(0, 120), batchSize: oilWeightTotal(recipe.oils), unit: 'g', superfat: recipe.superfat,
        oils: recipe.oils.map(o => ({ id: o.id, percentage: o.percentage, weight: o.weight })),
        fragrances: recipe.fragrances, liquidType: recipe.liquidType, customLiquid: recipe.customLiquid,
        oilInputUnit: recipe.oilInputUnit, liquidMethod: 'batch-22',
      });
      await refreshRecipes();
      setSaveFeedback(`Duplicated “${recipe.name}”. Open the copy from the list to edit it.`);
    } catch { setSaveFeedback('Could not duplicate: check the current catalog and validate this formula first.'); }
    finally { setBusy(false); }
  };
  const exportFormula = () => {
    if (!visibleResult || !isSignedIn) return;
    const content = {
      name: recipeName, input: recipeInput(), calculatedAt: new Date().toISOString(),
      ingredients: visibleResult.ingredientLye.map(line => ({
        ...line, name: ingredientMap.get(line.id)?.name, sourceTitle: ingredientMap.get(line.id)?.sapSourceTitle,
        sourceUrl: ingredientMap.get(line.id)?.sapSourceUrl, verificationStatus: ingredientMap.get(line.id)?.verificationStatus,
      })),
      naohGrams: visibleResult.naoh, liquidGrams: visibleResult.liquid, liquidName,
      fragranceGrams: visibleResult.fragranceTotalGrams,
      note: 'Calculated from current source-linked catalog values and an approximate liquid baseline. Independently verify NaOH purity, SAP, fragrance limits, and process before making soap.',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `${recipeName.trim().replace(/[^a-z0-9_-]+/gi, '-').slice(0, 50) || 'formula'}.json`;
    link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const openPrintableFormula = () => {
    if (!visibleResult) return;
    const draftId = crypto.randomUUID();
    const storageKey = `soapspice-print:${draftId}`;
    const printData = {
      name: recipeName.trim() || 'Untitled formula',
      oils: oils.map((oil) => ({
        ...oil,
        name: ingredientMap.get(oil.id)?.name ?? oil.name,
        sap: ingredientMap.get(oil.id)?.naohSap ?? 0,
      })),
      oilInputUnit,
      fragrances: calculatedFragrances,
      result: visibleResult,
      liquidName,
      superfat,
      generatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(printData));
    } catch {
      setSaveFeedback('Could not prepare the print sheet in this browser. Check that local storage is available, then try again.');
      return;
    }
    window.setTimeout(() => localStorage.removeItem(storageKey), 5 * 60 * 1000);
    const url = `${basePath}/batch-sheet?draft=${encodeURIComponent(draftId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const available = ingredients.filter((ingredient) => !oils.some((oil) => oil.id === ingredient.id));

  return (
    <Shell>
      <section className="sc-calculator-intro mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-3xl animate-rise"><div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Calculator / NaOH cold process</div><h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-6xl">Turn a good idea into a <span className="text-[hsl(var(--primary))]">clear formula.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Build a bar from source-linked SAP values. This first release supports NaOH cold-process bars only.</p></div><div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))]"><CircleAlert size={18} /> Always wear proper safety gear.</div></div>
        <div role="note" data-testid="notice-sap-review" className="mt-8 flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--secondary))] px-5 py-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span>{ingredients.length === 0 || ingredients.some(item => item.verificationStatus !== 'administrator-verified') ? <><strong>Source-linked, not yet administrator reviewed.</strong> Reference SAP values still need administrator review. </> : <><strong>Catalog SAP values reviewed.</strong> Supplier-specific values may differ. </>}Check the linked sources and independently verify the formula before handling sodium hydroxide (NaOH, commonly called lye).</span></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 lg:grid-cols-[1.4fr_.6fr] lg:px-8">
        <div className="space-y-6">
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 01</p><h2 className="mt-2 font-display text-3xl">Choose your ingredients</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Enter the weight of each oil in grams or ounces. Their sum determines the formula size, NaOH, and liquid.</p></div><div className="flex items-center gap-2"><select aria-label="Add an ingredient" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-11 max-w-[190px] rounded-full border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-add-ingredient"><option value="">Add an ingredient</option>{available.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><button type="button" onClick={addOil} disabled={!selectedId} className={`${buttonPrimary} h-11 px-4`} data-testid="button-add-ingredient"><Plus size={17} /> Add</button></div></div>
            {catalogQuery.isLoading && <div className="space-y-3 pt-6"><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /></div>}
            {catalogQuery.isError && <div className="pt-6"><QueryState isLoading={false} isError onRetry={() => void catalogQuery.refetch()} /></div>}
            {!catalogQuery.isLoading && !catalogQuery.isError && <div className="pt-6">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <label htmlFor="oil-input-unit" className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Enter oil amounts in</label>
                <select id="oil-input-unit" value={oilInputUnit} onChange={(event) => changeOilInputUnit(event.target.value as OilInputUnit)} className="h-10 rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-oil-input-unit">
                  <option value="g">Grams (g)</option><option value="oz">Ounces (oz)</option><option value="percent" disabled={totalOilGrams <= 0 && oilInputUnit !== 'percent'}>Percent (%)</option>
                </select>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Enter weights first; then you can adjust percentages against that total.</span>
              </div>
              {oilInputUnit === 'percent' && <p className="mb-4 rounded-xl bg-[hsl(var(--secondary))] px-4 py-3 text-xs text-[hsl(var(--secondary-foreground))]">Percentages use the {percentBaseGrams.toFixed(1)} g oil total set by your weights. Make them add to 100% before validating. To change the total, switch back to grams or ounces.</p>}
              <div className="hidden grid-cols-[minmax(0,1fr)_145px_38px] gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:grid"><span>Ingredient</span><span>{oilInputUnit === 'percent' ? 'Percent (%)' : oilInputUnit === 'g' ? 'Weight (g)' : 'Weight (oz)'}</span><span /></div>
              {oils.length === 0 && <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Choose an ingredient above to begin.</div>}
              {oils.map((oil) => {
                const amount = oilInputUnit === 'percent' ? oil.percentage : oilInputUnit === 'oz' ? oil.weight / GRAMS_PER_OUNCE : oil.weight;
                return <div key={oil.id} className="mb-3 grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:grid-cols-[minmax(0,1fr)_145px_38px] sm:items-center">
                  <div><div className="flex items-center gap-2 font-bold">{oil.name}<span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">{ingredientMap.get(oil.id)?.category ?? 'Missing'}</span></div>{ingredientMap.get(oil.id) ? <a href={ingredientMap.get(oil.id)?.sapSourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--primary))] hover:underline" data-testid={`link-source-${oil.id}`}>SAP {ingredientMap.get(oil.id)?.naohSap.toFixed(3)} <ExternalLink size={11} /></a> : <span className="text-xs text-red-700">Not in current catalog · replace to calculate</span>}<p className="mt-1 font-data text-[11px] text-[hsl(var(--muted-foreground))]">{oil.percentage.toFixed(1)}% · {oil.weight.toFixed(1)} g · {(oil.weight / GRAMS_PER_OUNCE).toFixed(2)} oz</p></div>
                  <label className="flex items-center gap-2 sm:block"><span className="text-xs text-[hsl(var(--muted-foreground))] sm:hidden">{oilInputUnit === 'percent' ? 'Percent' : oilInputUnit === 'g' ? 'Grams' : 'Ounces'}</span><input type="number" min="0" step="any" value={Number.isFinite(amount) ? Number(amount.toFixed(oilInputUnit === 'percent' ? 2 : 3)) : 0} onChange={(event) => changeOilAmount(oil.id, Number(event.target.value))} className="h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm font-data outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid={`input-amount-${oil.id}`} /></label>
                  <button type="button" onClick={() => removeOil(oil.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))]" aria-label={`Remove ${oil.name}`} data-testid={`button-remove-${oil.id}`}><Trash2 size={16} /></button>
                </div>;
              })}
              <div className={`mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${totalOilGrams > 0 && Math.abs(totalPercent - 100) <= .01 ? 'bg-[hsl(184_75%_35%/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--destructive)/.08)] text-[hsl(var(--destructive))]'}`} data-testid="result-oil-total"><span>Total oils · {totalPercent.toFixed(1)}%</span><span className="font-data">{totalOilGrams.toFixed(1)} g · {(totalOilGrams / GRAMS_PER_OUNCE).toFixed(2)} oz</span></div>
            </div>}
          </div>
          <div className="print-card rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 02</p>
            <h2 className="mt-2 font-display text-3xl">Choose your mixing liquid</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block"><span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><span>Superfat</span><span className="font-data text-[hsl(var(--primary))]">{superfat}%</span></span><input type="range" min="0" max="15" step="0.5" value={superfat} onChange={(event) => { setSuperfat(Number(event.target.value)); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="w-full accent-[hsl(var(--primary))]" data-testid="input-superfat" /><div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]"><span>0%</span><span>15%</span></div></label>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Liquid for NaOH solution</span><select value={liquidType} onChange={(event) => { setLiquidType(event.target.value as LiquidType); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="select-liquid-type"><option value="distilled-water">Distilled water</option><option value="goat-milk">Goat milk</option><option value="cow-milk">Cow milk</option><option value="other">Other liquid</option></select></label>
            </div>
            {liquidType === 'other' && <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Liquid name</span><input type="text" value={customLiquid} onChange={(event) => { setCustomLiquid(event.target.value); setValidated(false); setValidationErrors([]); setSaveFeedback(''); }} placeholder="e.g. Coconut milk" className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" data-testid="input-custom-liquid" /></label>}
            <div role="note" className="mt-5 rounded-2xl bg-[hsl(var(--secondary))] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]" data-testid="notice-liquid-ratio"><strong>Automatic starting estimate:</strong> Liquid is approximately 22% of the complete batch before saponification (oils + NaOH + fragrance + liquid), not 22% of oils alone. Oil SAP values and superfat determine the NaOH amount, assuming 100% sodium hydroxide purity. Fragrance adds to batch weight and changes this liquid estimate slightly, but never the NaOH amount. This is our approximation of a typical liquid share, not a verified supplier formula or a recipe-specific optimum. Check the supplier’s sodium hydroxide purity and follow a tested recipe.</div>
            {legacyLiquidNotice && <div role="alert" className="mt-4 rounded-2xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-4 text-sm leading-6 text-[hsl(var(--destructive))]" data-testid="notice-legacy-liquid">{legacyLiquidNotice}</div>}
            {liquidType !== 'distilled-water' && <div role="note" className="mt-4 rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><strong>Milk and other liquids need extra care.</strong> Sugars and fats are not included in this NaOH calculation. Use a tested method for your chosen liquid and check the supplier or recipe guidance before making soap.</div>}
            {superfat > 10 && <div role="status" data-testid="status-high-superfat" className="mt-5 flex gap-3 rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]"><CircleAlert size={19} className="mt-0.5 shrink-0" /><span><strong>High-superfat advisory.</strong> Above 10% superfat can leave a softer bar and more unsaponified oils. Consider testing a small batch and checking shelf life.</span></div>}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--accent)/.08)] p-4 text-sm leading-6 text-[hsl(var(--accent-foreground))]"><strong>Safety first.</strong> Slowly add NaOH to the measured liquid, never liquid to NaOH. Wear eye protection, gloves, and long sleeves, and work with ventilation. Milk mixtures need careful temperature control.</div>
          </div>
          <FragranceSection
            fragrances={calculatedFragrances}
            totalOilGrams={totalOilGrams}
            onChange={updateFragrances}
            scentStrength={scentStrength}
            onScentStrengthChange={updateScentStrength}
            strengthAmounts={strengthAmounts}
          />
            <div className="print-card rounded-3xl border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] p-5 sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Step 04</p><h2 className="mt-2 font-display text-3xl">Check your formula</h2><p className="mt-2 max-w-lg text-sm text-[hsl(var(--muted-foreground))]">Validate oil percentages, NaOH calculations, and fragrance amounts before printing or saving. Supplier IFRA rates are screened only when you select a documented product or enter a matching rate; missing limits hold automatic fragrance amounts at zero.</p></div><button type="button" onClick={validate} className={`${buttonPrimary} shrink-0`} data-testid="button-validate-formula"><Check size={17} /> Validate formula</button></div>{validated && <div className={`mt-5 rounded-2xl p-4 text-sm ${validationErrors.length ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : freshValidation ? 'bg-[hsl(184_75%_35%/.12)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--secondary-foreground))]'}`} data-testid="status-validation">{validationErrors.length ? <ul className="list-disc space-y-1 pl-5">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul> : freshValidation ? <div className="flex items-center gap-2 font-bold"><Check size={17} /> NaOH calculation checked. Review the liquid estimate and fragrance IFRA flags below.</div> : <div className="flex items-center gap-2 font-bold"><CircleAlert size={17} /> Formula or ingredient data changed. Validate again before saving or printing.</div>}</div>}</div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))]"><ShieldCheck size={17} /><h2 className="font-bold">Save this batch</h2></div>
            {!isLoaded ? <p className="mt-3 text-sm">Checking your account…</p> : !isSignedIn ? <p className="mt-3 text-sm">Sign in to keep formulas across devices. Your earlier browser saves are still available below.</p> : null}
            {!isSignedIn && <Link href="/sign-in" className={`${buttonQuiet} mt-3`}>Sign in to save</Link>}
            {isSignedIn && <>
              <input value={recipeName} onChange={(event) => { setRecipeName(event.target.value); setSaveFeedback(''); }} className="mt-4 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" placeholder="Recipe name" data-testid="input-recipe-name" />
              <button type="button" onClick={() => void saveRecipe()} disabled={busy || catalogUnavailable} className={`${buttonPrimary} mt-3 w-full`} data-testid="button-save-recipe">{activeRecipeId ? 'Update formula' : 'Save to my account'}</button>
              {activeRecipeId && <button type="button" className={`${buttonQuiet} mt-2 w-full`} onClick={() => { setActiveRecipeId(null); setOpenedSnapshot(null); setRecipeName('New formula'); setValidated(false); setSaveFeedback('New formula: edit and validate before saving.'); }}>Save as new instead</button>}
            </>}
            {catalogWarnings.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"><strong>Review catalog changes</strong><ul className="mt-2 list-disc pl-5">{catalogWarnings.map(message => <li key={message}>{message}</li>)}</ul></div>}
            {saveFeedback && <p role="status" className={`mt-3 rounded-xl p-3 text-sm ${saveFeedback.startsWith('Saved') ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--secondary-foreground))]'}`} data-testid="status-save-feedback">{saveFeedback}</p>}
            {isSignedIn && <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">My formulas</p>
              {recipesQuery.isLoading && <p className="mt-2 text-sm">Loading your formulas…</p>}
              {recipesQuery.isError && <button type="button" onClick={() => void recipesQuery.refetch()} className={`${buttonQuiet} mt-2`}>Could not load formulas · Retry</button>}
              {!recipesQuery.isLoading && !recipesQuery.isError && savedRecipes.length === 0 && <p className="mt-2 text-sm">No account formulas yet.</p>}
              <div className="mt-2 space-y-2">{savedRecipes.map(recipe => <div key={recipe.id} className="rounded-xl border border-[hsl(var(--border))] p-3">
                <button type="button" onClick={() => loadRecipe(recipe.id)} className="w-full text-left text-sm font-bold hover:text-[hsl(var(--primary))]" data-testid={`button-load-recipe-${recipe.id}`}>{recipe.name}</button>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{recipe.imported ? 'Imported browser draft · needs validation' : 'Saved'} · {new Date(recipe.updatedAt).toLocaleDateString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => void duplicateRecipe(recipe)} className="text-xs font-bold text-[hsl(var(--primary))]">Duplicate</button>
                  <button type="button" disabled={busy} onClick={() => void removeRecipe(recipe)} className="text-xs font-bold text-red-700">Delete</button>
                </div>
              </div>)}</div>
            </div>}
            {browserRecipes.length > 0 && <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
              <p className="text-xs font-bold uppercase tracking-[.14em]">Earlier saves in this browser</p>
              <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Import each one to your account. Originals stay in this browser. Older saves lack SAP snapshots and may use a different liquid estimate.</p>
              {browserRecipes.map(recipe => <div key={recipe.id} className="mt-2 flex items-center justify-between gap-2 text-sm"><span className="truncate">{recipe.name}</span><div className="flex gap-2"><button type="button" onClick={() => openBrowserRecipe(recipe)} className="shrink-0 font-bold text-[hsl(var(--primary))]">Open</button>{isSignedIn && <button type="button" disabled={busy} onClick={() => void importBrowserRecipe(recipe)} className="shrink-0 font-bold text-[hsl(var(--primary))] disabled:opacity-50">{importedIds.includes(recipe.id) ? 'Import again' : 'Import'}</button>}</div></div>)}
            </div>}
          </div>
          <button type="button" onClick={exportFormula} disabled={!visibleResult || !isSignedIn} className={`${buttonQuiet} print-hide w-full disabled:opacity-45`}>Export validated formula (.json)</button>
          <button type="button" onClick={openPrintableFormula} disabled={!visibleResult} className={`${buttonQuiet} print-hide w-full disabled:cursor-not-allowed disabled:opacity-45`} data-testid="button-print-formula"><Printer size={17} /> Open batch &amp; shopping sheet</button>
          <p className="print-hide text-center text-xs leading-5 text-[hsl(var(--muted-foreground))]">Opens a separate print-ready tab. Allow pop-ups for SoapSpice if your browser blocks it.</p>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6"><div className="flex items-center gap-2 text-[hsl(var(--secondary-foreground))]"><CircleAlert size={17} /><h2 className="font-bold">A note on the numbers</h2></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--secondary-foreground)/.8)]">{ingredients.some(item => item.verificationStatus !== 'administrator-verified') || ingredients.length === 0 ? 'SAP values are linked to their sources, but still need administrator review.' : 'Catalog SAP values have been reviewed, but supplier specifications may differ.'} Treat every result as a starting point and verify your process independently.</p></div>
        </aside>
        {visibleResult ? (
          <>
            <FormulaResults
              oils={oils.map((oil) => ({
                ...oil,
                name: ingredientMap.get(oil.id)?.name ?? oil.name,
                sap: ingredientMap.get(oil.id)!.naohSap,
              }))}
              oilInputUnit={oilInputUnit}
              fragrances={calculatedFragrances}
              result={visibleResult}
              liquidName={liquidName}
              superfat={superfat}
            />
            <CalculatorIngredientProductRecommendations
              selections={oils.map((oil) => ({
                id: oil.id,
                name: ingredientMap.get(oil.id)?.name ?? oil.name,
              }))}
            />
          </>
        ) : (
          <div role="status" data-testid="status-formula-placeholder" className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-white p-6 text-sm leading-6 text-[hsl(var(--muted-foreground))] lg:col-span-2">
            Your ingredient inputs, required NaOH and solution liquid, fragrance amounts, and total batch weight will appear here after you validate a complete formula.
          </div>
        )}
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
    } else if (location === '/calculators/cold-process-soap' || location === '/my-formulas') {
      title = 'Cold-Process Soap Calculator | SoapSpice';
      description = 'Calculate sodium hydroxide (NaOH) and liquid for cold-process bar soap from source-linked oil and butter SAP values. Review your formula and sodium-hydroxide safety guidance.';
    } else if (location === '/batch-sheet' || location === '/formula-print') {
      title = 'Batch Formula and Shopping Links | SoapSpice';
      description = 'Review a validated cold-process soap batch formula and open Amazon shopping searches for each selected oil and butter.';
    } else if (location === '/ingredients') {
      title = 'Soapmaking Ingredient Catalog | SoapSpice';
      description = 'Search oils and butters for cold-process soapmaking, with descriptions, NaOH SAP values, and linked reference sources.';
    } else if (location === '/soapmaking-library') {
      title = 'Soapmaking Source Library | SoapSpice';
      description = 'Search the web for soapmaking articles and recipes, then save source citations, links, and personal notes in your private library.';
    } else if (location === '/soapmaking-glossary') {
      title = 'Soapmaking Glossary | SoapSpice';
      description = 'Plain-language definitions for common handmade soapmaking terms, ingredients, formulas, methods, and safety.';
    } else if (location === '/how-to-start-soapmaking') {
      title = 'How to Start Making Soap | SoapSpice';
      description = 'A beginner-friendly soapmaking guide to protective gear, scales, sodium-hydroxide-safe tools, molds, and manually curated product suggestions.';
    } else if (location === '/starter-guide-admin') {
      title = 'Manage Starter Guide Products | SoapSpice';
      description = 'Staff editor for manually curated soapmaking tool recommendations.';
    } else if (location === '/calculator-product-admin') {
      title = 'Manage Calculator Product Cards | SoapSpice';
      description = 'Staff editor for manually curated Amazon product recommendations matched to calculator ingredients.';
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
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/"><><Show when="signed-in"><Redirect to="/my-formulas" /></Show><Show when="signed-out"><Home /></Show></></Route>
    <Route path="/sign-in/*?"><div className="min-h-[100dvh] bg-[hsl(var(--background))] px-4 py-14"><Link href="/" className="mx-auto mb-8 block w-fit text-sm font-bold text-[hsl(var(--primary))]">← SoapSpice</Link><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/my-formulas`} /></div></Route>
    <Route path="/sign-up/*?"><div className="min-h-[100dvh] bg-[hsl(var(--background))] px-4 py-14"><Link href="/" className="mx-auto mb-8 block w-fit text-sm font-bold text-[hsl(var(--primary))]">← SoapSpice</Link><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/my-formulas`} /></div></Route>
    <Route path="/my-formulas"><><Show when="signed-in"><CalculatorPage /></Show><Show when="signed-out"><Redirect to="/" /></Show></></Route>
    <Route path="/calculators/cold-process-soap" component={CalculatorPage} />
    <Route path="/batch-sheet" component={FormulaPrintPage} />
    <Route path="/formula-print" component={FormulaPrintPage} />
    <Route path="/ingredients" component={IngredientsPage} />
    <Route path="/soapmaking-glossary" component={() => <Shell><SoapmakingGlossaryPage /></Shell>} />
    <Route path="/soapmaking-library" component={() => <Shell><SoapmakingLibraryPage /></Shell>} />
    <Route path="/how-to-start-soapmaking" component={() => <Shell><HowToStartSoapmakingPage /></Shell>} />
    <Route path="/ingredient-admin" component={IngredientAdmin} />
    <Route path="/starter-guide-admin" component={() => <Shell><StarterGuideAdmin /></Shell>} />
    <Route path="/calculator-product-admin" component={() => <Shell><CalculatorIngredientProductsAdmin /></Shell>} />
    <Route path="/ingredients/:ingredientId" component={IngredientDetailPage} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const id = user?.id ?? null;
    if (previousUser.current !== undefined && previousUser.current !== id) client.clear();
    previousUser.current = id;
  }), [addListener, client]);
  return null;
}
function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{ signIn: { start: { title: 'Welcome back to SoapSpice', subtitle: 'Open your saved formulas on any device' } }, signUp: { start: { title: 'Make your SoapSpice account', subtitle: 'Keep your formulas together' } } }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  ><QueryClientProvider client={queryClient}><ClerkQueryClientCacheInvalidator /><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider></ClerkProvider>;
}
function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;
