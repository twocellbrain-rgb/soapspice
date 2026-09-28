import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  searchStarterGuideAmazonProducts,
  getGetStarterGuideAmazonApiStatusQueryKey,
  useGetStarterGuideAmazonApiStatus,
  getGetIngredientStaffQueryKey,
  getListStarterGuideProductsQueryKey,
  useDeleteStarterGuideProducts,
  useGetIngredientStaff,
  useListStarterGuideProducts,
  useReplaceStarterGuideProducts,
} from "@workspace/api-client-react";
import { starterGuideTools } from "@/lib/starter-guide";

type ProductDraft = { title: string; note: string; url: string };

const emptyProduct = (): ProductDraft => ({ title: "", note: "", url: "" });

function isAmazonAffiliateUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname === "/") return false;
    const host = url.hostname.toLowerCase();
    // Keep this host allowlist aligned with the server-side validation.
    return /^(?:www\.)?amzn\.(?:to|eu|in|sg)$/.test(host) ||
      /^(?:www\.)?amazon\.(?:(?:com|co)\.[a-z]{2}|com(?:\.[a-z]{2})?|[a-z]{2,3})$/.test(host);
  } catch {
    return false;
  }
}

function ProductListEditor({
  tool,
  initialProducts,
  isPublished,
  amazonApiConfigured,
}: {
  tool: (typeof starterGuideTools)[number];
  initialProducts?: readonly ProductDraft[];
  isPublished: boolean;
  amazonApiConfigured: boolean;
}) {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ProductDraft[]>(() =>
    initialProducts?.length ? [...initialProducts] : [emptyProduct(), emptyProduct()],
  );
  const [amazonKeywords, setAmazonKeywords] = useState("");
  const [amazonSearchResults, setAmazonSearchResults] = useState<
    Awaited<ReturnType<typeof searchStarterGuideAmazonProducts>>
  >([]);
  const [amazonSearchError, setAmazonSearchError] = useState("");
  const [hasSearchedAmazon, setHasSearchedAmazon] = useState(false);
  const [isSearchingAmazon, setIsSearchingAmazon] = useState(false);
  const save = useReplaceStarterGuideProducts();
  const remove = useDeleteStarterGuideProducts();

  useEffect(() => {
    setProducts(initialProducts?.length ? [...initialProducts] : [emptyProduct(), emptyProduct()]);
  }, [initialProducts]);

  const ready = products.length >= 2 && products.length <= 3 &&
    products.every((product) => product.title.trim() && product.note.trim() && isAmazonAffiliateUrl(product.url));

  function refreshPublicList() {
    void queryClient.invalidateQueries({ queryKey: getListStarterGuideProductsQueryKey() });
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
      { toolSlug: tool.slug, data: { products } },
      { onSuccess: refreshPublicList },
    );
  }

  async function searchAmazon() {
    const keywords = amazonKeywords.trim();
    if (keywords.length < 2 || keywords.length > 120 || !amazonApiConfigured) return;

    setIsSearchingAmazon(true);
    setAmazonSearchError("");
    setHasSearchedAmazon(false);
    setAmazonSearchResults([]);
    try {
      setAmazonSearchResults(await searchStarterGuideAmazonProducts({ keywords }));
      setHasSearchedAmazon(true);
    } catch {
      setAmazonSearchResults([]);
      setAmazonSearchError("Amazon search failed. Check the API credentials, partner tag, and marketplace settings.");
    } finally {
      setIsSearchingAmazon(false);
    }
  }

  function removePublishedList() {
    if (!window.confirm(`Remove all public product suggestions for “${tool.title}”?`)) return;
    remove.mutate({ toolSlug: tool.slug }, {
      onSuccess: () => {
        refreshPublicList();
        setProducts([emptyProduct(), emptyProduct()]);
      },
    });
  }

  return (
    <section className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">{tool.label}</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-[hsl(var(--foreground))]">{tool.title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPublished ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
          {isPublished ? "Live" : "Not published"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{tool.description}</p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        {amazonApiConfigured && (
          <section className="rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)] p-4" aria-label={`Amazon product search for ${tool.title}`}>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Search Amazon products
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={amazonKeywords}
                  onChange={(event) => {
                    setAmazonKeywords(event.target.value);
                    setAmazonSearchResults([]);
                    setHasSearchedAmazon(false);
                    setAmazonSearchError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void searchAmazon();
                    }
                  }}
                  placeholder="For example: digital scale"
                  className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
              </label>
              <button
                type="button"
                onClick={() => void searchAmazon()}
                disabled={isSearchingAmazon || amazonKeywords.trim().length < 2}
                className="self-end rounded-full border border-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSearchingAmazon ? "Searching…" : "Search"}
              </button>
            </div>
            {amazonSearchError && <p className="mt-3 text-sm font-medium text-red-700" role="alert">{amazonSearchError}</p>}
            {amazonSearchResults.length > 0 && (
              <ul className="mt-3 divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-white">
                {amazonSearchResults.map((product) => (
                  <li key={product.asin} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[hsl(var(--foreground))]">{product.title}</p>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">ASIN {product.asin}</p>
                    </div>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="shrink-0 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-center text-xs font-extrabold text-white"
                    >
                      Open Amazon listing
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {hasSearchedAmazon && amazonSearchResults.length === 0 && !isSearchingAmazon && !amazonSearchError && (
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">No products found for this search.</p>
            )}
            <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              Search results are temporary and are not imported or saved. Enter your chosen product name, note, and affiliate link manually below.
            </p>
          </section>
        )}

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
                  onChange={(event) => updateProduct(index, "title", event.target.value)}
                  placeholder="Name as it appears in the listing"
                  className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Short recommendation note
                <textarea
                  required
                  maxLength={400}
                  rows={2}
                  value={product.note}
                  onChange={(event) => updateProduct(index, "note", event.target.value)}
                  placeholder="What makes this option useful for a beginner?"
                  className="resize-y rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[hsl(var(--foreground))]">
                Amazon product or affiliate link
                <input
                  required
                  type="url"
                  maxLength={2000}
                  value={product.url}
                  onChange={(event) => updateProduct(index, "url", event.target.value)}
                  placeholder="Paste your HTTPS Amazon link"
                  aria-describedby={`starter-guide-url-hint-${tool.slug}-${index}`}
                  className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-white px-3 font-normal outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
                {product.url && !isAmazonAffiliateUrl(product.url) && (
                  <span id={`starter-guide-url-hint-${tool.slug}-${index}`} className="text-xs font-medium text-red-700">
                    Use an HTTPS Amazon product page or official short link (not the store homepage).
                  </span>
                )}
              </label>
            </div>
            {products.length > 2 && (
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
            The list could not be updated. Check that every link is an HTTPS Amazon product or affiliate link, then try again.
          </p>
        )}
        {save.isSuccess && <p className="text-sm font-bold text-emerald-800" role="status">Product recommendations saved.</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
          <button
            type="submit"
            disabled={!ready || save.isPending || remove.isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : "Save 2–3 recommendations"}
          </button>
          {isPublished && (
            <button
              type="button"
              disabled={save.isPending || remove.isPending}
              onClick={removePublishedList}
              className="min-h-11 rounded-full px-4 text-sm font-bold text-red-700 underline underline-offset-2 disabled:opacity-50"
            >
              {remove.isPending ? "Removing…" : "Remove public list"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default function StarterGuideAdmin() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const staff = useGetIngredientStaff({
    query: {
      queryKey: getGetIngredientStaffQueryKey(),
      enabled: Boolean(isSignedIn),
      retry: false,
    },
  });
  const products = useListStarterGuideProducts();
  const amazonApiStatus = useGetStarterGuideAmazonApiStatus({
    query: {
      queryKey: getGetStarterGuideAmazonApiStatusQueryKey(),
      enabled: Boolean(isSignedIn && staff.data),
      retry: false,
    },
  });
  const groups = products.data ?? [];

  if (!isLoaded || (isSignedIn && staff.isLoading)) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[hsl(var(--muted-foreground))]" role="status">Checking staff access…</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-black text-[hsl(var(--foreground))]">Sign in to manage product suggestions</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">This editor is restricted to SoapSpice staff.</p>
        <Link href="/sign-in" className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white">Sign in</Link>
      </div>
    );
  }

  if (staff.isError || !staff.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Staff access</p>
        <h1 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))]">This account cannot edit recommendations yet</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          A database administrator must grant this account ingredient staff access. Creating an account does not grant editing permission.
        </p>
        {user?.id && (
          <p className="mt-5 rounded-2xl bg-[hsl(var(--muted)/0.45)] p-4 text-sm">
            Clerk user ID: <code className="break-all font-mono font-bold">{user.id}</code>
          </p>
        )}
      </div>
    );
  }

  if (products.isLoading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[hsl(var(--muted-foreground))]" role="status">Loading saved product lists…</div>;
  }

  if (products.isError) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-black text-[hsl(var(--foreground))]">Saved recommendations could not be loaded</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Refresh the list before editing to avoid replacing recommendations with incomplete data.</p>
        <button type="button" onClick={() => void products.refetch()} className="mt-6 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white">Try again</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 lg:px-8 lg:pt-14">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Staff editor</p>
      <h1 className="mt-2 font-display text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Manage starter guide products</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        Add two or three product recommendations to each tool category. Enter links manually or search Amazon when the Creators API is configured. SoapSpice does not import prices or images.
      </p>
      <p className="mt-3 rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)] p-4 text-sm leading-6 text-[hsl(var(--foreground))]" role="status">
        {amazonApiStatus.data?.configured
          ? `Amazon Creators API search is configured for ${amazonApiStatus.data.marketplace}.`
          : "Amazon Creators API search is not configured yet. Manual product entry works now. When you receive access, add AMAZON_CREATORS_API_CREDENTIAL_ID, AMAZON_CREATORS_API_SECRET, AMAZON_CREATORS_API_VERSION, AMAZON_ASSOCIATES_PARTNER_TAG, and AMAZON_CREATORS_API_MARKETPLACE through Replit Secrets."}
      </p>
      {amazonApiStatus.isError && (
        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
          API configuration status could not be checked; manual entry is still available.
        </p>
      )}
      <p className="mt-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Product suggestions go live as soon as they are saved. Before adding affiliate links, confirm that your site’s disclosure matches the terms of your Amazon Associates account.
      </p>

      <div className="mt-7 grid gap-5">
        {starterGuideTools.map((tool) => {
          const group = groups.find((entry) => entry.toolSlug === tool.slug);
          return (
            <ProductListEditor
              key={tool.slug}
              tool={tool}
              initialProducts={group?.products}
              isPublished={Boolean(group)}
              amazonApiConfigured={Boolean(amazonApiStatus.data?.configured)}
            />
          );
        })}
      </div>
    </div>
  );
}