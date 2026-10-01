import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  type CalculatorIngredientProduct,
  getGetIngredientStaffQueryKey,
  getListCalculatorIngredientProductsQueryKey,
  useDeleteCalculatorIngredientProducts,
  useGetIngredientStaff,
  useGetIngredients,
  useListCalculatorIngredientProducts,
  useReplaceCalculatorIngredientProducts,
} from '@workspace/api-client-react';

type ProductDraft = CalculatorIngredientProduct;

const emptyProduct = (): ProductDraft => ({ title: '', note: '', url: '' });

function isAmazonProductUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname === '/') return false;
    const host = url.hostname.toLowerCase();
    return /^(?:www\.)?amzn\.(?:to|eu|in|sg)$/.test(host) ||
      /^(?:www\.)?amazon\.(?:(?:com|co)\.[a-z]{2}|com(?:\.[a-z]{2})?|[a-z]{2,3})$/.test(host);
  } catch {
    return false;
  }
}

function IngredientProductEditor({
  ingredient,
  initialProducts,
  isPublished,
}: {
  ingredient: { id: string; name: string };
  initialProducts?: readonly CalculatorIngredientProduct[];
  isPublished: boolean;
}) {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ProductDraft[]>(() =>
    initialProducts?.length ? [...initialProducts] : [emptyProduct()],
  );
  const save = useReplaceCalculatorIngredientProducts();
  const remove = useDeleteCalculatorIngredientProducts();

  useEffect(() => {
    setProducts(initialProducts?.length ? [...initialProducts] : [emptyProduct()]);
  }, [initialProducts]);

  const ready = products.length >= 1 && products.length <= 3 &&
    products.every((product) =>
      product.title.trim() &&
      product.note.trim() &&
      isAmazonProductUrl(product.url),
    );

  function refreshProductLists() {
    void queryClient.invalidateQueries({ queryKey: getListCalculatorIngredientProductsQueryKey() });
  }

  function updateProduct(index: number, field: keyof ProductDraft, value: string) {
    save.reset();
    setProducts((current) => current.map((product, productIndex) =>
      productIndex === index ? { ...product, [field]: value } : product,
    ));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    save.mutate(
      { ingredientId: ingredient.id, data: { products } },
      { onSuccess: refreshProductLists },
    );
  }

  function removePublishedProducts() {
    if (!window.confirm(`Remove all product cards for “${ingredient.name}”?`)) return;
    remove.mutate(
      { ingredientId: ingredient.id },
      {
        onSuccess: () => {
          refreshProductLists();
          setProducts([emptyProduct()]);
        },
      },
    );
  }

  return (
    <section className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">Selected catalog ingredient</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-[hsl(var(--foreground))]">{ingredient.name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {isPublished ? 'Live' : 'No cards yet'}
        </span>
      </div>
      <p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">
        These cards appear when a validated formula includes {ingredient.name}. Product links must be HTTPS Amazon product pages or official short links.
      </p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        {products.map((product, index) => (
          <fieldset key={index} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.25)] p-4">
            <legend className="px-1 text-sm font-extrabold text-[hsl(var(--foreground))]">Product {index + 1}</legend>
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Product name
                <input
                  required
                  maxLength={160}
                  value={product.title}
                  onChange={(event) => updateProduct(index, 'title', event.target.value)}
                  placeholder="Name as it appears on Amazon"
                  className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Recommendation note
                <textarea
                  required
                  maxLength={400}
                  rows={2}
                  value={product.note}
                  onChange={(event) => updateProduct(index, 'note', event.target.value)}
                  placeholder="Why is this product relevant to the selected ingredient?"
                  className="resize-y rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Amazon Associates affiliate link
                <input
                  required
                  type="url"
                  maxLength={2000}
                  value={product.url}
                  onChange={(event) => updateProduct(index, 'url', event.target.value)}
                  placeholder="Paste the tracked URL from Associates"
                  aria-describedby={`calculator-product-url-hint-${ingredient.id}-${index}`}
                  className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
                {product.url && !isAmazonProductUrl(product.url) && (
                  <span id={`calculator-product-url-hint-${ingredient.id}-${index}`} className="text-xs font-medium text-red-700">
                    Enter an HTTPS Amazon product page or official short link, not the store homepage.
                  </span>
                )}
                <span className="text-xs font-normal leading-5 text-[hsl(var(--muted-foreground))]">
                  URL validation checks that the link is an Amazon product page; it cannot confirm the Associates tracking tag. A regular product URL may not earn commission.
                </span>
              </label>
            </div>
            {products.length > 1 && (
              <button
                type="button"
                className="mt-3 text-xs font-bold text-red-700 underline underline-offset-2"
                onClick={() => {
                  save.reset();
                  setProducts((current) => current.filter((_, productIndex) => productIndex !== index));
                }}
              >
                Remove this product
              </button>
            )}
          </fieldset>
        ))}

        {products.length < 3 && (
          <button
            type="button"
            className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))]"
            onClick={() => {
              save.reset();
              setProducts((current) => [...current, emptyProduct()]);
            }}
          >
            Add another product
          </button>
        )}

        {(save.isError || remove.isError) && (
          <p className="text-sm font-medium text-red-700" role="alert">
            Product cards could not be updated. Check that each item has a name, a note, and a valid HTTPS Amazon product link.
          </p>
        )}
        {save.isSuccess && <p className="text-sm font-bold text-emerald-800" role="status">Product cards saved and published.</p>}
        {remove.isSuccess && <p className="text-sm font-bold text-emerald-800" role="status">Product cards removed.</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
          <button
            type="submit"
            disabled={!ready || save.isPending || remove.isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {save.isPending ? 'Saving…' : 'Save product cards'}
          </button>
          {isPublished && (
            <button
              type="button"
              disabled={save.isPending || remove.isPending}
              onClick={removePublishedProducts}
              className="min-h-11 rounded-full px-4 text-sm font-bold text-red-700 underline underline-offset-2 disabled:opacity-50"
            >
              {remove.isPending ? 'Removing…' : 'Remove all cards'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default function CalculatorIngredientProductsAdmin() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const staff = useGetIngredientStaff({
    query: {
      queryKey: getGetIngredientStaffQueryKey(),
      enabled: Boolean(isSignedIn),
      retry: false,
    },
  });
  const ingredientsQuery = useGetIngredients();
  const productsQuery = useListCalculatorIngredientProducts();
  const ingredients = ingredientsQuery.data ?? [];
  const productGroups = productsQuery.data ?? [];
  const selectedIngredient = ingredients.find((ingredient) => ingredient.id === selectedIngredientId);
  const selectedGroup = productGroups.find((group) => group.ingredientId === selectedIngredientId);

  useEffect(() => {
    if (!selectedIngredientId && ingredients.length > 0) {
      setSelectedIngredientId(ingredients[0].id);
    }
  }, [ingredients, selectedIngredientId]);

  if (!isLoaded || (isSignedIn && staff.isLoading)) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[hsl(var(--muted-foreground))]" role="status">Checking staff access…</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-black text-[hsl(var(--foreground))]">Sign in to manage calculator product cards</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Only SoapSpice staff can publish ingredient-matched Amazon recommendations.</p>
        <Link href="/sign-in" className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white">Sign in</Link>
      </div>
    );
  }

  if (staff.isError || !staff.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Staff access</p>
        <h1 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))]">This account cannot manage product cards yet</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          A database administrator must grant this account ingredient staff access. Creating an account does not grant editing permission.
        </p>
        {user?.id && <p className="mt-5 rounded-2xl bg-[hsl(var(--muted)/0.45)] p-4 text-sm">Clerk user ID: <code className="break-all font-mono font-bold">{user.id}</code></p>}
      </div>
    );
  }

  if (ingredientsQuery.isLoading || productsQuery.isLoading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[hsl(var(--muted-foreground))]" role="status">Loading ingredients and saved cards…</div>;
  }

  if (ingredientsQuery.isError || productsQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-black text-[hsl(var(--foreground))]">Saved product cards could not be loaded</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Refresh both lists before editing so existing recommendations are not replaced with incomplete data.</p>
        <button
          type="button"
          onClick={() => {
            void ingredientsQuery.refetch();
            void productsQuery.refetch();
          }}
          className="mt-6 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 lg:px-8 lg:pt-14">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Staff editor</p>
      <h1 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Manage calculator product cards</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        Add up to three products for a catalog oil or butter. The calculator displays only cards matched to ingredients in a validated formula. Paste tracked Amazon Associates URLs manually; no Amazon API access is needed.
      </p>
      <p className="mt-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Product cards publish as soon as they are saved. Confirm that your affiliate disclosure and links comply with your Amazon Associates terms. SoapSpice does not import prices, ratings, or product images.
      </p>

      {ingredients.length === 0 ? (
        <p className="mt-7 rounded-2xl border border-dashed border-[hsl(var(--border))] p-6 text-sm text-[hsl(var(--muted-foreground))]">
          There are no public catalog oils or butters to match yet.
        </p>
      ) : (
        <div className="mt-7 grid gap-5">
          <label className="grid max-w-xl gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            Choose a catalog ingredient
            <select
              value={selectedIngredientId}
              onChange={(event) => setSelectedIngredientId(event.target.value)}
              className="min-h-12 rounded-xl border border-[hsl(var(--border))] bg-white px-4 outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
              data-testid="select-product-ingredient"
            >
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
              ))}
            </select>
          </label>
          {selectedIngredient && (
            <IngredientProductEditor
              key={selectedIngredient.id}
              ingredient={{ id: selectedIngredient.id, name: selectedIngredient.name }}
              initialProducts={selectedGroup?.products}
              isPublished={Boolean(selectedGroup)}
            />
          )}
        </div>
      )}
    </div>
  );
}