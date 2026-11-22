export type PublishedSoapmakingItem = {
  id: string;
  name: string;
  searchTerm: string;
  note?: string;
};

export type PublishedSoapmakingImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
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
  image?: PublishedSoapmakingImage;
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
    images?: PublishedSoapmakingImage[];
    table?: {
      caption: string;
      headers: string[];
      rows: string[][];
    };
    steps?: Array<string | {
      text: string;
      images?: PublishedSoapmakingImage[];
    }>;
  }>;
  ingredients: PublishedSoapmakingItem[];
  equipment: PublishedSoapmakingItem[];
  citationContext?: string;
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
      alt: 'Two AI-generated views of cream soap bars with sea-green and coral swirls',
      width: 1400,
      height: 700,
      caption: 'AI-generated illustrations show the intended color palette and swirl; real results vary.',
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
  {
    slug: 'one-oil-olive-oil-castile-soap',
    title: 'One-Oil Olive Oil Soap Recipe (Castile Soap)',
    seoTitle: 'Olive Oil Castile Soap Recipe (500 g) | SoapSpice',
    seoDescription: 'Make unscented cold-process Castile soap with one oil. This 500 g olive oil recipe includes calculator-checked NaOH and water weights, six steps, and lye safety.',
    kind: 'recipe',
    excerpt: 'A simple unscented cold-process bar made with 500 g of plain olive oil, sodium hydroxide, and distilled water, with clear safety notes and six steps.',
    publishedAt: '2026-11-16',
    author: 'SoapSpice',
    image: {
      src: '/images/olive-oil-castile-soap-curing-ai.jpeg',
      alt: 'AI-generated illustration of pale olive-oil soap bars spaced on a curing rack',
      width: 505,
      height: 508,
      caption: 'AI-generated illustration of cut bars curing on a rack; actual soap color, texture, and cure vary.',
    },
    recipeDetails: {
      yield: 'One 500 g oil batch',
      oilWeight: '500 g',
      superfat: '5%',
      cure: 'About 6 months',
      scent: 'Unscented',
      validationNote: 'The NaOH amount matches 500 g of regular olive oil at SoapSpice’s current 0.135 SAP reference and 5% superfat, assuming 100% NaOH purity. Calculator-checked, not physically batch-tested; verify the oil grade, supplier SAP, NaOH purity, and weights before making.',
      formula: [
        { name: 'Plain olive oil', amount: '500 g', oilShare: '100%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '64.13 g', note: 'Assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '159.11 g', note: 'SoapSpice’s 22% complete-batch estimate.' },
      ],
      notes: [
        'Use plain regular olive oil. Pomace and other grades may use different SAP references, so select the matching calculator entry.',
        'The water amount is SoapSpice’s disclosed starting baseline, not an ideal amount for every formula or process.',
      ],
    },
    body: [
      {
        heading: 'A simple Castile bar with one oil',
        paragraphs: [
          'This SoapSpice recipe keeps the oil blend simple: olive oil is the only base oil. It makes an unscented, uncolored cold-process bar, so you can focus on the basic process without fragrance or optional additives.',
          'Olive-oil batter can take longer to reach trace than some blends. Give it time, keep the stick blender submerged, and use short pulses with hand stirring between them.',
        ],
      },
      {
        heading: 'Check the formula in the calculator',
        paragraphs: [
          'The listed NaOH amount uses the calculator’s regular olive-oil SAP reference, a 5% superfat, and the assumption that the NaOH is 100% pure. The distilled-water amount follows SoapSpice’s disclosed estimate of about 22% of the complete pre-saponification batch.',
        ],
        bullets: [
          'Choose grams (g) and add 500 g of plain regular olive oil.',
          'Set superfat to 5%, choose distilled water, and leave fragrance off.',
          'Validate the formula. If you change the oil grade, batch size, or settings, use the newly calculated weights instead.',
        ],
      },
      {
        heading: 'Gather equipment and prepare safely',
        paragraphs: [
          'Set out a digital scale readable to 0.01 g, a thermometer, a stainless-steel mixing bowl, a lye-rated heat-resistant plastic pitcher, an immersion blender, a spatula, and a silicone loaf mold.',
          'Wear splash goggles, chemical-resistant gloves, and long sleeves. Work with good ventilation, away from children and pets. Use stainless steel or lye-rated plastic for NaOH contact; do not use glass or aluminum. Long sleeves can be clothing you already own.',
        ],
        bullets: [
          'Keep the NaOH dry until you are ready to weigh and mix it.',
          'Always add NaOH slowly to the distilled water while stirring—never pour water onto dry NaOH. Keep your face back from the solution and let it cool in a secure, ventilated place.',
          'Follow the NaOH supplier’s handling instructions and keep the solution and raw batter away from skin and eyes.',
        ],
      },
      {
        heading: 'Make olive oil soap in six steps',
        paragraphs: ['Gather everything first and work through these stages in order. Do not leave NaOH or raw soap batter unattended.'],
        steps: [
          {
            text: 'Weigh the olive oil, distilled water, and NaOH separately. Tare the scale with each empty container. Put on splash goggles, gloves, and long sleeves before opening the NaOH.',
            images: [{
              src: '/images/olive-castile-step-weigh-ingredients.jpg',
              alt: 'Olive oil, a scale, water, and a loaf mold arranged for weighing soap ingredients',
              width: 506,
              height: 506,
              caption: 'AI-generated guide illustration: weigh the oil, water, and sodium hydroxide separately.',
            }],
          },
          {
            text: 'Set the lye-safe pitcher on a stable surface. Slowly add the NaOH to the distilled water while stirring. Keep your face back, then leave the solution to cool in a secure, ventilated spot.',
            images: [{
              src: '/images/olive-castile-step-mix-lye-solution.jpg',
              alt: 'Gloved hands slowly adding sodium hydroxide to water in a heat-resistant pitcher',
              width: 506,
              height: 506,
              caption: 'AI-generated guide illustration: add sodium hydroxide to water, never water to sodium hydroxide.',
            }],
          },
          {
            text: 'Once the solution is about 100–110°F (38–43°C), gently warm the olive oil to a similar temperature if needed. Carefully pour the solution into the oil. Keep the blender head submerged and alternate short pulses with hand stirring until a drizzle briefly leaves a faint line.',
            images: [{
              src: '/images/olive-castile-step-blend-trace.jpg',
              alt: 'An immersion blender mixing soap batter in a stainless-steel bowl',
              width: 505,
              height: 506,
              caption: 'AI-generated guide illustration: blend until the batter reaches a uniform light trace.',
            }],
          },
          {
            text: 'Pour the batter into a silicone loaf mold on a flat, level surface. Leave it undisturbed in a secure place while it firms.',
            images: [{
              src: '/images/olive-castile-step-pour-mold.jpg',
              alt: 'Soap batter being poured into a green silicone loaf mold',
              width: 506,
              height: 508,
              caption: 'AI-generated guide illustration: pour the batter into a level loaf mold.',
            }],
          },
          {
            text: 'Check the loaf after about 48 hours. Wearing gloves, gently peel back the mold. If the loaf dents or sticks, wait another day; slice once it releases cleanly and holds its shape.',
            images: [{
              src: '/images/olive-castile-step-unmold-slice.jpg',
              alt: 'A firm olive-oil soap loaf being cut into bars with a wire cutter',
              width: 506,
              height: 508,
              caption: 'AI-generated guide illustration: unmold and slice once the loaf holds its shape.',
            }],
          },
          {
            text: 'Place the bars apart on a rack in a dry, airy place away from direct sunlight. Allow about six months of cure for a firmer, longer-lasting Castile bar; humid conditions need plenty of airflow.',
            images: [{
              src: '/images/olive-castile-step-cure-rack.jpg',
              alt: 'Three pale Castile soap bars spaced on a wire curing rack',
              width: 505,
              height: 508,
              caption: 'AI-generated guide illustration: leave air space around bars as they cure.',
            }],
          },
        ],
      },
      {
        heading: 'Give Castile soap a long cure',
        paragraphs: [
          'Olive-oil-only bars can feel soft when first unmolded. Space them apart on a rack and keep air moving around each bar while they cure for about six months. A dry location out of direct sunlight helps the bars cure evenly.',
          'The illustrations in the supplied guide are AI-generated. They show example stages only; they are not photographs of a batch made from this formula.',
        ],
      },
      {
        heading: 'Common questions',
        paragraphs: [
          'Is this recipe scented or colored? No. It intentionally uses no fragrance or colorant, so neither needs to be purchased for this batch.',
          'Can I substitute olive pomace oil? Do not assume the same lye amount. Pomace and other grades can use different SAP references; choose the matching oil in SoapSpice and validate the formula again.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Plain olive oil · 500 g', searchTerm: 'plain regular olive oil for cold process soap making', note: 'Use plain regular olive oil and weigh 500 g.' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 64.13 g', searchTerm: 'sodium hydroxide lye beads soap making', note: 'The calculation assumes 100% NaOH purity; follow supplier safety instructions.' },
      { id: 'distilled-water', name: 'Distilled water · 159.11 g', searchTerm: 'distilled water for soap making' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale · 0.01 g readability', searchTerm: 'digital scale 0.01 g soap making NaOH' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer cold process soap making' },
      { id: 'mixing-bowl', name: 'Stainless-steel mixing bowl', searchTerm: 'stainless steel mixing bowl soap making' },
      { id: 'lye-pitcher', name: 'Lye-rated heat-resistant pitcher', searchTerm: 'lye safe heat resistant plastic pitcher soap making' },
      { id: 'stick-blender', name: 'Immersion blender', searchTerm: 'immersion stick blender soap making' },
      { id: 'spatula', name: 'Spatula', searchTerm: 'silicone spatula soap making' },
      { id: 'loaf-mold', name: 'Silicone loaf mold', searchTerm: 'silicone loaf mold cold process soap making' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
    ],
  },
  {
    slug: 'lavender-drop-swirl-cold-process-soap',
    title: 'Lavender Drop Swirl Cold-Process Soap Recipe',
    seoTitle: 'Lavender Drop Swirl Soap Recipe | SoapSpice',
    seoDescription: 'Make a lavender drop swirl cold-process soap recipe with a 500 g oil batch, calculator-set fragrance amount, clear swirl steps, and lye safety guidance.',
    kind: 'recipe',
    excerpt: 'Deep plum and soft lilac ribbons fall through a cream-colored base in this lavender-scented cold-process soap. Every slice gets its own drop-swirl pattern.',
    publishedAt: '2026-11-17',
    author: 'SoapSpice',
    image: {
      src: '/images/lavender-drop-swirl.jpeg',
      alt: 'Cream-colored soap bars with deep plum and soft lilac drop swirls',
      width: 1536,
      height: 1024,
      caption: 'Illustrative image supplied with the SoapSpice recipe; actual soap colors and swirl patterns vary.',
    },
    recipeDetails: {
      yield: 'About 6–8 bars, depending on cut size',
      oilWeight: '500 g',
      superfat: '5%',
      cure: '4–6 weeks',
      scent: 'Lavender fragrance oil, weighed from calculator results',
      validationNote: 'The NaOH amount is calculator-checked for this 500 g oil blend at 5% superfat and assumes 100% NaOH purity. The listed water is the calculator baseline with fragrance off; selecting a fragrance changes the water estimate. Choose the exact fragrance and strength in the calculator, then verify its supplier usage limit and all material specifications.',
      formula: [
        { name: 'Olive oil', amount: '200 g', oilShare: '40%' },
        { name: 'Palm oil (regular palm)', amount: '150 g', oilShare: '30%' },
        { name: 'Coconut oil (76°)', amount: '125 g', oilShare: '25%' },
        { name: 'Castor oil', amount: '25 g', oilShare: '5%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '70.66 g', note: 'Amount assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '160.95 g', note: 'Calculator baseline with fragrance off; use the validated scented result if fragrance is selected.' },
        { name: 'Lavender fragrance oil', amount: 'Use the final calculator amount', note: 'Choose the exact supplier product and check its usage limit and handling notes.' },
        { name: 'Lilac and deep-plum mica', amount: 'About ⅛ tsp each', note: 'Optional; use colorants rated for cold-process soap and stay within supplier rates for each colored portion.' },
      ],
      notes: [
        'Reserve about 1 teaspoon of the measured olive oil for each mica dispersion; do not add this oil on top of the 200 g.',
        'SoapSpice’s light, medium, and strong fragrance levels are general scent guides, not IFRA maximums. Follow the exact fragrance supplier’s safe-use limit.',
      ],
    },
    body: [
      {
        heading: 'What makes the lavender drop swirl?',
        paragraphs: [
          'This cold-process loaf starts with a cream-colored soap base. Two small portions are colored lilac and deep plum, then poured into the mold from different heights: the higher stream pushes deeper into the batter, while the lower stream leaves a shallower ribbon.',
          'The finished pattern varies with batter thickness, pouring speed, and the way the colored streams move through the loaf. Prepare the colors and mold before blending so the batter stays fluid enough to pour.',
        ],
      },
      {
        heading: 'Set the fragrance amount in the calculator',
        paragraphs: [
          'This recipe provides a 500 g oil blend and a 5% superfat. Its listed 70.66 g NaOH and 160.95 g distilled water are the calculator results with fragrance off. The calculator’s water estimate changes when fragrance is selected, while the NaOH amount remains the same for this oil blend and setting.',
        ],
        bullets: [
          'Choose grams and enter 200 g olive oil, 150 g regular palm oil, 125 g 76° coconut oil, and 25 g castor oil.',
          'Set superfat to 5%, choose distilled water, add the exact lavender fragrance product you plan to use, and select light, medium, or strong.',
          'Check the fragrance supplier’s safe-use rate for cold-process, rinse-off soap. The calculator strength guide is not a substitute for that limit.',
          'Validate the formula and use the displayed NaOH, water, and fragrance weights. Recalculate if you change an oil, weight, or setting.',
        ],
      },
      {
        heading: 'Equipment and lye safety',
        paragraphs: [
          'Gather a scale readable to 0.01 g, thermometer, stick blender, stainless-steel pot, lye-rated heat-resistant plastic pitcher, two spouted pouring cups, silicone spatula, and a silicone loaf mold with enough room for the batter.',
          'Wear splash goggles, chemical-resistant gloves, and long sleeves. Work with good ventilation and keep children and pets out of the work area. Use stainless steel or lye-rated plastic for NaOH contact; keep glass and aluminum out of the lye setup.',
        ],
        bullets: [
          'Weigh every ingredient; do not substitute volume measures for the oils, NaOH, water, or fragrance.',
          'Slowly add NaOH to the distilled water while stirring—never pour water onto dry NaOH. Keep your face away from vapors and let the solution cool in a secure, ventilated place.',
          'Follow the NaOH and fragrance suppliers’ handling instructions, and keep lye solution and raw batter away from skin and eyes.',
        ],
      },
      {
        heading: 'Make the lavender drop swirl',
        paragraphs: ['Set out the mold, prepared colors, and measured fragrance before you begin. Work carefully through each stage in order.'],
        steps: [
          {
            text: 'Set the loaf mold on a level surface. Mix each mica separately with about 1 teaspoon of olive oil reserved from the measured 200 g. Weigh the final calculator fragrance amount into a separate cup.',
            images: [{
              src: '/images/lavender-drop-step-prepare-colorants.jpg',
              alt: 'Lilac and plum mica being mixed beside a purple silicone loaf mold',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: prepare the mold and both mica colors.',
            }],
          },
          {
            text: 'Slowly sprinkle the weighed NaOH into the distilled water while gently stirring. Keep your face back from the rising vapors, then leave the solution to cool in a secure, ventilated area.',
            images: [{
              src: '/images/lavender-drop-step-mix-lye-solution.jpg',
              alt: 'Gloved hands adding sodium hydroxide to distilled water in a lye-safe pitcher',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: add sodium hydroxide to water and let it cool safely.',
            }],
          },
          {
            text: 'If using bulk palm oil, melt and stir it thoroughly before weighing. Melt the palm and coconut oils, then stir in the castor oil and remaining olive oil. Aim for roughly 100–110°F (38–43°C) for both oils and lye solution, with the oils fully liquid.',
            images: [{
              src: '/images/lavender-drop-step-combine-oils.jpg',
              alt: 'Measured soapmaking oils being poured into a stainless-steel pot',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: combine the measured oils.',
            }],
          },
          {
            text: 'Pour the lye solution into the oils. Use short stick-blender pulses and hand stirring until the batter is uniformly emulsified and still fluid at light trace. Stir in the fragrance by hand, following the supplier’s acceleration guidance.',
            images: [{
              src: '/images/lavender-drop-step-blend-fragrance.jpg',
              alt: 'A stick blender mixing cream-colored soap batter in a stainless-steel pot',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: blend to light trace, then stir in fragrance.',
            }],
          },
          {
            text: 'Pour about 100 g of batter into each spouted cup. Mix lilac into one and deep plum into the other. Pour the remaining cream-colored batter into the loaf mold.',
            images: [{
              src: '/images/lavender-drop-step-divide-color.jpg',
              alt: 'Lilac and deep-plum soap batter in separate cups beside a loaf mold',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: color two portions and keep the rest cream.',
            }],
          },
          {
            text: 'Pour a thin plum stream along the loaf from several inches above the surface to push it deeper. Pour the lilac stream closer to the surface for a shallower ribbon. Repeat along different parts of the mold. Use remaining colored batter for a few lines on top, then lightly draw a skewer through the surface.',
            images: [{
              src: '/images/lavender-drop-step-pour-swirl.jpg',
              alt: 'A thin plum stream creating a drop swirl in a cream soap loaf',
              width: 617,
              height: 617,
              caption: 'Guide illustration from the supplied recipe: pour the colored streams at different heights.',
            }],
          },
          {
            text: 'Check the loaf after 24–48 hours. With gloves on, unmold and slice when it releases cleanly and holds its shape. If it dents easily, check it again the next day. Space the bars on a rack in a dry, ventilated spot out of direct sun for a 4–6 week cure.',
            images: [
              {
                src: '/images/lavender-drop-step-cut-bars.jpg',
                alt: 'A firm lavender drop-swirl soap loaf being cut into bars',
                width: 617,
                height: 617,
                caption: 'Guide illustration from the supplied recipe: slice the loaf once it holds its shape.',
              },
              {
                src: '/images/lavender-drop-step-cure-rack.jpg',
                alt: 'Lavender drop-swirl soap bars spaced on a wire curing rack',
                width: 617,
                height: 617,
                caption: 'Guide illustration from the supplied recipe: leave airflow around curing bars.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Troubleshoot the swirl',
        paragraphs: [
          'If the colored swirl sits mostly on top, the batter may have thickened before pouring. Use short blender pulses, stop at a fluid light trace, and have the two colored portions ready before you start. A slightly higher pour can help a stream sink while the base is still fluid.',
          'Lavender fragrance oils can differ in acceleration and discoloration. Check the exact supplier product notes and prepare your colors before adding fragrance so you can pour promptly if the batter thickens.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 200 g', searchTerm: 'olive oil for cold process soap making', note: 'Reserve about 1 teaspoon each for the two mica dispersions.' },
      { id: 'palm-oil', name: 'Regular palm oil · 150 g', searchTerm: 'regular palm oil for soap making', note: 'Do not substitute palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 125 g', searchTerm: '76 degree coconut oil soap making' },
      { id: 'castor-oil', name: 'Castor oil · 25 g', searchTerm: 'castor oil cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 70.66 g', searchTerm: 'sodium hydroxide lye soap making', note: 'The formula assumes 100% NaOH purity; confirm the supplier specification.' },
      { id: 'distilled-water', name: 'Distilled water · 160.95 g baseline', searchTerm: 'distilled water for soap making', note: 'Use the final validated water result when fragrance is selected.' },
      { id: 'lavender-fragrance-oil', name: 'Lavender fragrance oil', searchTerm: 'lavender fragrance oil cold process soap', note: 'Use the calculator amount for the exact product and follow its supplier usage limit.' },
      { id: 'lilac-mica', name: 'Lilac mica · about ⅛ tsp', searchTerm: 'lilac mica cold process soap colorant', note: 'Optional; check supplier rates for the colored portion.' },
      { id: 'deep-plum-mica', name: 'Deep-plum mica · about ⅛ tsp', searchTerm: 'deep plum mica cold process soap colorant', note: 'Optional; check supplier rates for the colored portion.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale · 0.01 g readability', searchTerm: 'digital scale 0.01 g soap making' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer cold process soap making' },
      { id: 'stick-blender', name: 'Stick blender', searchTerm: 'immersion stick blender soap making' },
      { id: 'stainless-pot', name: 'Stainless-steel pot', searchTerm: 'stainless steel pot soap making' },
      { id: 'lye-pitcher', name: 'Lye-rated heat-resistant pitcher', searchTerm: 'lye safe heat resistant plastic pitcher soap making' },
      { id: 'spouted-cups', name: 'Two spouted pouring cups', searchTerm: 'spouted pouring cups soap making swirl' },
      { id: 'silicone-spatula', name: 'Silicone spatula', searchTerm: 'silicone spatula soap making' },
      { id: 'loaf-mold', name: 'Silicone loaf mold', searchTerm: 'silicone loaf mold cold process soap making' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
    ],
  },
  {
    slug: 'caribbean-sunset-layered-cold-process-soap',
    title: 'Caribbean Sunset Layered Cold-Process Soap Recipe',
    seoTitle: 'Caribbean Sunset Layered Soap Recipe | SoapSpice',
    seoDescription: 'Make Caribbean sunset layered cold-process soap with 500 g of oils, coral and gold mica, exact NaOH and water weights, lye safety, and seven clear steps.',
    kind: 'recipe',
    excerpt: 'Build three distinct bands of coral, golden yellow, and creamy soap with this unscented 500 g cold-process recipe and gentle spoon-pour technique.',
    publishedAt: '2026-11-19',
    author: 'SoapSpice',
    image: {
      src: '/images/caribbean-sunset-layered-soap.jpg',
      alt: 'Illustration of three soap bars with coral-pink, golden-yellow, and creamy layered colors',
      width: 1536,
      height: 1024,
      caption: 'Illustrative recipe artwork; the colors and shape of each real batch will vary.',
    },
    recipeDetails: {
      yield: 'About 6–8 bars, depending on cut size',
      oilWeight: '500 g',
      superfat: '5%',
      cure: '4–6 weeks',
      scent: 'Unscented',
      validationNote: 'This is a SoapSpice planning formula calculated with the current oil SAP references at 5% superfat and the assumption of 100% NaOH purity. Confirm oil types and supplier specifications, then validate the final batch in the calculator before weighing.',
      formula: [
        { name: 'Olive oil', amount: '200 g', oilShare: '40%' },
        { name: 'Palm oil (regular palm)', amount: '150 g', oilShare: '30%' },
        { name: 'Coconut oil (76°)', amount: '125 g', oilShare: '25%' },
        { name: 'Castor oil', amount: '25 g', oilShare: '5%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '70.66 g', note: 'Assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '160.95 g', note: 'SoapSpice’s disclosed 22% complete-batch water baseline for this unscented setup.' },
        { name: 'Coral-pink mica', amount: 'About ¼ tsp', note: 'Optional color layer; check the supplier’s recommended rate for roughly 240 g of batter.' },
        { name: 'Golden-yellow mica', amount: 'About ¼ tsp', note: 'Optional color layer; check the supplier’s recommended rate for roughly 240 g of batter.' },
      ],
      notes: [
        'Disperse each mica in about 1 teaspoon of olive oil taken from the measured 200 g; do not add extra oil to the formula.',
        'The water amount is a disclosed starting baseline, not an ideal amount for every formula or process. Recalculate if you change the oils, weights, or settings.',
        'The coral and gold portions are colored while the third portion stays its natural cream shade. Omit the micas for an uncolored batch.',
      ],
    },
    body: [
      {
        heading: 'A three-layer sunset',
        paragraphs: [
          'This unscented cold-process loaf is designed to reveal three horizontal bands when cut: coral-pink at the base, golden yellow through the middle, and a creamy natural top. A spoon helps the upper layers land gently so they stay distinct.',
          'The included artwork shows an example of the intended colors and shape. Soap color, layer thickness, and the final pattern will vary with the ingredients and pouring stage.',
        ],
      },
      {
        heading: 'Check the formula before weighing',
        paragraphs: [
          'The formula uses a 500 g oil blend, a 5% superfat, and the assumption that the NaOH is 100% pure. The 160.95 g distilled-water amount follows SoapSpice’s disclosed 22% complete-batch baseline. Use the calculator to verify the current numbers before making the batch.',
        ],
        bullets: [
          'Choose grams (g), regular palm oil, and 76° coconut oil. Palm kernel oil and fractionated coconut oil are different ingredients.',
          'Check your suppliers’ oil type, SAP information, and NaOH purity; make sure the measured materials match the recipe.',
          'Weigh all oils, NaOH, and water. Do not replace weight measurements with volume measures.',
          'The recipe is unscented. No fragrance is needed for these layers.',
        ],
      },
      {
        heading: 'Tools and lye safety',
        paragraphs: [
          'Set out a scale readable to 0.01 g for the NaOH, thermometer, stick blender, stainless-steel mixing pot, lye-rated heat-resistant plastic pitcher, three lye-safe pouring cups, silicone spatula, spoon, and an approximately 800 mL silicone loaf mold.',
          'Before handling sodium hydroxide (NaOH, commonly called lye) or raw soap batter, wear splash goggles, chemical-resistant gloves, and long sleeves. Work with good ventilation, keep children and pets away, and use dedicated soapmaking equipment.',
        ],
        bullets: [
          'Use stainless steel or lye-rated heat-resistant plastic for the NaOH setup. Do not use glass or aluminum.',
          'Slowly add NaOH to the distilled water while stirring—never pour water onto dry NaOH. Keep your face away from the rising vapors.',
          'Follow the NaOH supplier’s handling instructions and keep the lye solution and raw batter away from skin and eyes.',
        ],
      },
      {
        heading: 'Make the sunset layers step by step',
        paragraphs: ['Prepare the colors and mold before blending so you can pour each layer while the batter is workable.'],
        steps: [
          {
            text: 'Set the loaf mold on a level surface. Weigh the oils, NaOH, and distilled water separately. Disperse each mica in about 1 teaspoon of olive oil reserved from the measured 200 g.',
            images: [{
              src: '/images/caribbean-sunset-step-prepare-colors.jpg',
              alt: 'Coral-pink and golden-yellow mica being prepared beside a silicone loaf mold',
              width: 613,
              height: 613,
              caption: 'AI-generated guide illustration: prepare the mold and two color dispersions.',
            }],
          },
          {
            text: 'Mix the lye solution. Slowly sprinkle the NaOH into the distilled water while stirring gently. Keep your face back from the vapors and let the solution cool in a secure, ventilated place.',
            images: [{
              src: '/images/caribbean-sunset-step-mix-lye.jpg',
              alt: 'Gloved hands adding sodium hydroxide to water in a heat-resistant pitcher',
              width: 613,
              height: 613,
              caption: 'AI-generated guide illustration: add sodium hydroxide to water and allow it to cool.',
            }],
          },
          {
            text: 'Melt and combine the oils. If using bulk palm oil, melt and stir it thoroughly before weighing. Gently melt the palm and coconut oils, then stir in the castor oil and the remaining olive oil. Aim for roughly 100–110°F (38–43°C) for both the oils and lye solution, with the oils fully liquid.',
            images: [{
              src: '/images/caribbean-sunset-step-combine-oils.jpg',
              alt: 'Measured oils being poured into a stainless-steel soapmaking pot',
              width: 613,
              height: 613,
              caption: 'AI-generated guide illustration: melt and combine the measured oils.',
            }],
          },
          {
            text: 'Blend the batter. Carefully pour the lye solution into the oils. Alternate short stick-blender pulses with hand stirring until the batter is uniform and a drizzle leaves a faint line, or light trace. Divide the batter into three roughly equal portions. Stir coral mica into one portion, golden-yellow mica into another, and leave the third plain.',
            images: [
              {
                src: '/images/caribbean-sunset-step-blend-batter.jpg',
                alt: 'A stick blender mixing cream soap batter in a stainless-steel pot',
                width: 613,
                height: 613,
                caption: 'AI-generated guide illustration: blend the batter to light trace.',
              },
              {
                src: '/images/caribbean-sunset-step-divide-colors.jpg',
                alt: 'Three soap batter portions colored coral, gold, and cream in separate cups',
                width: 617,
                height: 609,
                caption: 'AI-generated guide illustration: divide the batter and color two portions.',
              },
            ],
          },
          {
            text: 'Pour the coral base. Stir the coral portion until it reaches a soft pudding consistency, then pour it into the mold. If you want a gently wavy boundary, drag a spoon lightly over its surface.',
            images: [{
              src: '/images/caribbean-sunset-step-pour-coral.jpg',
              alt: 'Coral soap batter being poured into a loaf mold for the bottom layer',
              width: 617,
              height: 609,
              caption: 'AI-generated guide illustration: pour the coral base layer.',
            }],
          },
          {
            text: 'Add the gold and cream layers. Wait until the coral can support a small spoonful with little mixing. Hold a spoon close to the surface and pour the gold batter over its back. Repeat with the cream layer once the gold can support it. Finish with shallow spoon ridges if desired.',
            images: [
              {
                src: '/images/caribbean-sunset-step-pour-gold.jpg',
                alt: 'Golden-yellow soap batter poured over the back of a spoon onto the coral layer',
                width: 613,
                height: 613,
                caption: 'AI-generated guide illustration: use a spoon to pour the gold layer gently.',
              },
              {
                src: '/images/caribbean-sunset-step-pour-cream.jpg',
                alt: 'Cream-colored soap batter poured gently over the gold layer',
                width: 613,
                height: 613,
                caption: 'AI-generated guide illustration: add the cream layer once the gold can support it.',
              },
            ],
          },
          {
            text: 'Unmold, cut, and cure. Check the loaf after 24–48 hours. Wearing gloves, slice it when it releases cleanly and holds its shape; if it sticks or dents, wait another day. Cure the bars for 4–6 weeks on a rack in a dry, airy place away from direct sunlight.',
            images: [
              {
                src: '/images/caribbean-sunset-step-cut-loaf.jpg',
                alt: 'A firm layered soap loaf being cut across its short width',
                width: 873,
                height: 873,
                caption: 'AI-generated guide illustration: cut the loaf once it releases and holds its shape.',
              },
              {
                src: '/images/caribbean-sunset-step-cure-bars.jpg',
                alt: 'Caribbean sunset soap bars spaced apart on a wire curing rack',
                width: 873,
                height: 873,
                caption: 'AI-generated guide illustration: leave airflow around the bars during the cure.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Keep the colored bands separate',
        paragraphs: [
          'Before pouring a full layer, test with a spoonful of batter. If it sinks into the layer below, give the lower layer a little more time to thicken. Hold the spoon close to the surface and pour slowly so the batter lands gently.',
          'Small differences in trace and thickness are normal and give each cut bar a slightly different sunset pattern. Avoid moving or tilting the mold once the layers are in place.',
        ],
      },
      {
        heading: 'Unmold, slice, and cure',
        paragraphs: [
          'Check the loaf after about 24–48 hours and wear gloves while handling it. If it releases cleanly and holds its shape, slice it across the short width. If the loaf still sticks to the mold or dents easily, give it another day.',
          'Space the cut bars apart on a rack in a dry, airy spot out of direct sunlight for a 4–6 week cure. Airflow around each bar helps it dry evenly.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 200 g', searchTerm: 'olive oil cold process soap making', note: 'Reserve about 2 teaspoons for dispersing the micas.' },
      { id: 'palm-oil', name: 'Regular palm oil · 150 g', searchTerm: 'regular palm oil soap making', note: 'Do not substitute palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 125 g', searchTerm: '76 degree coconut oil soap making' },
      { id: 'castor-oil', name: 'Castor oil · 25 g', searchTerm: 'castor oil cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 70.66 g', searchTerm: 'sodium hydroxide soap making', note: 'The formula assumes 100% NaOH purity; follow supplier handling guidance.' },
      { id: 'distilled-water', name: 'Distilled water · 160.95 g', searchTerm: 'distilled water soap making' },
      { id: 'coral-pink-mica', name: 'Coral-pink mica · about ¼ tsp', searchTerm: 'coral pink mica cold process soap colorant', note: 'Optional; check the supplier’s recommended rate.' },
      { id: 'golden-yellow-mica', name: 'Golden-yellow mica · about ¼ tsp', searchTerm: 'golden yellow mica cold process soap colorant', note: 'Optional; check the supplier’s recommended rate.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale · 0.01 g readability', searchTerm: 'digital soap making scale 0.01 g' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer cold process soap making' },
      { id: 'stick-blender', name: 'Stick blender', searchTerm: 'immersion stick blender soap making' },
      { id: 'stainless-pot', name: 'Stainless-steel mixing pot', searchTerm: 'stainless steel pot soap making' },
      { id: 'lye-pitcher', name: 'Lye-rated heat-resistant pitcher', searchTerm: 'heat resistant lye safe plastic pitcher soap making' },
      { id: 'pouring-cups', name: 'Three lye-safe pouring cups', searchTerm: 'soap making lye safe pouring cups' },
      { id: 'spatula', name: 'Silicone spatula', searchTerm: 'silicone spatula soap making' },
      { id: 'spoon', name: 'Spoon for layering', searchTerm: 'stainless steel spoon soap making layers' },
      { id: 'loaf-mold', name: 'Silicone loaf mold · about 800 mL', searchTerm: '800 ml silicone loaf mold cold process soap' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
      { id: 'long-sleeves', name: 'Long sleeves', searchTerm: 'protective long sleeve work shirt' },
    ],
  },
  {
    slug: 'unscented-oatmeal-cold-process-soap',
    title: 'Unscented Oatmeal Cold-Process Soap Recipe',
    seoTitle: 'Unscented Oatmeal Soap Recipe | SoapSpice',
    seoDescription: 'Make unscented oatmeal cold-process soap with 500 g oils, exact NaOH and water weights, 5 g colloidal oatmeal, lye safety, and six clear steps.',
    kind: 'recipe',
    excerpt: 'Add finely milled colloidal oatmeal to a familiar 500 g cold-process oil blend for a simple, fragrance-free bar with a warm oatmeal-beige finish.',
    publishedAt: '2026-11-20',
    author: 'SoapSpice',
    image: {
      src: '/images/unscented-oatmeal-soap.jpg',
      alt: 'Illustration of unscented oatmeal soap bars with colloidal oatmeal alongside',
      width: 1536,
      height: 1024,
      caption: 'Illustrative recipe artwork; actual bar color, texture, and appearance will vary.',
    },
    recipeDetails: {
      yield: 'About 6–8 bars, depending on cut size',
      oilWeight: '500 g',
      superfat: '5%',
      cure: '4–6 weeks',
      scent: 'Unscented',
      validationNote: 'This SoapSpice planning formula uses the current SAP references for the listed oils at 5% superfat and assumes 100% NaOH purity. Confirm the exact oil types and supplier specifications, then validate the formula in the calculator before weighing.',
      formula: [
        { name: 'Olive oil', amount: '200 g', oilShare: '40%' },
        { name: 'Palm oil (regular palm)', amount: '150 g', oilShare: '30%' },
        { name: 'Coconut oil (76°)', amount: '125 g', oilShare: '25%' },
        { name: 'Castor oil', amount: '25 g', oilShare: '5%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '70.66 g', note: 'Assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '160.95 g', note: 'SoapSpice’s disclosed 22% complete-batch water baseline for this unscented setup.' },
        { name: 'Colloidal oatmeal', amount: '5 g', note: '1% of total oil weight; this additive is not included in the oil total.' },
      ],
      notes: [
        'Mix the 5 g of colloidal oatmeal with about 10 g of olive oil taken from the measured 200 g; do not add extra oil to the recipe.',
        'The distilled-water amount is a disclosed starting baseline, not an ideal amount for every formula or process. Recalculate if you change the oils, weights, or settings.',
        'This recipe is unscented and uncolored; no fragrance or mica is needed.',
      ],
    },
    body: [
      {
        heading: 'A simple unscented oatmeal bar',
        paragraphs: [
          'This cold-process recipe starts with a 500 g blend of olive, palm, coconut, and castor oils, then adds 5 g of finely milled colloidal oatmeal. The oatmeal gives the batter a soft beige appearance without fragrance or added colorants.',
          'Colloidal oatmeal is an additive, not a base oil, so it does not change the oil percentages in the formula. The recipe artwork is illustrative; real bars may differ in color, texture, and shape.',
        ],
      },
      {
        heading: 'Check the formula before weighing',
        paragraphs: [
          'The sodium hydroxide amount is calculated for the listed oils at 5% superfat, assuming 100% NaOH purity. The water amount follows SoapSpice’s disclosed 22% complete-batch baseline. Validate the current numbers in the calculator before making a batch.',
        ],
        bullets: [
          'Choose grams (g), regular palm oil, 76° coconut oil, olive oil, and castor oil.',
          'Enter 200 g olive oil, 150 g regular palm oil, 125 g 76° coconut oil, and 25 g castor oil. Set superfat to 5% and choose distilled water.',
          'Keep colloidal oatmeal separate from the oil blend and weigh it as an additive.',
          'Verify the oil types, supplier SAP information, NaOH purity, and every measured weight before starting.',
        ],
      },
      {
        heading: 'Gather tools and prepare safely',
        paragraphs: [
          'Set out a digital scale readable to 0.01 g for the NaOH, a thermometer, stick blender, silicone spatula, stainless-steel mixing pot, lye-rated heat-resistant plastic pitcher, and an approximately 800 mL silicone loaf mold.',
          'Wear splash goggles, chemical-resistant gloves, and long sleeves before handling sodium hydroxide (NaOH, commonly called lye) or raw soap batter. Work with good ventilation, keep children and pets away, and use dedicated soapmaking equipment.',
        ],
        bullets: [
          'Use stainless steel or lye-rated heat-resistant plastic for NaOH contact. Do not use glass or aluminum.',
          'Slowly add NaOH to the distilled water while stirring—never pour water onto dry NaOH. Keep your face away from the vapors.',
          'Follow the NaOH supplier’s handling instructions and keep the solution and raw batter away from skin and eyes.',
        ],
      },
      {
        heading: 'Make the oatmeal soap in six steps',
        paragraphs: ['Prepare the mold and measure each ingredient before you begin. Keep protective gear on while handling the lye solution and raw batter.'],
        steps: [
          {
            text: 'Set the silicone loaf mold on a level surface. Weigh the oils, NaOH, water, and colloidal oatmeal separately. Stir the 5 g of oatmeal into about 10 g of olive oil reserved from the measured 200 g until smooth.',
            images: [{
              src: '/images/oatmeal-soap-prepare-colloidal-oatmeal.jpg',
              alt: 'Gloved hands stirring colloidal oatmeal into a small amount of olive oil',
              width: 615,
              height: 615,
              caption: 'AI-generated illustration: prepare a smooth oatmeal slurry with reserved olive oil.',
            }],
          },
          {
            text: 'Mix the lye solution. Slowly sprinkle the NaOH into the distilled water while stirring gently. Keep your face back from the rising vapors and let the solution cool in a secure, ventilated place.',
            images: [{
              src: '/images/oatmeal-soap-mix-lye-solution.jpg',
              alt: 'Gloved hands adding sodium hydroxide to water in a heat-resistant pitcher',
              width: 615,
              height: 615,
              caption: 'AI-generated illustration: add sodium hydroxide to water, never water to sodium hydroxide. Wear full protective gear.',
            }],
          },
          {
            text: 'Combine the oils. If using bulk palm oil, melt and stir it thoroughly before measuring. Gently melt the palm and coconut oils, then stir in the castor oil and remaining olive oil. Let both the oils and lye solution reach about 100–110°F (38–43°C), keeping the oils fully liquid.',
            images: [{
              src: '/images/oatmeal-soap-combine-oils.jpg',
              alt: 'Melted oils being poured into a stainless-steel soapmaking pot',
              width: 615,
              height: 615,
              caption: 'AI-generated illustration: combine the measured oils in a stainless-steel pot.',
            }],
          },
          {
            text: 'Blend to light trace. Carefully pour the lye solution into the oils. Alternate short stick-blender pulses with hand stirring until the batter is uniform and a drizzle briefly leaves a faint line. Stir in the oatmeal slurry until evenly distributed.',
            images: [
              {
                src: '/images/oatmeal-soap-blend-to-trace.jpg',
                alt: 'Immersion blender mixing soap batter in a stainless-steel pot',
                width: 615,
                height: 615,
                caption: 'AI-generated illustration: alternate short blender pulses and hand stirring to reach light trace.',
              },
              {
                src: '/images/oatmeal-soap-stir-oatmeal-slurry.jpg',
                alt: 'Oatmeal slurry being folded into light-trace soap batter',
                width: 615,
                height: 615,
                caption: 'AI-generated illustration: stir the oatmeal slurry through the batter evenly.',
              },
            ],
          },
          {
            text: 'Pour the batter into the mold and leave the loaf in a secure place. Check it after 24–48 hours. Wearing gloves, unmold and slice once it releases cleanly and holds its shape; if it sticks or dents easily, give it another day.',
            images: [
              {
                src: '/images/oatmeal-soap-pour-mold.jpg',
                alt: 'Oatmeal soap batter being poured into a silicone loaf mold',
                width: 615,
                height: 615,
                caption: 'AI-generated illustration: pour the batter into a level silicone loaf mold.',
              },
              {
                src: '/images/oatmeal-soap-cut-loaf.jpg',
                alt: 'A firm soap loaf being cut into bars with a wire cutter',
                width: 615,
                height: 615,
                caption: 'AI-generated illustration: cut the loaf after it releases cleanly and holds its shape.',
              },
            ],
          },
          {
            text: 'Cure for 4–6 weeks. Space the bars apart on a rack in a dry, ventilated spot away from direct sunlight. Leave room for air around each bar, especially in humid weather.',
            images: [{
              src: '/images/oatmeal-soap-cure-bars.jpg',
              alt: 'Unscented oatmeal soap bars spaced apart on a wire curing rack',
              width: 615,
              height: 615,
              caption: 'AI-generated illustration: leave air space around each bar during the cure.',
            }],
          },
        ],
      },
      {
        heading: 'Choose the right oatmeal and scale the batch',
        paragraphs: [
          'Use colloidal oatmeal for the fine texture described in this recipe. Rolled oats are coarser and will change the soap’s appearance.',
          'To scale the batch, keep the oil blend at 40% olive oil, 30% regular palm oil, 25% 76° coconut oil, and 5% castor oil. Enter the new oil weights in SoapSpice to recalculate NaOH and water. Weigh colloidal oatmeal separately at 1% of total oil weight.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 200 g', searchTerm: 'olive oil for cold process soap making', note: 'Reserve about 10 g to disperse the oatmeal.' },
      { id: 'palm-oil', name: 'Regular palm oil · 150 g', searchTerm: 'regular palm oil soap making', note: 'Do not substitute palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 125 g', searchTerm: '76 degree coconut oil for soap making' },
      { id: 'castor-oil', name: 'Castor oil · 25 g', searchTerm: 'castor oil cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 70.66 g', searchTerm: 'sodium hydroxide lye for soap making', note: 'The formula assumes 100% NaOH purity; follow supplier handling guidance.' },
      { id: 'distilled-water', name: 'Distilled water · 160.95 g', searchTerm: 'distilled water soap making' },
      { id: 'colloidal-oatmeal', name: 'Colloidal oatmeal · 5 g', searchTerm: 'colloidal oatmeal fine powder soap making', note: 'Use finely milled colloidal oatmeal; weigh it separately from the oils.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale · 0.01 g readability', searchTerm: 'digital soap making scale 0.01 g' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer cold process soap making' },
      { id: 'stick-blender', name: 'Stick blender', searchTerm: 'immersion stick blender soap making' },
      { id: 'silicone-spatula', name: 'Silicone spatula', searchTerm: 'silicone spatula soap making' },
      { id: 'stainless-pot', name: 'Stainless-steel mixing pot', searchTerm: 'stainless steel pot soap making' },
      { id: 'lye-pitcher', name: 'Lye-rated heat-resistant pitcher', searchTerm: 'heat resistant lye safe plastic pitcher soap making' },
      { id: 'loaf-mold', name: 'Silicone loaf mold · about 800 mL', searchTerm: '800 ml silicone loaf mold cold process soap' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
      { id: 'long-sleeves', name: 'Long sleeves', searchTerm: 'protective long sleeve work shirt' },
    ],
  },
  {
    slug: 'soapmaking-oils-explained',
    title: 'Soapmaking Oils Explained',
    seoTitle: 'Soapmaking Oils for Cold-Process Soap | SoapSpice',
    seoDescription: 'Learn how olive, coconut, palm, castor, and shea affect cold-process soap. Compare their roles and explore a balanced oil blend in SoapSpice.',
    kind: 'article',
    excerpt: 'What olive, coconut, palm, castor, and shea butter bring to your bar—and how to build a balanced cold-process blend.',
    publishedAt: '2026-11-22',
    author: 'SoapSpice',
    image: {
      src: '/images/soapmaking-oils-explained-cover.jpg',
      alt: 'Olive oil, coconut oil, palm oil, castor oil, and shea butter arranged with finished soap bars',
      width: 1660,
      height: 929,
      caption: 'The five oils and butters discussed in this SoapSpice guide.',
    },
    citationContext: 'This SoapSpice guide cites the sources used for its ingredient notes. Visit each publisher for its complete article and current recommendations.',
    body: [
      {
        heading: 'Start with the bar you want',
        paragraphs: [
          'A beautiful soap starts with the oils underneath the color. A recipe that cuts neatly, lathers generously, and lasts between washes comes from choosing ingredients with complementary jobs. You can build that understanding with five familiar oils and butters.',
          'Before opening the calculator, write a short brief: “a firm everyday bar,” “more time for swirls,” or “a small unscented batch.” Then choose a base blend and test it. Keep the oil percentages, water setting, process, and cure in your notes so you can understand the result.',
          'Soapmaking uses sodium hydroxide to transform oils into soap. The raw oil’s feel is only part of the story. Judge the finished, cured bar by its lather, wash feel, release from the mold, and durability. [1]',
        ],
      },
      {
        heading: 'Five ingredients, different jobs',
        paragraphs: ['Use this comparison to start a blend, then consider how each ingredient works with the others.'],
        table: {
          caption: 'Common contributions and questions to ask when choosing soapmaking oils',
          headers: ['Ingredient', 'Main contribution', 'A useful question'],
          rows: [
            ['Olive oil', 'A slower-setting base with small, creamy lather', 'Am I allowing enough time to mature?'],
            ['Coconut oil', 'Large bubbles, cleansing, and hardness', 'How does the cured blend feel in use?'],
            ['Palm oil', 'Firmness and structure', 'Have I selected palm oil correctly?'],
            ['Castor oil', 'Lather support at a small proportion', 'Is this a supporting ingredient?'],
            ['Shea butter', 'Firmness and a richer lather character', 'What changes when I add a little butter?'],
          ],
        },
      },
      {
        heading: 'Hard oils and soft oils',
        paragraphs: [
          'Soapmakers often call fats that are solid at typical room temperature “hard oils,” and liquid ones “soft oils.” Coconut, palm, and shea fall in the first group; olive and castor in the second. The terms help organize a blend, but the finished bar depends on the whole formula and its cure.',
          'If you make soap in a warm climate, coconut oil may arrive liquid. That physical change does not turn ordinary coconut oil into fractionated coconut oil. Use the calculator entry that matches the actual product.',
        ],
      },
      {
        heading: 'Read the table as a design guide',
        paragraphs: [
          'The contributions overlap. Coconut and palm both help firmness but produce different soap profiles. Castor can support lather in a small amount, yet increasing it does not automatically make a better bar. Your goal is a blend whose ingredients work together. [2,3]',
          'Percentages refer to the total oil weight. For 500 g of oils, 5% is 25 g. The lye, water, color, and fragrance are recorded separately.',
        ],
      },
      {
        heading: 'Choose your base and bubbles',
        paragraphs: [
          'Olive oil is a familiar foundation for cold-process soap. At very high proportions, expect patience: all-olive Castile soap is known for its long cure and small, sometimes slippery lather. [3] Choose it when you want olive oil as a substantial part of the base and can allow the soap time to develop. Select the matching olive oil entry and check supplier data; an oil change belongs in the calculator before it belongs in the pot.',
          'Coconut oil helps create large bubbles and a hard, cleansing bar. High proportions can feel drying for some users. [3] It can be a bubbly part of a balanced blend, but more bubbles alone do not tell you how the full recipe will feel. Ordinary 76° coconut and fractionated coconut are different ingredients.',
          'Palm oil supplies structure and helps bars release from the mold. It is often paired with coconut and liquid oils. [2] Choose it as a firming component in a multi-oil recipe. Palm oil and palm kernel oil require separate choices; for bulk palm oil, follow supplier directions for melting and mixing before portioning.',
        ],
        images: [
          {
            src: '/images/soapmaking-oils-olive-oil.jpg',
            alt: 'Olive oil in a bowl beside green olives and an olive branch',
            width: 500,
            height: 500,
            caption: 'Olive oil: a familiar liquid base that benefits from a patient cure at high proportions.',
          },
          {
            src: '/images/soapmaking-oils-coconut-oil.jpg',
            alt: 'Coconut oil in a bowl beside a split coconut',
            width: 500,
            height: 500,
            caption: 'Coconut oil: contributes bubbles and cleansing in a balanced blend.',
          },
          {
            src: '/images/soapmaking-oils-palm-oil.jpg',
            alt: 'Palm oil in a bowl beside palm fruit and palm leaves',
            width: 500,
            height: 500,
            caption: 'Palm oil: adds structure and helps a bar release from its mold.',
          },
        ],
      },
      {
        heading: 'Support the lather and texture',
        paragraphs: [
          'Castor oil is commonly used as a supporting oil for lather. Bramble Berry suggests 2–5% as a lather option in its substitution guide. [2] Larger amounts can soften the bar, so weigh it carefully and keep the entire blend in view. [3]',
          'Shea butter adds a firming butter component to cold-process soap. Soap Queen’s beginner guide recommends using it up to 15%; the best amount depends on the complete recipe. [4] It can be a useful small-batch variation. Fully melt and combine it as the recipe requires, and recalculate when replacing another oil with shea.',
        ],
        images: [
          {
            src: '/images/soapmaking-oils-castor-oil.jpg',
            alt: 'Castor oil being poured from a small bottle into a bowl',
            width: 500,
            height: 500,
            caption: 'Castor oil: commonly used in a small proportion to support lather.',
          },
          {
            src: '/images/soapmaking-oils-shea-butter.jpg',
            alt: 'Shea butter in a bowl beside whole and split shea nuts',
            width: 500,
            height: 500,
            caption: 'Shea butter: a solid fat to explore in a carefully recalculated blend.',
          },
        ],
      },
      {
        heading: 'Keep a useful comparison notebook',
        paragraphs: [
          'Use the same mold and bar thickness. Label each batch with the formula and date. After curing, compare the bars with the same water and wash method. Record bubble size, creaminess, hardness, and how the bar dries between uses. A clear test question helps: “What changes when 5% of the olive oil becomes shea?”',
          'Make that variation only after recalculating it. The comparison is about learning the blend, not adding a new oil to an already weighed batch.',
        ],
      },
      {
        heading: 'Build an example in SoapSpice',
        paragraphs: [
          'This 500 g example uses olive as the base, palm for structure, coconut for bubbles, and castor for lather support. It is a teaching formula, with a design goal of a firm everyday bar. Its finished performance still needs a physical test batch.',
        ],
        table: {
          caption: 'A 500 g teaching blend using the SoapSpice calculator entries',
          headers: ['Calculator entry', 'Share of oils', 'Weight'],
          rows: [
            ['Olive oil', '45%', '225 g'],
            ['Palm oil', '30%', '150 g'],
            ['Coconut oil (76°)', '20%', '100 g'],
            ['Castor oil', '5%', '25 g'],
            ['Total oils', '100%', '500 g'],
          ],
        },
      },
      {
        heading: 'Enter, validate, and record',
        paragraphs: [
          'The earlier SoapSpice check for this blend recorded 69.52 g sodium hydroxide (NaOH) at 5% superfat and 160.63 g distilled water. Recheck the current calculator result and supplier specifications before weighing.',
          'SoapSpice assumes 100% NaOH purity and estimates water at about 22% of the complete batch. A different purity or oil SAP value needs attention before making. These values explain the example; use a complete cold-process method and lye-handling instructions for the actual batch.',
        ],
        steps: [
          'Open the SoapSpice cold-process calculator and select grams.',
          'Add the four oil entries exactly as listed and enter 225, 150, 100, and 25 g.',
          'Set superfat to 5%, select distilled water, and choose unscented for the example.',
          'Select Validate formula. Confirm the result and verify supplier specifications before weighing.',
        ],
      },
      {
        heading: 'Try a shea variation on paper first',
        paragraphs: [
          'Replace 25 g of olive oil with 25 g of shea butter: use 200 g olive oil, 150 g palm, 100 g coconut, 25 g castor, and 25 g shea. The total stays 500 g, with shea at 5%. Run this new formula through SoapSpice for fresh lye and water amounts. Test it separately and compare after curing. [2]',
        ],
      },
      {
        heading: 'Can I swap oils gram for gram?',
        paragraphs: [
          'An equal weight keeps the batch size the same, but the lye requirement and bar properties may change. Enter the new oil and weight in the calculator and validate the whole formula again. Even similar oils deserve a fresh calculation. [2]',
        ],
      },
      {
        heading: 'Do I need expensive specialty oils?',
        paragraphs: [
          'Start with ingredients you can identify, source consistently, and measure accurately. A simple formula makes it easier to understand what changed. Add a specialty ingredient when you have a specific test in mind.',
        ],
      },
      {
        heading: 'How much superfat should I choose?',
        paragraphs: [
          'Use the setting in a suitable recipe and keep it consistent when comparing oil blends. Changing superfat at the same time changes another variable, making the comparison harder to interpret.',
        ],
      },
      {
        heading: 'What about fragrance and color?',
        paragraphs: [
          'Treat them as recorded additions. Reserve oil for mica from the measured oil total and return it with the color. Choose the exact fragrance supplier product, verify its soap usage guidance, and revalidate the formula. Fragrance behavior can affect the time available for a swirl.',
        ],
      },
      {
        heading: 'Store ingredients for the next batch',
        paragraphs: [
          'Keep labels, lot details, and supplier specifications with your recipe records. Follow the supplier’s storage advice, close containers promptly, and inspect ingredients before using. Choose a cool, dark place appropriate to the product.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 225 g in example', searchTerm: 'olive oil for cold process soap making', note: 'The example uses regular olive oil; choose the calculator entry that matches your product.' },
      { id: 'palm-oil', name: 'Palm oil · 150 g in example', searchTerm: 'regular palm oil for soap making', note: 'Use regular palm oil, not palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 100 g in example', searchTerm: '76 degree coconut oil for soap making', note: 'Ordinary 76° coconut oil differs from fractionated coconut oil.' },
      { id: 'castor-oil', name: 'Castor oil · 25 g in example', searchTerm: 'castor oil for cold process soap making' },
      { id: 'shea-butter', name: 'Shea butter · optional variation', searchTerm: 'shea butter for cold process soap making', note: 'Recalculate the formula before substituting shea for another oil.' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · recalculate before weighing', searchTerm: 'sodium hydroxide beads soap making', note: 'The example assumes 100% purity. Follow the supplier’s handling instructions.' },
      { id: 'distilled-water', name: 'Distilled water · recalculate before weighing', searchTerm: 'distilled water soap making' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale', searchTerm: 'digital scale for soap making' },
      { id: 'soap-mold', name: 'Soap mold', searchTerm: 'soap mold for cold process soap making', note: 'Use the same mold and bar thickness when comparing batches.' },
      { id: 'batch-notebook', name: 'Batch notebook', searchTerm: 'soap making batch notebook', note: 'Record the formula, date, cure, and observations.' },
    ],
    citations: [
      { title: 'Formulating Cold Process Soap Recipes — Bramble Berry', url: 'https://www.brambleberry.com/cold-process/formulating-cold-process-soap-recipes.html' },
      { title: 'How to Substitute Oil in Cold Process Recipes — Bramble Berry', url: 'https://www.brambleberry.com/cold-process/how-to-substitute-oil-in-cold-process-recipes.html' },
      { title: 'Base Oils — Handcrafted Soap & Cosmetic Guild', url: 'https://www.soapguild.org/tools-and-resources/resource-center/140/base-oils/' },
      { title: 'Common Soapmaking Oils — Soap Queen', url: 'https://soapqueen.com/bath-and-body-tutorials/tips-and-tricks/free-beginners-guide-to-soapmaking-common-soapmaking-oils/' },
    ],
  },
  {
    slug: 'why-is-my-soap-still-soft',
    title: 'Why Is My Soap Still Soft?',
    seoTitle: 'Why Is My Soap Still Soft? 7 Causes | SoapSpice',
    seoDescription: 'Troubleshoot soft cold-process soap with seven causes, checks for water, oils, mixing, and curing, plus practical steps before changing a formula.',
    kind: 'article',
    excerpt: 'A soft loaf may simply need more time, but extra liquid, formula changes, separation, or damp curing conditions need a closer check. Learn how to assess it safely.',
    publishedAt: '2026-11-22',
    author: 'SoapSpice',
    image: {
      src: '/images/why-is-my-soap-still-soft-cover.jpg',
      alt: 'Gloved hands gently checking a pale cold-process soap loaf in its silicone mold',
      width: 617,
      height: 617,
      caption: 'A freshly molded loaf may still need time to release cleanly.',
    },
    citationContext: 'This SoapSpice troubleshooting guide cites its source materials. A soft or separated batch needs assessment based on its ingredients, process, and appearance; softness alone cannot establish that it is suitable to use.',
    body: [
      {
        heading: 'Start with three checks',
        paragraphs: [
          'If the corners still dent or the loaf clings to a silicone mold, pause before changing the formula. Softness can come from normal setting time, the recipe, or how the soap is stored.',
          'Wear gloves when inspecting fresh soap. Keep a seeping or separated batch away from skin, children, and pets. Review the recipe and seek experienced troubleshooting help before using or trying to salvage a questionable batch. Softness or firmness alone cannot establish that a batch is suitable for use.',
        ],
        bullets: [
          'Age: How long has the batch been in the mold or curing?',
          'Appearance: Is it uniform, or are there liquid pockets, oily pools, or separate layers?',
          'Records: Do the weighed ingredients match the formula?',
        ],
      },
      {
        heading: '1. You may be checking too soon',
        paragraphs: [
          'What to look for: The fresh loaf is uniform but dents when the mold is peeled away.',
          'For this batch: Leave it supported in the mold and check again the next day. Cut it only when it releases cleanly.',
          'Next time: Record the unmolding time. A 24–48 hour check is a starting point, not a deadline. After cutting, allow a normal 4–6 week cure; some formulas need longer. [1]',
        ],
        images: [{
          src: '/images/why-is-my-soap-still-soft-cover.jpg',
          alt: 'Gloved hands easing the silicone mold away from a newly made soap loaf',
          width: 617,
          height: 617,
          caption: 'Illustration: wait until the loaf releases cleanly before cutting.',
        }],
      },
      {
        heading: '2. The batch may contain more water',
        paragraphs: [
          'What to look for: The recorded liquid exceeds the formula, including water added with other ingredients.',
          'For this batch: If the recipe is otherwise correct and the loaf is uniform, allow more time and assess its progress.',
          'Next time: Weigh all liquids. Change the water only through a considered formula adjustment; adding extra sodium hydroxide is not a water-removal shortcut. [1]',
        ],
        images: [{
          src: '/images/soft-soap-extra-water.jpg',
          alt: 'A digital scale, water pitcher, and notebook ready for checking soap batch measurements',
          width: 617,
          height: 617,
          caption: 'Illustration: compare every weighed liquid with the batch formula.',
        }],
      },
      {
        heading: '3. The oil blend may set slowly',
        paragraphs: [
          'What to look for: The recipe contains a large share of liquid oils.',
          'For this batch: Allow for a slower release from the mold and longer maturation.',
          'Next time: Compare the oil proportions before choosing a new formula. A higher hard-oil share generally helps early firmness, but every substitution needs a fresh lye calculation. [2]',
        ],
        images: [{
          src: '/images/soft-soap-oil-blend.jpg',
          alt: 'Bowls of liquid and solid soapmaking oils arranged for a balanced blend',
          width: 617,
          height: 617,
          caption: 'Illustration: the oil blend can affect how quickly a loaf firms.',
        }],
      },
      {
        heading: '4. More oil may have stayed in the recipe',
        paragraphs: [
          'What to look for: High superfat, unrecorded oil, or generous oil-based mica dispersions.',
          'For this batch: Audit every addition before deciding whether the formula needs attention.',
          'Next time: Take color-dispersing oil from the weighed recipe total and return it with the color. Keep fragrance within its product-specific usage guidance. [1]',
        ],
        images: [{
          src: '/images/soft-soap-extra-oil.jpg',
          alt: 'A measured oil portion being poured into a small cup for a color dispersion',
          width: 617,
          height: 617,
          caption: 'Illustration: count dispersion oil as part of the recipe’s total oil.',
        }],
      },
      {
        heading: '5. The batter may have reached false trace',
        paragraphs: [
          'What to look for: Batter thickened unusually quickly as solid fats cooled, or later developed oil streaks and separation.',
          'For this batch: A separated loaf needs investigation. Set it aside and review the recorded temperatures and mixing notes.',
          'Next time: Fully melt solid oils and keep them liquid while combining. Blend and stir until the batter is evenly emulsified. Thickness caused by cooling fats can mimic trace. [3]',
        ],
        images: [{
          src: '/images/soft-soap-false-trace.jpg',
          alt: 'A maker checking the temperature of melted oils beside a pitcher of water',
          width: 617,
          height: 617,
          caption: 'Illustration: check oil temperatures so cooled fats do not mimic trace.',
        }],
      },
      {
        heading: 'What should light trace look like?',
        paragraphs: [
          'Look for uniform batter without free oil streaks. A faint drizzle may briefly show on the surface. Trace develops differently with different oils, temperatures, fragrances, and water amounts, so appearance and stability matter more than a fixed blending time. [3]',
        ],
      },
      {
        heading: '6. The weighed batch may differ from the formula',
        paragraphs: [
          'What to look for: An oil was substituted, the wrong units were used, an ingredient was missed, or the scale was not tared.',
          'For this batch: Reconstruct the actual gram weights. Keep a questionable batch aside until the discrepancy is understood.',
          'Next time: Check units, tare between ingredients, and verify the scale with an appropriate check weight. Recalculate for the exact oil identities and supplier sodium hydroxide purity. [4]',
        ],
        images: [{
          src: '/images/soft-soap-weighing-record.jpg',
          alt: 'A digital scale, soapmaking notes, and containers used to review measured ingredients',
          width: 617,
          height: 617,
          caption: 'Illustration: compare scale readings and batch notes with the formula.',
        }],
      },
      {
        heading: '7. Moisture may not escape easily',
        paragraphs: [
          'What to look for: Bars are tightly packed, boxed early, or curing in a damp room.',
          'For this batch: Space bars on a suitable rack in a dry area with airflow. In humid weather, a dehumidifier may help.',
          'Next time: Choose the curing space before making the batch. Avoid sealing fresh bars in airtight packaging. After curing, use a draining dish between washes. [5,6]',
        ],
        images: [{
          src: '/images/soft-soap-curing-rack.jpg',
          alt: 'Freshly cut soap bars spaced apart on a wire curing rack',
          width: 617,
          height: 617,
          caption: 'Illustration: leave room for airflow around bars during curing.',
        }],
      },
      {
        heading: 'Already cured, then turned mushy?',
        paragraphs: [
          'Check where the bar rests between uses. Standing water can soften a well-cured bar. Move it to a draining dish and let it dry. [6]',
        ],
      },
      {
        heading: 'Check the recipe in SoapSpice',
        paragraphs: [
          'Use the SoapSpice cold-process calculator to audit a formula. Enter the oil amounts actually weighed and compare them with your batch sheet before changing anything.',
          'This 500 g example uses four oils. Its calculator check assumes 100% sodium hydroxide purity, a 5% superfat, distilled water, and an estimated liquid amount near 22% of the complete batch. Recheck the live result and supplier specifications before making.',
          'The example helps audit calculator inputs; a calculator result does not diagnose an existing loaf.',
        ],
        table: {
          caption: 'A 500 g oil example for checking formula inputs',
          headers: ['Oil', 'Weight', 'Share'],
          rows: [
            ['Olive oil', '225 g', '45%'],
            ['Palm oil', '150 g', '30%'],
            ['Coconut oil (76°)', '100 g', '20%'],
            ['Castor oil', '25 g', '5%'],
            ['Total oils', '500 g', '100%'],
          ],
        },
        bullets: [
          'Select grams, enter these exact oil weights, set 5% superfat, choose distilled water, and leave fragrance off.',
          'Validate the formula. The earlier SoapSpice check returned 69.52 g sodium hydroxide (NaOH) and 160.63 g distilled water.',
          'Recheck the current result and verify supplier specifications before weighing. These example amounts are not a diagnosis or a substitute for safe handling instructions.',
        ],
      },
      {
        heading: 'Keep a useful next-batch record',
        paragraphs: [
          'Write down each oil and gram weight, sodium hydroxide purity, water weight, superfat setting, color and fragrance additions, mixing temperatures, time to trace, mold type, unmolding date, and curing location. Change one deliberate variable at a time so the next result is easier to interpret.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 225 g example blend', searchTerm: 'olive oil for cold process soap making', note: 'This amount is only for the article’s 500 g example, not a recommended change to an existing batch.' },
      { id: 'palm-oil', name: 'Palm oil · 150 g example blend', searchTerm: 'regular palm oil for soap making', note: 'Use the exact oil identity selected in the formula.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 100 g example blend', searchTerm: '76 degree coconut oil for soap making' },
      { id: 'castor-oil', name: 'Castor oil · 25 g example blend', searchTerm: 'castor oil for cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH)', searchTerm: 'sodium hydroxide beads for soap making', note: 'Recalculate the exact batch; the 69.52 g example assumes 100% purity and the listed oils.' },
      { id: 'distilled-water', name: 'Distilled water', searchTerm: 'distilled water for soap making', note: 'The 160.63 g amount is only for the article’s example formula.' },
      { id: 'fragrance-oil', name: 'Fragrance oil · optional', searchTerm: 'soap making fragrance oil cold process', note: 'Not used in the unscented example. Follow the exact supplier’s usage guidance.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Digital scale', searchTerm: 'digital scale for soap making ingredients', note: 'Use a suitable scale and tare between ingredients.' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer for cold process soap making' },
      { id: 'stick-blender', name: 'Stick blender', searchTerm: 'stick blender for cold process soap making' },
      { id: 'curing-rack', name: 'Curing rack', searchTerm: 'wire curing rack for handmade soap' },
      { id: 'draining-soap-dish', name: 'Draining soap dish', searchTerm: 'draining soap dish handmade bar soap' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
    ],
    citations: [
      { title: 'Soft Soap: Setting Time, Water, Superfat and Additives — Soap Queen', url: 'https://soapqueen.com/bath-and-body-tutorials/tips-and-tricks/cold-process-soap-soft/' },
      { title: 'Formulating Cold Process Soap Recipes — Bramble Berry', url: 'https://www.brambleberry.com/soap/formulating-cold-process-soap-recipes.html' },
      { title: 'All About Trace — Bramble Berry', url: 'https://www.brambleberry.com/cold-process/trace.html' },
      { title: 'Troubleshooting Lye-Heavy Soap — Bramble Berry', url: 'https://www.brambleberry.com/soap/troubleshooting-lye-heavy-soap.html' },
      { title: 'Storing Handmade Soap and Curing Conditions — Soap Queen', url: 'https://soapqueen.com/bath-and-body-tutorials/tips-and-tricks/how-to-store-handmade-bath-products/' },
      { title: 'Making Soap Last Longer in the Shower — Soap Queen', url: 'https://soapqueen.com/bath-and-body-tutorials/tips-and-tricks/make-soap-last-longer-shower/' },
    ],
  },
  {
    slug: 'mango-coral-swirl-cold-process-soap',
    title: 'Mango & Coral Swirl Cold-Process Soap Recipe',
    seoTitle: 'Mango & Coral Swirl Soap Recipe | SoapSpice',
    seoDescription: 'Make a mango and coral in-the-pot swirl cold-process soap recipe with 500 g oils, exact NaOH and water weights, mica color, illustrated steps, and lye safety.',
    kind: 'recipe',
    excerpt: 'Create a vivid, unscented cold-process loaf with olive, palm, coconut, and castor oils, then swirl warm coral and mango-yellow mica through an ivory base.',
    publishedAt: '2026-11-22',
    author: 'SoapSpice',
    image: {
      src: '/images/mango-coral-swirl-cover.jpeg',
      alt: 'Cream soap bars with coral-pink and mango-yellow in-the-pot swirls',
      width: 887,
      height: 887,
      caption: 'Illustrated recipe cover; finished soap colors and swirl patterns vary.',
    },
    recipeDetails: {
      yield: 'About 6–8 bars, depending on mold and cut size',
      oilWeight: '500 g',
      superfat: '5%',
      cure: '4–6 weeks',
      scent: 'Unscented',
      validationNote: 'SoapSpice’s current SAP references calculate 69.52 g NaOH for this oil blend at 5% superfat, assuming 100% NaOH purity. Confirm the exact oil types, supplier specifications, and current calculator results before weighing.',
      formula: [
        { name: 'Olive oil', amount: '225 g', oilShare: '45%' },
        { name: 'Palm oil (regular palm)', amount: '150 g', oilShare: '30%' },
        { name: 'Coconut oil (76°)', amount: '100 g', oilShare: '20%' },
        { name: 'Castor oil', amount: '25 g', oilShare: '5%' },
        { name: 'Sodium hydroxide (NaOH)', amount: '69.52 g', note: 'Calculated at 5% superfat; assumes 100% NaOH purity.' },
        { name: 'Distilled water', amount: '160.63 g', note: 'About 30.2% lye concentration for the listed NaOH weight.' },
        { name: 'Coral-pink cold-process-stable mica', amount: 'Start with ⅛ tsp', note: 'Optional colorant; use only within the supplier’s rate for the colored portion.' },
        { name: 'Mango-yellow cold-process-stable mica', amount: 'Start with ⅛ tsp', note: 'Optional colorant; use only within the supplier’s rate for the colored portion.' },
      ],
      notes: [
        'Reserve 5 g of the measured olive oil for each mica dispersion. These 10 g are part of the 225 g total; do not add extra oil.',
        'No fragrance is included. If you change the oil blend, batch size, superfat, or liquid setting, recalculate the complete formula.',
        'Plan about 60–90 minutes for preparation and making, then allow 24–48 hours or longer before cutting if the loaf needs more time to firm.',
      ],
    },
    body: [
      {
        heading: 'A sunny, unscented in-the-pot swirl',
        paragraphs: [
          'This 500 g cold-process soap recipe combines olive, palm, coconut, and castor oils in an ivory base with coral-pink and mango-yellow ribbons. The colors are mixed into small portions of batter and returned to the main pot for one gentle sweep.',
          'The recipe is unscented. Its illustrations show one possible appearance; the final color and pattern depend on the mica, batter thickness, pouring, and cutting.',
        ],
      },
      {
        heading: 'Check the formula before weighing',
        paragraphs: [
          'The listed 69.52 g sodium hydroxide (NaOH) is calculated from SoapSpice’s current SAP references for the exact oils shown, at 5% superfat and assuming 100% NaOH purity. The 160.63 g distilled water amount corresponds to about 30.2% lye concentration.',
          'Re-enter the formula in the SoapSpice calculator and confirm the current result, oil identities, and supplier NaOH purity before making. Recalculate after any substitution or change to batch size, superfat, or liquid setting.',
        ],
        bullets: [
          'Choose grams, sodium hydroxide (NaOH), and distilled water.',
          'Enter 225 g olive oil, 150 g regular palm oil, 100 g 76° coconut oil, and 25 g castor oil.',
          'Set superfat to 5%, leave fragrance off, then validate and review the displayed quantities.',
          'Keep the two mica colorants separate from the oil total; reserve their dispersing oil from the measured olive oil.',
        ],
      },
      {
        heading: 'Equipment and lye safety',
        paragraphs: [
          'Gather a scale, thermometer, stainless-steel pot, lye-rated polypropylene pitcher, silicone spatulas, two spouted batter cups, immersion blender, and a silicone loaf mold with at least 800 g batter capacity. Set out a soap cutter or straight blade and a ventilated curing rack for later.',
          'Wear splash goggles, chemical-resistant gloves, and long sleeves. Work with ventilation on a clear, stable counter, and keep children and pets away. Use dedicated soapmaking tools; do not use aluminum or fragile glass for the lye setup.',
        ],
        bullets: [
          'Read the NaOH supplier’s safety sheet before starting and keep its emergency instructions nearby.',
          'Slowly add NaOH to distilled water while stirring—always lye into water, never water onto dry lye. The solution gets hot and releases irritating vapor; keep your face away and let it cool in a secure, ventilated place.',
          'For skin or eye exposure, flush with running water and follow the supplier’s emergency instructions. Do not apply vinegar to skin.',
          'Weigh all oils, NaOH, water, fragrance-free additives, and colorants as directed; do not replace measured weights with volume estimates.',
        ],
      },
      {
        heading: 'Make the mango and coral swirl, step by step',
        paragraphs: ['Prepare the mold and color cups before blending so the soap batter is ready to pour while it is fluid. Keep protective gear on through all work with NaOH and raw batter.'],
        steps: [
          {
            text: 'Line or prepare the loaf mold if needed. Label two small cups and disperse each mica in 5 g of olive oil taken from the measured 225 g. Set out two pouring cups and a spatula.',
            images: [{
              src: '/images/mango-coral-step-prepare-colors.jpeg',
              alt: 'Coral-pink and mango-yellow mica dispersed in oil beside a prepared loaf mold',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: prepare both color dispersions before blending.',
            }],
          },
          {
            text: 'Weigh the distilled water and NaOH separately while wearing full protective gear. Slowly add the NaOH to the water while stirring. Keep your face away from vapors, then leave the hot solution to cool in a secure, ventilated area.',
            images: [{
              src: '/images/mango-coral-step-mix-lye.jpeg',
              alt: 'Gloved hands slowly adding sodium hydroxide to water in a lye-safe pitcher',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: add sodium hydroxide to water and let the solution cool safely.',
            }],
          },
          {
            text: 'If using bulk palm oil, melt and mix it thoroughly before measuring so its components are evenly distributed. Melt the coconut oil, then combine the palm, coconut, castor, and remaining olive oil. Aim for about 38–43°C (100–110°F) for both oils and lye solution, with all hard fats fully liquid.',
            images: [{
              src: '/images/mango-coral-step-combine-oils.jpeg',
              alt: 'Measured soapmaking oils being combined in a stainless-steel pot',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: melt and combine the measured oils.',
            }],
          },
          {
            text: 'Slowly add the cooled lye solution to the oils. Keep the immersion-blender head submerged. Alternate short pulses with hand stirring until the batter is uniform and leaves a faint trail. Stop at fluid light trace; thick batter is harder to swirl.',
            images: [{
              src: '/images/mango-coral-step-light-trace.jpeg',
              alt: 'Immersion blender mixing pale soap batter in a stainless-steel pot',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: blend only until the mixture reaches a fluid light trace.',
            }],
          },
          {
            text: 'Divide the batter approximately 25% coral, 25% mango-yellow, and 50% ivory. Stir each prepared mica dispersion into its matching portion by hand.',
            images: [{
              src: '/images/mango-coral-step-divide-colors.jpeg',
              alt: 'Coral and mango-yellow soap batter portions ready to combine with the ivory base',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: prepare two colored portions and keep the remaining batter ivory.',
            }],
          },
          {
            text: 'Pour the two colored portions into opposite sides of the ivory batter, close to the surface to limit splashing. Draw a spatula through the pot once, slowly from one side to the other. Avoid repeated stirring so the colors stay distinct.',
            images: [{
              src: '/images/mango-coral-step-sweep-swirl.jpeg',
              alt: 'Coral-pink and mango-yellow batter being gently swept through ivory soap batter',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: make one gentle sweep to connect the colors.',
            }],
          },
          {
            text: 'Pour the batter in a continuous stream along the loaf mold. Tap the mold gently on a protected counter to release larger air pockets. Cover against dust and set it on a secure, heat-safe surface. Avoid forced heating or heavy insulation for this batch.',
            images: [{
              src: '/images/mango-coral-step-pour-mold.jpeg',
              alt: 'Mango, coral, and ivory soap batter poured into a loaf mold',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: pour the marbled batter into the prepared mold.',
            }],
          },
          {
            text: 'Check the loaf after 24–48 hours. If it dents or sticks, wait another day and check again. Wear gloves while handling young soap. Unmold when it releases cleanly and holds its shape, then cut into bars about 2.5 cm (1 inch) wide, keeping fingers clear of the blade.',
            images: [{
              src: '/images/mango-coral-step-cut-loaf.jpeg',
              alt: 'A firm marbled soap loaf being sliced into bars with a soap cutter',
              width: 627,
              height: 627,
              caption: 'Recipe illustration: wait until the loaf holds its shape before cutting.',
            }],
          },
          'Space the bars apart on a ventilated, nonreactive rack in a cool, dry place for 4–6 weeks. Turn them periodically and record the batch and cure dates. Curing does not correct an incorrectly weighed, lye-heavy, or separated batch; keep finished bars dry between uses.',
        ],
      },
      {
        heading: 'Quick answers about the swirl',
        paragraphs: [
          'If the colors fade, check that the mica is rated for cold-process soap and stay within the supplier’s rate. No fragrance is used in this recipe; adding one is a recipe change, so check the exact product’s supplier and IFRA guidance for rinse-off soap.',
          'Do not replace palm oil by equal weight without recalculating. An oil substitution changes the NaOH requirement and can also affect the batter and finished bar.',
        ],
      },
    ],
    ingredients: [
      { id: 'olive-oil', name: 'Olive oil · 225 g', searchTerm: 'olive oil for cold process soap making', note: 'Reserve 5 g each for the two mica dispersions; included in the 225 g total.' },
      { id: 'palm-oil', name: 'Regular palm oil · 150 g', searchTerm: 'regular palm oil for soap making', note: 'Use regular palm oil, not palm kernel oil.' },
      { id: 'coconut-oil-76', name: 'Coconut oil (76°) · 100 g', searchTerm: '76 degree coconut oil for soap making' },
      { id: 'castor-oil', name: 'Castor oil · 25 g', searchTerm: 'castor oil for cold process soap making' },
      { id: 'sodium-hydroxide', name: 'Sodium hydroxide (NaOH) · 69.52 g', searchTerm: 'sodium hydroxide beads for soap making', note: 'Calculated at 5% superfat; assumes 100% NaOH purity. Verify the supplier specification.' },
      { id: 'distilled-water', name: 'Distilled water · 160.63 g', searchTerm: 'distilled water for soap making' },
      { id: 'coral-mica', name: 'Coral-pink cold-process mica', searchTerm: 'coral pink mica cold process soap colorant', note: 'Optional; check the supplier’s recommended rate.' },
      { id: 'mango-mica', name: 'Mango-yellow cold-process mica', searchTerm: 'mango yellow mica cold process soap colorant', note: 'Optional; check the supplier’s recommended rate.' },
    ],
    equipment: [
      { id: 'digital-scale', name: 'Accurate digital scale', searchTerm: 'digital scale for cold process soap making' },
      { id: 'thermometer', name: 'Thermometer', searchTerm: 'thermometer cold process soap making' },
      { id: 'stainless-pot', name: 'Stainless-steel pot', searchTerm: 'stainless steel pot soap making' },
      { id: 'lye-pitcher', name: 'Lye-rated polypropylene pitcher', searchTerm: 'lye safe polypropylene pitcher soap making' },
      { id: 'silicone-spatulas', name: 'Silicone spatulas', searchTerm: 'silicone spatulas soap making' },
      { id: 'spouted-cups', name: 'Two spouted batter cups', searchTerm: 'spouted pouring cups soap making swirl' },
      { id: 'stick-blender', name: 'Immersion blender', searchTerm: 'immersion stick blender soap making' },
      { id: 'loaf-mold', name: 'Silicone loaf mold · at least 800 g capacity', searchTerm: '800 g silicone loaf mold cold process soap making' },
      { id: 'soap-cutter', name: 'Soap cutter or straight blade', searchTerm: 'soap loaf cutter handmade soap' },
      { id: 'curing-rack', name: 'Ventilated curing rack', searchTerm: 'wire curing rack handmade soap bars' },
      { id: 'splash-goggles', name: 'Splash goggles', searchTerm: 'chemical splash safety goggles' },
      { id: 'chemical-gloves', name: 'Chemical-resistant gloves', searchTerm: 'chemical resistant gloves sodium hydroxide' },
      { id: 'protective-clothing', name: 'Long sleeves and protective clothing', searchTerm: 'protective long sleeve work clothing soap making' },
    ],
  },
];
