import { Link } from 'wouter';

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">About SoapSpice</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
        A clearer way to plan cold-process soap
      </h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-[hsl(var(--muted-foreground))]">
        <p>
          SoapSpice is an educational soapmaking calculator and reference site. It helps makers plan
          cold-process formulas, calculate sodium hydroxide (NaOH), liquid, and fragrance, and
          compare oils and butters using source-linked SAP values.
        </p>
        <p>
          Ingredient guides explain how fats can affect a bar and how they may behave during
          soapmaking. Review the cited source and your supplier’s specifications before using an
          ingredient in a formula.
        </p>
        <p>
          Formula drafts are saved in your browser, not in a SoapSpice customer account. Calculator
          estimates are educational starting points and do not replace chemical safety procedures,
          supplier instructions, or independent verification.
        </p>
        <p>
          Some product links may be affiliate links when clearly identified. See our{' '}
          <Link href="/privacy" className="font-semibold text-[hsl(var(--primary))] underline">privacy and shopping-link information</Link>.
        </p>
        <p>
          <Link href="/calculators/cold-process-soap" className="font-semibold text-[hsl(var(--primary))] underline">
            Open the cold-process soap calculator
          </Link>
        </p>
      </div>
    </section>
  );
}
