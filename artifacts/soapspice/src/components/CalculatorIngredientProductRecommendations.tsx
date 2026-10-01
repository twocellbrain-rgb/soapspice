import { ExternalLink } from 'lucide-react';
import {
  getListCalculatorIngredientProductsQueryKey,
  useListCalculatorIngredientProducts,
} from '@workspace/api-client-react';

type IngredientSelection = {
  id: string;
  name: string;
};

export default function CalculatorIngredientProductRecommendations({
  selections,
}: {
  selections: IngredientSelection[];
}) {
  const productsQuery = useListCalculatorIngredientProducts({
    query: {
      queryKey: getListCalculatorIngredientProductsQueryKey(),
      staleTime: 60_000,
    },
  });

  if (selections.length === 0) return null;

  const groups = productsQuery.data ?? [];
  const recommendations = selections.flatMap((selection) => {
    const group = groups.find((entry) => entry.ingredientId === selection.id);
    return group ? [{ ...selection, products: group.products }] : [];
  });

  return (
    <section
      className="print-hide rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)] p-5 sm:p-7 lg:col-span-2"
      aria-labelledby="calculator-product-recommendations-heading"
      data-testid="calculator-product-recommendations"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Manually curated</p>
          <h2 id="calculator-product-recommendations-heading" className="mt-2 font-display text-2xl font-bold text-[hsl(var(--foreground))]">
            Product picks for your ingredients
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          Affiliate disclosure: SoapSpice may earn a commission from qualifying purchases. Product cards are entered by staff; this page does not import live prices or images.
        </p>
      </div>

      {productsQuery.isLoading ? (
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]" role="status">Loading product suggestions…</p>
      ) : productsQuery.isError ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" role="status">
          <span className="text-[hsl(var(--muted-foreground))]">Product suggestions are temporarily unavailable.</span>
          <button
            type="button"
            onClick={() => void productsQuery.refetch()}
            className="font-bold text-[hsl(var(--primary))] underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]" data-testid="text-no-matched-products">
          There are no curated product suggestions for these oils or butters yet.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {recommendations.map((group) => (
            <section
              key={group.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4"
              aria-label={`Product picks for ${group.name}`}
              data-testid={`product-picks-${group.id}`}
            >
              <h3 className="font-bold text-[hsl(var(--foreground))]">{group.name}</h3>
              <ul className="mt-3 space-y-3">
                {group.products.map((product, index) => (
                  <li key={`${group.id}-${index}`} className="rounded-xl bg-[hsl(var(--background))] p-3">
                    <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">{product.title}</h4>
                    <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{product.note}</p>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] underline underline-offset-2"
                    >
                      View on Amazon <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}