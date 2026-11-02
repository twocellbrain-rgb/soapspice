import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { starterGuideTools } from "@/lib/starter-guide";

export default function HowToStartSoapmakingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pt-16">
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
          Soapmaking field guide
        </p>
        <h1 className="font-display text-4xl font-black leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
          How to start making soap
        </h1>
        <p className="mt-5 text-lg leading-8 text-[hsl(var(--muted-foreground))]">
          Start with the right safety gear, a gram scale, and a few dedicated tools. You do not need a large workshop to make your first small batch.
        </p>
      </header>

      <aside className="mt-8 flex gap-4 rounded-3xl border border-amber-300/70 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:p-6" aria-label="Sodium hydroxide safety">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-extrabold">Handle sodium hydroxide safely</h2>
          <p className="mt-1">
            Sodium hydroxide (NaOH, commonly called lye in soapmaking) is caustic. Work with good ventilation, wear splash goggles and gloves, keep children and pets away, and follow a tested recipe. Slowly add NaOH to the measured liquid—never liquid to NaOH—and never use aluminum tools or containers.
          </p>
        </div>
      </aside>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Build a simple kit</p>
          <h2 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))]">Tools for your first batches</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {starterGuideTools.map((tool, index) => {
          return (
            <article key={tool.slug} className="flex flex-col rounded-[1.75rem] border border-[hsl(var(--border))] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-sm font-black text-[hsl(var(--primary))]" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">{tool.label}</p>
                    <h3 className="mt-1 font-display text-xl font-extrabold text-[hsl(var(--foreground))]">{tool.title}</h3>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{tool.description}</p>

              <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[hsl(var(--foreground))]">Product suggestions</h4>
                <div className="mt-3 rounded-2xl border border-dashed border-[hsl(var(--border))] px-4 py-3 text-sm leading-5 text-[hsl(var(--muted-foreground))]">
                  <p>Search Amazon for this tool. Product prices and availability may change.</p>
                  <a className="mt-2 inline-flex items-center gap-1.5 font-bold text-[hsl(var(--primary))] underline" href={`https://www.amazon.com/s?k=${encodeURIComponent(`${tool.title} soap making`)}`} target="_blank" rel="nofollow noopener noreferrer">
                    Check Amazon for price <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-12 rounded-[1.75rem] bg-[hsl(var(--foreground))] p-7 text-white sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Next step</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-black">Have your oils and recipe ready?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Use the calculator to check a cold-process bar formula, then review every ingredient and safety step before you make a batch.
            </p>
          </div>
          <Link href="/calculators/cold-process-soap" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[hsl(var(--foreground))] transition hover:-translate-y-0.5">
            Open the calculator <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <p className="mt-8 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        Amazon links open search results and are not affiliate links. Confirm materials and suitability with the seller before buying. This guide is educational and does not replace a tested recipe or appropriate safety practices.
      </p>
    </div>
  );
}