import approvedLinks from '@/data/amazon-affiliate-links.json';

// Only manually supplied Amazon-issued Associates links belong in this map.
// Never fabricate a tracking tag or infer a product match from a similar name.
const links: Record<string, string> = approvedLinks;
for (const [id, href] of Object.entries(links)) {
  const url = new URL(href);
  if (url.protocol !== 'https:' || url.username || url.password ||
    !['amazon.com', 'www.amazon.com', 'amzn.to'].includes(url.hostname)) {
    throw new Error(`Invalid approved Amazon link for ${id}`);
  }
}

export const hasAmazonAffiliateLinks = Object.keys(links).length > 0;

export function getAmazonLink(id: string, search: string) {
  const approved = links[id];
  return {
    href: approved ?? `https://www.amazon.com/s?k=${encodeURIComponent(search)}`,
    isAffiliate: Boolean(approved),
  };
}
