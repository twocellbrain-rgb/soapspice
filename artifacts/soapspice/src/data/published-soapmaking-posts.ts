export type PublishedSoapmakingItem = {
  id: string;
  name: string;
  searchTerm: string;
  note?: string;
};

export type PublishedSoapmakingPost = {
  slug: string;
  title: string;
  kind: 'article' | 'recipe';
  excerpt: string;
  publishedAt: string;
  author?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  body: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    steps?: string[];
  }>;
  ingredients: PublishedSoapmakingItem[];
  equipment: PublishedSoapmakingItem[];
  citations?: Array<{
    title: string;
    url: string;
  }>;
};

// Add owner-written, reviewed content here. Rebuild and redeploy to publish.
// Keep external-source posts to SoapSpice-written summaries and citations.
export const publishedSoapmakingPosts: PublishedSoapmakingPost[] = [];
