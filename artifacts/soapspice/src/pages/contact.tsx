import { PUBLIC_CONTACT_EMAIL } from '@/lib/seo';

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Contact SoapSpice</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
        Questions or a site correction?
      </h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-[hsl(var(--muted-foreground))]">
        <p>
          Contact us about the cold-process soap calculator, ingredient references, accessibility,
          or a correction to information on the site.
        </p>
        <p>
          <a
            className="font-semibold text-[hsl(var(--primary))] underline"
            href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
          >
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </p>
        <p>
          For questions about an Amazon order, payment, shipping, or returns, contact Amazon or the
          seller directly. SoapSpice does not process orders.
        </p>
      </div>
    </section>
  );
}
