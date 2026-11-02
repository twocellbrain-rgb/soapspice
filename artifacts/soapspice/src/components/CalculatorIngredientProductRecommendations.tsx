import { ExternalLink } from 'lucide-react';

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
}: {
  selections: IngredientSelection[];
  additionalMaterials?: AdditionalMaterial[];
}) {
  if (selections.length === 0 && additionalMaterials.length === 0) return null;

  const recommendations = selections.map((selection) => ({
    ...selection,
    searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(`${selection.name} soap making`)}`,
  }));

  return (
    <section
      className="print-hide rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)] p-5 sm:p-7 lg:col-span-2"
      aria-labelledby="calculator-product-recommendations-heading"
      data-testid="calculator-product-recommendations"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Shopping links · Amazon.com</p>
          <h2 id="calculator-product-recommendations-heading" className="mt-2 font-display text-2xl font-bold text-[hsl(var(--foreground))]">
            Check your batch materials on Amazon
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          Oils, fragrances, sodium hydroxide, and your selected mixing liquid are listed below. Links open Amazon search results; SoapSpice does not show live prices. These search links are not affiliate links.
        </p>
      </div>

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
                href={item.searchUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-2"
              >
                Check Amazon for price <ExternalLink size={14} aria-hidden="true" />
              </a>
            </section>
          ))}
          {additionalMaterials.map((material) => (
            <section
              key={material.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4"
              aria-label={`Amazon link for ${material.name}`}
              data-testid={`product-pick-${material.id}`}
            >
              <h3 className="font-bold text-[hsl(var(--foreground))]">{material.name}</h3>
              <a
                href={`https://www.amazon.com/s?k=${encodeURIComponent(material.searchQuery)}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-2"
              >
                Check Amazon for price <ExternalLink size={14} aria-hidden="true" />
              </a>
            </section>
          ))}
      </div>
    </section>
  );
}