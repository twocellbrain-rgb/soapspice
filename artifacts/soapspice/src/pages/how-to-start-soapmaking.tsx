import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useListStarterGuideProducts } from "@workspace/api-client-react";
import { starterGuideTools } from "@/lib/starter-guide";

export default function HowToStartSoapmakingPage() {
  const products = useListStarterGuideProducts();
  const groups = products.data ?? [];

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

      <aside className="mt-8 flex gap-4 rounded-3xl border border-amber-300/70 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:p-6" aria-label="Lye safety">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-extrabold">Put lye safety first</h2>
          <p className="mt-1">
            Sodium hydroxide is caustic. Work with good ventilation, wear splash goggles and gloves, keep children and pets away, and follow a tested recipe. Always add lye to water—not water to lye—and never use aluminum tools or containers.
          </p>
        </div>
      </aside>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Build a simple kit</p>
          <h2 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))]">Tools for your first batches</h2>
        </div>
        {products.isLoading && <p className="text-sm text-[hsl(var(--muted-foreground))]" role="status">Loading product suggestions…</p>}
      </div>

      {products.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Product recommendations could not be loaded. The equipment guidance is still available.
          <button type="button" className="ml-2 font-bold underline" onClick={() => void products.refetch()}>Try again</button>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {starterGuideTools.map((tool, index) => {
          const group = groups.find((entry) => entry.toolSlug === tool.slug);
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
                {group && <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{group.products.length} picks</span>}
              </div>

              <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{tool.description}</p>

              <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[hsl(var(--foreground))]">Product suggestions</h4>
                {group ? (
                  <ul className="mt-3 grid gap-3">
                    {group.products.map((product, productIndex) => (
                      <li key={`${tool.slug}-${productIndex}`} className="rounded-2xl bg-[hsl(var(--muted)/0.45)] p-4">
                        <p className="font-bold text-[hsl(var(--foreground))]">{product.title}</p>
                        <p className="mt-1 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{product.note}</p>
                        <a
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-[hsl(var(--primary))] underline-offset-4 hover:underline"
                          href={product.url}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                        >
                          View on Amazon <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-2xl border border-dashed border-[hsl(var(--border))] px-4 py-3 text-sm leading-5 text-[hsl(var(--muted-foreground))]">
                    Product picks are being curated for this category.
                  </p>
                )}
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
        Affiliate disclosure: Some links may earn SoapSpice a commission from qualifying purchases at no extra cost to you. Product links are manually curated; confirm materials and suitability with the seller before buying. This guide is educational and does not replace a tested recipe or appropriate safety practices.
      </p>
    </div>
  );
}