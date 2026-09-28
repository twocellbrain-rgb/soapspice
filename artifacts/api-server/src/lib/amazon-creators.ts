export interface AmazonCreatorsApiStatus {
  configured: boolean;
  marketplace: string | null;
}

export interface AmazonCatalogProduct {
  asin: string;
  title: string;
  url: string;
}

interface AmazonCreatorsConfig {
  credentialId: string;
  credentialSecret: string;
  credentialVersion: "3.1" | "3.2" | "3.3";
  partnerTag: string;
  marketplace: string;
}

interface AccessTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
}

interface SearchResponse {
  searchResult?: {
    items?: Array<{
      asin?: unknown;
      detailPageURL?: unknown;
      itemInfo?: {
        title?: {
          displayValue?: unknown;
        };
      };
    }>;
  };
}

const tokenHosts: Record<AmazonCreatorsConfig["credentialVersion"], string> = {
  "3.1": "https://api.amazon.com",
  "3.2": "https://api.amazon.co.uk",
  "3.3": "https://api.amazon.co.jp",
};

const supportedMarketplaces = new Set([
  "www.amazon.com",
  "www.amazon.ca",
  "www.amazon.com.mx",
  "www.amazon.com.br",
  "www.amazon.co.uk",
  "www.amazon.de",
  "www.amazon.fr",
  "www.amazon.it",
  "www.amazon.es",
  "www.amazon.nl",
  "www.amazon.com.be",
  "www.amazon.ie",
  "www.amazon.pl",
  "www.amazon.se",
  "www.amazon.com.tr",
  "www.amazon.ae",
  "www.amazon.sa",
  "www.amazon.eg",
  "www.amazon.in",
  "www.amazon.co.jp",
  "www.amazon.sg",
  "www.amazon.com.au",
]);

export class AmazonCreatorsApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "AmazonCreatorsApiError";
  }
}

function getConfig(): AmazonCreatorsConfig | null {
  const credentialId = process.env.AMAZON_CREATORS_API_CREDENTIAL_ID?.trim();
  const credentialSecret = process.env.AMAZON_CREATORS_API_SECRET?.trim();
  const version = process.env.AMAZON_CREATORS_API_VERSION?.trim();
  const partnerTag = process.env.AMAZON_ASSOCIATES_PARTNER_TAG?.trim();
  const marketplace = process.env.AMAZON_CREATORS_API_MARKETPLACE?.trim().toLowerCase();

  if (
    !credentialId ||
    !credentialSecret ||
    !version ||
    !partnerTag ||
    !marketplace ||
    !Object.hasOwn(tokenHosts, version) ||
    !supportedMarketplaces.has(marketplace)
  ) {
    return null;
  }

  return {
    credentialId,
    credentialSecret,
    credentialVersion: version as AmazonCreatorsConfig["credentialVersion"],
    partnerTag,
    marketplace,
  };
}

export function getAmazonCreatorsApiStatus(): AmazonCreatorsApiStatus {
  const config = getConfig();
  return {
    configured: Boolean(config),
    marketplace: config?.marketplace ?? null,
  };
}

export function isAmazonProductUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname === "/") return false;
    const host = url.hostname.toLowerCase();
    return /^(?:www\.)?amzn\.(?:to|eu|in|sg)$/.test(host) ||
      /^(?:www\.)?amazon\.(?:(?:com|co)\.[a-z]{2}|com(?:\.[a-z]{2})?|[a-z]{2,3})$/.test(host);
  } catch {
    return false;
  }
}

let cachedAccessToken:
  | {
      credentialId: string;
      version: AmazonCreatorsConfig["credentialVersion"];
      value: string;
      expiresAt: number;
    }
  | undefined;

async function getAccessToken(config: AmazonCreatorsConfig): Promise<string> {
  if (
    cachedAccessToken &&
    cachedAccessToken.credentialId === config.credentialId &&
    cachedAccessToken.version === config.credentialVersion &&
    cachedAccessToken.expiresAt > Date.now() + 30_000
  ) {
    return cachedAccessToken.value;
  }

  const tokenUrl = `${tokenHosts[config.credentialVersion]}/auth/o2/token`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: config.credentialId,
      client_secret: config.credentialSecret,
      scope: "creatorsapi::default",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new AmazonCreatorsApiError("Amazon Creators API authentication failed.", 502);
  }

  const data = (await response.json()) as AccessTokenResponse;
  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new AmazonCreatorsApiError("Amazon Creators API returned an invalid access token response.", 502);
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  cachedAccessToken = {
    credentialId: config.credentialId,
    version: config.credentialVersion,
    value: data.access_token,
    expiresAt: Date.now() + Math.max(60, expiresIn) * 1000,
  };
  return cachedAccessToken.value;
}

export async function searchAmazonProducts(keywords: string): Promise<AmazonCatalogProduct[]> {
  const config = getConfig();
  if (!config) {
    throw new AmazonCreatorsApiError("Amazon Creators API is not configured.", 503);
  }

  const accessToken = await getAccessToken(config);
  const response = await fetch("https://creatorsapi.amazon/catalog/v1/searchItems", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "x-marketplace": config.marketplace,
    },
    body: JSON.stringify({
      keywords,
      marketplace: config.marketplace,
      partnerTag: config.partnerTag,
      itemCount: 10,
      resources: ["itemInfo.title"],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new AmazonCreatorsApiError(
      `Amazon Creators API product search failed (HTTP ${response.status}).`,
      502,
    );
  }

  const data = (await response.json()) as SearchResponse;
  const seenAsins = new Set<string>();
  return (data.searchResult?.items ?? []).flatMap((item) => {
    const asin = typeof item.asin === "string" ? item.asin : "";
    const title = typeof item.itemInfo?.title?.displayValue === "string"
      ? item.itemInfo.title.displayValue.trim()
      : "";
    const url = typeof item.detailPageURL === "string" ? item.detailPageURL : "";
    if (!asin || !title || !isAmazonProductUrl(url) || seenAsins.has(asin)) return [];
    seenAsins.add(asin);
    return [{ asin, title, url }];
  });
}