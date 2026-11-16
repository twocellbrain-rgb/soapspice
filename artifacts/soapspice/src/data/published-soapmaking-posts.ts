export type PublishedSoapmakingItem = {
  id: string;
  name: string;
  searchTerm: string;
  note?: string;
};

export type PublishedSoapmakingPost = {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  kind: 'article' | 'recipe';
  excerpt: string;
  publishedAt: string;
  author?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  };
  recipeDetails?: {
    yield: string;
    oilWeight: string;
    superfat: string;
    cure: string;
    scent: string;
    validationNote: string;
    formula: Array<{
      name: string;
      amount: string;
      oilShare?: string;
      note?: string;
    }>;
    notes: string[];
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
export const publishedSoapmakingPosts: PublishedSoapmakingPost[] = [
  {
    slug: 'beginner-cold-process-soap-recipe',
    title: 'Beginner Cold Process Soap Recipe for Firm, Bubbly Bars',
    seoTitle: 'Beginner Cold Process Soap Recipe | SoapSpice',
    seoDescription: 'Try a beginner cold-process soap recipe with olive, palm, coconut, and castor oils, exact NaOH and water weights, safety guidance, and a simple swirl.',
    kind: 'recipe',
    excerpt: 'Try a beginner cold-process soap recipe with olive, palm, coconut, and castor oils, exact NaOH and water weights, safety guidance, and a simple swirl.',
    publishedAt: '2026-11-16',
    author: 'SoapSpice',
    image: {
      src: '/images/beginner-cold-process-soap-swirl.webp',
      alt: 'AI-generated illustration of cream soap bars with sea-green and coral swirls',
      width: 1400,
      height: 700,
      caption: 'AI-generated illustration of the intended swirl and colors; the bars shown are illustrative, not a tested result of this formula.',
    },
    recipeDetails: {
      yield: 'About 6–8 bars, depending on cut size',
      oilWeight: '500 g',
      superfat: '5%',
      cure: '4–6 weeks',
      scent: 'Unscented',
      validationNote: 'Calculator-checked for the listed oils and settings, but not physically batch-tested. Verify supplier SAP values, oil types, NaOH purity, and all weights before making.',
      formula: [
        { name: 'Olive oil', amount: '200 g', oilShare: '40%' },
        { name: 'Palm oil (regular palm)', amount: '150 g', oilShare: '30%' },
        { name: 'Coconut oil (76°)', amount: '125 g', oilShare: '25%' },
        { name: 'Castor oil', amount: '25 g', oilShare: '5%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '70.66 g', note: 'Amount assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '160.95 g' },
        { name: 'Sea-green mica (optional swirl)', amount: 'About ⅛ tsp', note: 'Use a colorant rated by its supplier for cold-process soap.' },
        { name: 'Coral-pink mica (optional swirl)', amount: 'About ⅛ tsp', note: 'Use a colorant rated by its supplier for cold-process soap.' },
      ],
      notes: [
        'Reserve about 1 teaspoon of the measured olive oil for each mica dispersion; do not add this oil on top of the 200 g.',
        'SoapSpice estimates the distilled water at roughly 22% of the full batch weight for this calculator setup. This is a baseline, not an ideal amount for every formula or process.',
      ],
    },
    body: [
      {
        heading: 'What this recipe makes',
        paragraphs: [
          'This unscented cold-process batch uses 500 g of oils and is planned to yield about 6–8 bars, depending on cut size. Olive oil contributes a creamier lather, coconut oil brings quick bubbles, palm oil helps the bar hold its shape, and a small amount of castor oil helps support lasting lather.',
          'The optional sea-green and coral-pink swirl uses two small portions of colored batter. The color illustration above is AI-generated and shows an intended look; real soap colors and swirls vary.',
        ],
      },
      {
        heading: 'Check the formula before weighing',
        paragraphs: [
          'The listed sodium hydroxide amount is calculated for a 5% superfat and assumes 100% NaOH purity. The water amount follows SoapSpice’s disclosed cold-process baseline. Recalculate if you change the oil weights, oils, superfat, or liquid setting.',
        ],
        bullets: [
          'Select regular palm oil and 76° coconut oil. Palm kernel oil and fractionated coconut oil use different SAP values.',
          'Check the SAP references and NaOH purity against your suppliers’ specifications before making the batch.',
          'Weigh every ingredient with a suitable digital scale. Do not substitute volume measures for the oil, NaOH, or water weights.',
        ],
      },
      {
        heading: 'Tools and lye safety',
        paragraphs: [
          'Prepare a digital scale that reads to 0.01 g for the NaOH amount, a thermometer, stick blender, silicone spatula, two small mixing cups, stainless-steel pot, lye-safe heat-resistant plastic pitcher, approximately 800 mL silicone loaf mold, and a soap cutter or straight knife.',
          'Before handling sodium hydroxide (NaOH, commonly called lye) or raw soap batter, put on splash goggles, chemical-resistant gloves, and long sleeves. Work with good ventilation, keep children and pets away, and use dedicated soapmaking equipment.',
        ],
        bullets: [
          'Use stainless steel or lye-rated heat-resistant plastic for the NaOH setup. Keep glass and aluminum out of it.',
          'Always add sodium hydroxide slowly to the water while stirring—never pour water onto dry NaOH. Avoid breathing the rising vapors.',
          'Follow supplier handling instructions and keep the NaOH and raw batter away from skin and eyes.',
        ],
      },
      {
        heading: 'Make the soap, step by step',
        paragraphs: ['Gather the equipment and ingredients first, then work carefully through each stage in order.'],
        steps: [
          'Prepare the mold and colorants. Set the mold on a level surface. Weigh ingredients separately. Reserve about 1 teaspoon of the measured olive oil for each mica color, then mix each color until smooth.',
          'Mix the NaOH solution. Slowly sprinkle the weighed NaOH into the distilled water while gently stirring. Keep your face away from vapors. Once dissolved, leave the solution to cool in a secure, ventilated place.',
          'Melt and combine the oils. Mix the palm oil thoroughly before measuring, especially if it came from a bulk container. Gently melt the palm and coconut oils; use a warm-water bath if needed and avoid overheating. Add the castor oil and remaining olive oil.',
          'Bring the oil blend and NaOH solution to roughly 100–110°F (38–43°C), with the oils fully liquid.',
          'Blend to light trace. Carefully pour the NaOH solution into the oils. Keep the stick-blender head submerged and alternate short pulses with hand stirring. Stop when the batter is uniform and a drizzle briefly leaves a faint line on the surface.',
          'Make the optional swirl. Divide about one-quarter of the batter between two small pitchers, leaving about three-quarters plain. Stir one mica dispersion into each pitcher. Pour the colored batter into opposite sides of the main pot, make one slow sweep with a spatula, then pour into the mold.',
          'Unmold and cut. Leave the loaf undisturbed and check it after 24–48 hours. Wearing gloves, ease back one side of the mold. If the loaf releases cleanly and holds its shape, unmold and slice; if it sticks or dents, leave it another day and check again.',
          'Cure for 4–6 weeks. Space bars apart on a rack in a dry place with airflow, away from direct sunlight. Let each bar dry between uses on a draining soap dish.',
        ],
      },
      {
        heading: 'Simple variations and scaling',
        paragraphs: [
          'To make the soap without a swirl, omit the mica and add all the oils to the main pot. Keep the formula’s NaOH and distilled-water amounts only for this exact oil blend and batch size.',
          'For a different mold or batch size, keep the oil proportions at 40% olive, 30% palm, 25% coconut, and 5% castor, then enter the new oil weights in the SoapSpice calculator to calculate fresh NaOH and liquid amounts. Do not scale the listed NaOH by guesswork.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'Why can this bar feel firm and bubbly? Palm oil contributes to bar firmness, coconut oil contributes quick bubbles, and a small amount of castor oil helps support the lather. A full cure also helps the bars firm up.',
          'Is fragrance included? No. This recipe is unscented, so there is no fragrance amount to weigh.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 200 g', searchTerm: 'olive oil for cold process soap making', note: 'Regular olive oil; weigh 200 g.' },
      { id: 'palm-oil', name: 'Palm oil · 150 g', searchTerm: 'regular palm oil soap making', note: 'Use regular palm oil, not palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 125 g', searchTerm: '76 degree coconut oil for soap making', note: 'Use 76° coconut oil, not fractionated coconut oil.' },
      { id: 'castor-oil', name: 'Castor oil · 25 g', searchTerm: 'castor oil for cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 70.66 g', searchTerm: 'sodium hydroxide beads for soap making', note: 'Confirm purity and supplier safety information; the formula assumes 100% NaOH.' },
      { id: 'distilled-water', name: 'Distilled water · 160.95 g', searchTerm: 'distilled water soap making' },
      { id: 'sea-green-mica', name: 'Sea-green mica · about ⅛ tsp', searchTerm: 'sea green mica cold process soap colorant', note: 'Optional. Check that the supplier rates it for cold-process soap.' },
      { id: 'coral-pink-mica', name: 'Coral-pink mica · about ⅛ tsp', searchTerm: 'coral pink mica cold process soap colorant', note: 'Optional. Check that the supplier rates it for cold-process soap.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale', searchTerm: 'digital soap making scale 0.01 g', note: 'Readability suitable for weighing the NaOH amount.' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'soap making thermometer' },
      { id: 'stick-blender', name: 'Stick blender', searchTerm: 'stainless steel immersion blender soap making' },
      { id: 'silicone-spatula', name: 'Silicone spatula', searchTerm: 'silicone spatula soap making' },
      { id: 'mixing-cups', name: 'Two small mixing cups', searchTerm: 'small measuring cups for soap making colorants' },
      { id: 'stainless-pot', name: 'Stainless-steel pot', searchTerm: 'stainless steel pot soap making' },
      { id: 'lye-pitcher', name: 'Lye-safe heat-resistant pitcher', searchTerm: 'heat resistant lye safe plastic pitcher soap making' },
      { id: 'loaf-mold', name: 'Silicone loaf mold · about 800 mL', searchTerm: '800 ml silicone loaf mold cold process soap' },
      { id: 'soap-cutter', name: 'Soap cutter or straight knife', searchTerm: 'soap loaf cutter straight knife soap making' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
      { id: 'long-sleeves', name: 'Long sleeves', searchTerm: 'protective long sleeve work shirt' },
    ],
  },
];
