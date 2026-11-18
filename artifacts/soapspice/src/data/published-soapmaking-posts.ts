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
          'Weigh the olive oil, distilled water, and NaOH separately. Tare the scale with each empty container. Put on splash goggles, gloves, and long sleeves before opening the NaOH.',
          'Set the lye-safe pitcher on a stable surface. Slowly add the NaOH to the distilled water while stirring. Keep your face back, then leave the solution to cool in a secure, ventilated spot.',
          'Once the solution is about 100–110°F (38–43°C), gently warm the olive oil to a similar temperature if needed. Carefully pour the solution into the oil. Keep the blender head submerged and alternate short pulses with hand stirring until a drizzle briefly leaves a faint line.',
          'Pour the batter into a silicone loaf mold on a flat, level surface. Leave it undisturbed in a secure place while it firms.',
          'Check the loaf after about 48 hours. Wearing gloves, gently peel back the mold. If the loaf dents or sticks, wait another day; slice once it releases cleanly and holds its shape.',
          'Place the bars apart on a rack in a dry, airy place away from direct sunlight. Allow about six months of cure for a firmer, longer-lasting Castile bar; humid conditions need plenty of airflow.',
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
          'Set the loaf mold on a level surface. Mix each mica separately with about 1 teaspoon of olive oil reserved from the measured 200 g. Weigh the final calculator fragrance amount into a separate cup.',
          'Slowly sprinkle the weighed NaOH into the distilled water while gently stirring. Keep your face back from the rising vapors, then leave the solution to cool in a secure, ventilated area.',
          'If using bulk palm oil, melt and stir it thoroughly before weighing. Melt the palm and coconut oils, then stir in the castor oil and remaining olive oil. Aim for roughly 100–110°F (38–43°C) for both oils and lye solution, with the oils fully liquid.',
          'Pour the lye solution into the oils. Use short stick-blender pulses and hand stirring until the batter is uniformly emulsified and still fluid at light trace. Stir in the fragrance by hand, following the supplier’s acceleration guidance.',
          'Pour about 100 g of batter into each spouted cup. Mix lilac into one and deep plum into the other. Pour the remaining cream-colored batter into the loaf mold.',
          'Pour a thin plum stream along the loaf from several inches above the surface to push it deeper. Pour the lilac stream closer to the surface for a shallower ribbon. Repeat along different parts of the mold. Use remaining colored batter for a few lines on top, then lightly draw a skewer through the surface.',
          'Check the loaf after 24–48 hours. With gloves on, unmold and slice when it releases cleanly and holds its shape. Space bars on a rack in a dry, ventilated spot away from direct sun for a 4–6 week cure.',
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
];
