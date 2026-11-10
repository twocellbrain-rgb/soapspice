import approvedLinks from '@/data/amazon-affiliate-links.json';

// Only manually supplied Amazon-issued Associates links belong in this map.
// Never fabricate a tracking tag or infer a product match from a similar name.
const links: Record<string, string> = approvedLinks;
// Public Associates ID from the owner's Amazon-issued link.
// The supplied short link points to the homepage, not an individual product.
const associateTag = 'soapspice1-20';
for (const [id, href] of Object.entries(links)) {
  const url = new URL(href);
  if (url.protocol !== 'https:' || url.username || url.password ||
    !['amazon.com', 'www.amazon.com', 'amzn.to'].includes(url.hostname)) {
    throw new Error(`Invalid approved Amazon link for ${id}`);
  }
}

export const hasAmazonAffiliateLinks = Boolean(associateTag) || Object.keys(links).length > 0;

export function getAmazonLink(id: string, search: string) {
  const approved = links[id];
  const searchUrl = new URL('https://www.amazon.com/s');
  searchUrl.searchParams.set('k', search);
  if (associateTag) searchUrl.searchParams.set('tag', associateTag);
  return {
    href: approved ?? searchUrl.href,
    isAffiliate: Boolean(approved || associateTag),
  };
}
