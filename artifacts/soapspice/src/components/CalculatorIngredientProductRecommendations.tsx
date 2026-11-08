import { ExternalLink } from 'lucide-react';
import AmazonDisclosure from '@/components/AmazonDisclosure';
import { getAmazonLink } from '@/lib/amazon-links';

type IngredientSelection = {
  id: string;
  name: string;
};

type AdditionalMaterial = {
  id: string;
  name: string;
  searchQuery: string;
};

export default function CalculatorIngredientProductRecommendations({
  selections,
  additionalMaterials = [],
  variant = 'standard',
}: {
  selections: IngredientSelection[];
  additionalMaterials?: AdditionalMaterial[];
  variant?: 'standard' | 'sidebar';
}) {
  if (selections.length === 0 && additionalMaterials.length === 0) return null;

  const recommendations = selections.map((selection) => ({
    ...selection,
    link: getAmazonLink(selection.id, `${selection.name} soap making`),
  }));

  return (
    <section
      className={`print-hide rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)] p-5 sm:p-7 lg:col-span-2${variant === 'sidebar' ? ' batch-amazon-sidebar' : ''}`}
      aria-labelledby="calculator-product-recommendations-heading"
      data-testid="calculator-product-recommendations"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Shopping links · Amazon.com</p>
          <h2 id="calculator-product-recommendations-heading" className="mt-2 font-display text-2xl font-bold text-[hsl(var(--foreground))]">
            {variant === 'sidebar' ? 'Shop your batch on Amazon' : 'Check your batch materials on Amazon'}
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          Oils, fragrances, sodium hydroxide, and your selected mixing liquid are listed below. Search results are not verified product recommendations. SoapSpice does not display live prices, stock status, ratings, or Amazon reviews.
        </p>
      </div>
      <AmazonDisclosure />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
          {recommendations.map((item) => (
            <section
              key={item.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4"
              aria-label={`Amazon links for ${item.name}`}
              data-testid={`product-picks-${item.id}`}
            >
              <h3 className="font-bold text-[hsl(var(--foreground))]">{item.name}</h3>
              <a
                href={item.link.href}
                target="_blank"
                rel={item.link.isAffiliate ? 'sponsored nofollow noopener' : 'nofollow noopener'}
                referrerPolicy="strict-origin-when-cross-origin"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-2"
              >
                Check Amazon for price {item.link.isAffiliate && <span>(paid link)</span>} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </section>
          ))}
          {additionalMaterials.map((material) => {
            const link = getAmazonLink(material.id, material.searchQuery);
            return (
            <section
              key={material.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4"
              aria-label={`Amazon link for ${material.name}`}
              data-testid={`product-pick-${material.id}`}
            >
              <h3 className="font-bold text-[hsl(var(--foreground))]">{material.name}</h3>
              <a
                href={link.href}
                target="_blank"
                rel={link.isAffiliate ? 'sponsored nofollow noopener' : 'nofollow noopener'}
                referrerPolicy="strict-origin-when-cross-origin"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-2"
              >
                Check Amazon for price {link.isAffiliate && <span>(paid link)</span>} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </section>
          ); })}
      </div>
    </section>
  );
}