export type SoapmakingLibraryKind = 'article' | 'recipe';
export type SoapmakingLibraryContentMode = 'soapspice-guide' | 'source-link';

export type SoapmakingLibraryResource = {
  id: string;
  title: string;
  kind: SoapmakingLibraryKind;
  publisher: string;
  href: string;
  summary: string;
  format: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  tags: string[];
  contentMode: SoapmakingLibraryContentMode;
};

// For external sources, SoapSpice links to the publisher and uses its own
// illustrative image. It does not reproduce the publisher's article or photo.
export const soapmakingLibraryResources: SoapmakingLibraryResource[] = [
  {
    id: 'beginner-soapmaking-guide',
    title: 'How to Start Soapmaking',
    kind: 'article',
    publisher: 'SoapSpice',
    href: '/how-to-start-soapmaking/',
    summary: 'Review beginner tools, protective gear, scales, and lye-safe materials before planning a cold-process batch.',
    format: 'SoapSpice guide',
    image: 'images/crafted-soap-hero.webp',
    imageAlt: 'SoapSpice illustrative photo of handmade soap bars and botanicals.',
    imageWidth: 1024,
    imageHeight: 1024,
    tags: ['beginner', 'safety', 'cold process'],
    contentMode: 'soapspice-guide',
  },
  {
    id: 'soapmaking-ingredients-and-sap',
    title: 'Soapmaking Oils, Butters, and SAP Values',
    kind: 'article',
    publisher: 'SoapSpice',
    href: '/ingredients/',
    summary: 'Compare 42 oils and butters by their source-linked SAP values, cold-process effects, and workability notes.',
    format: 'SoapSpice guide',
    image: 'images/soap-ingredient-flatlay.webp',
    imageAlt: 'SoapSpice illustrative flatlay of soap ingredients.',
    imageWidth: 1600,
    imageHeight: 1067,
    tags: ['ingredients', 'SAP', 'cold process'],
    contentMode: 'soapspice-guide',
  },
  {
    id: 'soapmaking-glossary',
    title: 'Soapmaking Glossary',
    kind: 'article',
    publisher: 'SoapSpice',
    href: '/soapmaking-glossary/',
    summary: 'Look up plain-language explanations of SAP, superfat, trace, curing, fragrance, and sodium hydroxide.',
    format: 'SoapSpice guide',
    image: 'images/soap-inspiration-earthy.webp',
    imageAlt: 'SoapSpice illustrative photo of earthy-colored handmade soap.',
    imageWidth: 1600,
    imageHeight: 938,
    tags: ['glossary', 'beginner', 'reference'],
    contentMode: 'soapspice-guide',
  },
  {
    id: 'cold-process-soap-calculator',
    title: 'Cold-Process Soap Calculator',
    kind: 'article',
    publisher: 'SoapSpice',
    href: '/calculators/cold-process-soap/',
    summary: 'Plan a NaOH cold-process formula and calculate sodium hydroxide, liquid, and fragrance in grams or ounces.',
    format: 'SoapSpice tool',
    image: 'images/crafted-soap-detail.webp',
    imageAlt: 'SoapSpice illustrative close-up of handmade cold-process soap.',
    imageWidth: 1024,
    imageHeight: 1024,
    tags: ['calculator', 'NaOH', 'cold process'],
    contentMode: 'soapspice-guide',
  },
  {
    id: 'lovely-greens-easy-soap-recipes',
    title: 'Easy Soap Recipes for Beginners',
    kind: 'recipe',
    publisher: 'Lovely Greens',
    href: 'https://lovelygreens.com/easy-soap-recipes-beginners/',
    summary: 'The publisher presents three small-batch cold-process ideas, including floral, herbal, and simple three-oil variations. Follow the publisher’s full instructions and verify each quantity and safety step before making a batch.',
    format: 'Cold process · external recipe',
    image: 'images/soap-inspiration-botanical.webp',
    imageAlt: 'SoapSpice illustrative botanical soap photo; not an image from Lovely Greens.',
    imageWidth: 1600,
    imageHeight: 987,
    tags: ['beginner', 'small batch', 'cold process'],
    contentMode: 'source-link',
  },
  {
    id: 'the-handmade-home-soap-recipes',
    title: 'Make Your Own Soap: Favorite Recipes and Printables',
    kind: 'recipe',
    publisher: 'The Handmade Home',
    href: 'https://www.thehandmadehome.net/make-your-own-soap-our-fave-recipes-free-printables/',
    summary: 'This source describes decorative melt-and-pour projects using a premade soap base. It is not a cold-process or NaOH recipe, so do not enter it into the cold-process calculator.',
    format: 'Melt & pour · external source',
    image: 'images/soap-inspiration-color.webp',
    imageAlt: 'SoapSpice illustrative colorful soap photo; not an image from The Handmade Home.',
    imageWidth: 1600,
    imageHeight: 1067,
    tags: ['melt and pour', 'beginner', 'external source'],
    contentMode: 'source-link',
  },
];
