import { type AnchorHTMLAttributes, type ReactNode, useState } from 'react';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Droplets,
  FlaskConical,
  Leaf,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import './_group.css';

const logo = '/__mockup/images/soapspice-original.png';
const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] disabled:cursor-not-allowed disabled:opacity-45';
const buttonQuiet = 'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function Link({ href, onClick, children, ...props }: LinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

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

export function Current() {
  return <Home />;
}