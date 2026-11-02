import { ExternalLink } from 'lucide-react';
import {
  getListCalculatorIngredientProductsQueryKey,
  useListCalculatorIngredientProducts,
} from '@workspace/api-client-react';

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
  const productsQuery = useListCalculatorIngredientProducts({
    query: {
      queryKey: getListCalculatorIngredientProductsQueryKey(),
      staleTime: 60_000,
    },
  });

  if (selections.length === 0 && additionalMaterials.length === 0) return null;

  const groups = productsQuery.data ?? [];
  const recommendations = selections.map((selection) => ({
    ...selection,
    products: groups.find((entry) => entry.ingredientId === selection.id)?.products ?? [],
    searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(`${selection.name} soap making`)}`,
  }));
  const hasCuratedProducts = recommendations.some((item) => item.products.length > 0);

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
          Oils, fragrances, sodium hydroxide, and your selected mixing liquid are listed below. Links open Amazon search results; SoapSpice does not show live prices. Search links are not affiliate links.
          {hasCuratedProducts && ' Some manually curated product links may earn SoapSpice a commission from qualifying purchases.'}
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
              {item.products.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {item.products.map((product, index) => (
                    <li key={`${item.id}-${index}`} className="rounded-xl bg-[hsl(var(--background))] p-3">
                    <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">{product.title}</h4>
                    <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{product.note}</p>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] underline underline-offset-2"
                    >
                      Check Amazon for price <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </li>
                  ))}
                </ul>
              ) : (
                <a
                  href={item.searchUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-2"
                >
                  Check Amazon for price <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
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