import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search, X } from 'lucide-react';
import { Link } from 'wouter';

type GlossaryCategory =
  | 'Basics & methods'
  | 'Formula & lye'
  | 'Mixing & stages'
  | 'Oils & fatty acids'
  | 'Bar qualities'
  | 'Additives & scent'
  | 'Curing & troubleshooting'
  | 'Safety';

type GlossaryTerm = {
  id: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  searchTerms?: string;
};

const glossary: GlossaryTerm[] = [
  { id: 'bar-soap', term: 'Bar soap', category: 'Basics & methods', definition: 'Soap made by combining fats or oils with an alkali. A bar can be made by several processes; the recipe and the way it is handled affect the finished bar.', searchTerms: 'hard soap' },
  { id: 'saponification', term: 'Saponification', category: 'Basics & methods', definition: 'The chemical reaction in which oils or fats react with an alkali to make soap and glycerin. A correctly measured recipe accounts for the type and weight of every fat.' },
  { id: 'cold-process', term: 'Cold process', category: 'Basics & methods', definition: 'A method where oils and lye solution are mixed, poured into a mold, and left to finish reacting and cure. The mixture can warm up naturally even though it is called “cold.”' },
  { id: 'hot-process', term: 'Hot process', category: 'Basics & methods', definition: 'A method where the soap batter is heated while it cooks through saponification. It can be unmolded sooner than cold-process soap, but it still needs time to dry and become a good bar.' },
  { id: 'melt-and-pour', term: 'Melt-and-pour', category: 'Basics & methods', definition: 'A ready-made soap base is melted, customized, and poured into a mold. The maker does not handle raw lye to make the base, but should still follow the base maker’s instructions.' },
  { id: 'rebatch', term: 'Rebatch', category: 'Basics & methods', definition: 'Grating or chopping already-made soap, warming it until soft, then pressing or molding it again. Rebatching can change texture and appearance; it does not correct an unknown or unsafe formula.' },
  { id: 'lye', term: 'Lye', category: 'Basics & methods', definition: 'A common soapmaking name for a strong alkali, usually sodium hydroxide for bar soap or potassium hydroxide for liquid soap. Dry lye and freshly mixed lye solution can cause severe burns.' },
  { id: 'sodium-hydroxide', term: 'Sodium hydroxide (NaOH)', category: 'Basics & methods', definition: 'The alkali most often used to make solid bars. It reacts with the fats in the recipe; use the NaOH amount calculated for those exact fats, not an estimate.', searchTerms: 'caustic soda sodium lye' },
  { id: 'potassium-hydroxide', term: 'Potassium hydroxide (KOH)', category: 'Basics & methods', definition: 'An alkali commonly used for soft or liquid soap. Its SAP values are different from NaOH values, so do not substitute one for the other gram-for-gram.', searchTerms: 'caustic potash potassium lye' },
  { id: 'lye-solution', term: 'Lye solution', category: 'Basics & methods', definition: 'Lye dissolved in the recipe’s liquid, usually water. Mixing releases heat and fumes; use the recipe’s exact weights and follow lye-handling precautions.' },

  { id: 'sap-value', term: 'SAP value', category: 'Formula & lye', definition: '“Saponification value”: the amount of alkali needed to react with a given weight of a fat or oil. Soap calculators use SAP values to estimate the lye required by a blend.', searchTerms: 'saponification value' },
  { id: 'naoh-sap', term: 'NaOH SAP', category: 'Formula & lye', definition: 'The sodium-hydroxide SAP value for a specific fat or oil. It is often written as grams of NaOH per gram of oil; a source may use a different unit, so check how its value is reported.', searchTerms: 'sodium hydroxide sap' },
  { id: 'koh-sap', term: 'KOH SAP', category: 'Formula & lye', definition: 'The potassium-hydroxide SAP value for a specific fat or oil. It is generally larger numerically than the NaOH value for the same fat; the two values are not interchangeable.', searchTerms: 'potassium hydroxide sap' },
  { id: 'soap-calculator', term: 'Soap calculator', category: 'Formula & lye', definition: 'A tool that estimates the alkali and liquid for a recipe using the oil weights, oil-specific SAP values, and any lye reduction. Check its units and assumptions before weighing ingredients.', searchTerms: 'lye calculator formula' },
  { id: 'superfat', term: 'Superfat', category: 'Formula & lye', definition: 'A recipe setting that reduces the calculated lye from the theoretical amount needed to react with all the oils. It is a formulation choice, not a guarantee that a precise amount of a particular oil will remain free in the finished soap.', searchTerms: 'lye discount' },
  { id: 'lye-discount', term: 'Lye discount', category: 'Formula & lye', definition: 'The percentage by which the lye is reduced from the full theoretical amount. It is closely related to superfat in many calculators, though the terms can be used differently.', searchTerms: 'superfat' },
  { id: 'lye-concentration', term: 'Lye concentration', category: 'Formula & lye', definition: 'The percentage of a lye solution that is alkali by weight: lye divided by lye plus liquid. A higher concentration means less liquid in the solution; it does not change the oil SAP values.', searchTerms: 'solution strength' },
  { id: 'water-to-lye-ratio', term: 'Water-to-lye ratio', category: 'Formula & lye', definition: 'The weight of liquid divided by the weight of lye. It describes the same lye solution from a different direction than lye concentration. Always check which one a recipe or calculator reports.', searchTerms: 'liquid to lye ratio' },
  { id: 'oil-weight', term: 'Oil weight', category: 'Formula & lye', definition: 'The combined weight of the oils and fats in a recipe, before lye solution or fragrance is added. Do not confuse it with total batch weight.', searchTerms: 'oil weight total oils' },
  { id: 'batch-size', term: 'Batch size', category: 'Formula & lye', definition: 'The total amount of ingredients in one soapmaking run. Some recipes state batch size as oil weight; others mean all ingredients, so confirm the basis before scaling.' },
  { id: 'oil-percentage', term: 'Oil percentage', category: 'Formula & lye', definition: 'Each oil’s share of the total oil weight. The oil percentages in a formula should add up to 100%, even when the batch is scaled larger or smaller.', searchTerms: 'oil blend formula percent' },
  { id: 'masterbatch', term: 'Masterbatch', category: 'Formula & lye', definition: 'A larger, accurately weighed lye solution prepared ahead of time and portioned into multiple batches. It requires clear labeling, compatible recipes, and careful tracking of both lye and liquid amounts.', searchTerms: 'master batch' },
  { id: 'water-discount', term: 'Water discount', category: 'Formula & lye', definition: 'Using less liquid in a recipe than a chosen reference amount. Less liquid may shorten the time to unmold, but can make the batter thicken faster; it does not mean reducing the lye.', searchTerms: 'liquid discount' },

  { id: 'emulsion', term: 'Emulsion', category: 'Mixing & stages', definition: 'The point where the oils and lye solution are mixed evenly enough to stay together rather than separating. A stable emulsion is needed before the soap is poured or shaped.' },
  { id: 'trace', term: 'Trace', category: 'Mixing & stages', definition: 'A thickening stage in soap batter caused by mixing and the start of saponification. A trail left on the surface is one visual clue; appearance alone does not prove the recipe is fully reacted.', searchTerms: 'soap batter thickness' },
  { id: 'light-trace', term: 'Light trace', category: 'Mixing & stages', definition: 'An early, thin trace where batter is still fluid and a brief line disappears quickly. It is useful when a design needs time, but make sure the oils and lye are emulsified.' },
  { id: 'medium-trace', term: 'Medium trace', category: 'Mixing & stages', definition: 'A thicker trace where a trail stays visible briefly before sinking in. “Medium” is a visual description, not a standardized measurement.' },
  { id: 'thick-trace', term: 'Thick trace', category: 'Mixing & stages', definition: 'A heavy batter that holds ridges or shape. It can be difficult to pour into detailed molds, and may happen quickly with some fats, fragrances, or mixing conditions.' },
  { id: 'false-trace', term: 'False trace', category: 'Mixing & stages', definition: 'A look-alike thickening that happens when solid fats cool and begin to harden before the batter is truly emulsified. The mixture may separate later if mistaken for real trace.', searchTerms: 'stearic spots' },
  { id: 'acceleration', term: 'Acceleration', category: 'Mixing & stages', definition: 'When batter thickens faster than expected after an ingredient is added or the mixture is blended. Some fragrances and formula choices can shorten the time available for pouring.' },
  { id: 'seizing', term: 'Seizing', category: 'Mixing & stages', definition: 'A very rapid thickening that can make soap batter stiff or crumbly before it is poured. It is different from gradual, workable trace.' },
  { id: 'gel-phase', term: 'Gel phase', category: 'Mixing & stages', definition: 'A temporary warm stage during saponification when soap in the mold can look translucent or jelly-like. Soap can be made with or without a full gel phase.', searchTerms: 'gel' },
  { id: 'partial-gel', term: 'Partial gel', category: 'Mixing & stages', definition: 'When only part of a loaf warms enough to gel. It can leave a visible color or texture difference between the center and edges; it is usually cosmetic.' },
  { id: 'cpop', term: 'CPOP', category: 'Mixing & stages', definition: '“Cold process oven process”: using retained oven warmth to encourage gel phase in cold-process soap. Follow a reliable method for the mold and oven; excessive heat can cause problems.', searchTerms: 'cold process oven process' },

  { id: 'hard-oils', term: 'Hard oils and fats', category: 'Oils & fatty acids', definition: 'Oils or fats that are solid or firm at typical room temperature, such as many butters and animal fats. Their properties vary; the name alone does not predict the finished bar.' },
  { id: 'soft-oils', term: 'Soft oils', category: 'Oils & fatty acids', definition: 'Oils that are liquid at typical room temperature. Their fatty-acid makeup and SAP values differ, so use values for the specific oil and processing type.' },
  { id: 'fatty-acid-profile', term: 'Fatty-acid profile', category: 'Oils & fatty acids', definition: 'The mix of fatty acids in an oil or fat. It helps explain how an ingredient can influence soap qualities, but does not replace its own SAP value or a tested formula.', searchTerms: 'fat composition' },
  { id: 'lauric-acid', term: 'Lauric acid', category: 'Oils & fatty acids', definition: 'A saturated fatty acid found in some soapmaking fats. In soap, it is generally associated with strong cleansing and quick, bubbly lather; high amounts may feel drying to some people.' },
  { id: 'myristic-acid', term: 'Myristic acid', category: 'Oils & fatty acids', definition: 'A saturated fatty acid that can contribute to hardness, cleansing, and quick lather in soap. The result depends on the entire oil blend.' },
  { id: 'palmitic-acid', term: 'Palmitic acid', category: 'Oils & fatty acids', definition: 'A saturated fatty acid that can contribute to a firm bar and stable, creamy lather.' },
  { id: 'stearic-acid', term: 'Stearic acid', category: 'Oils & fatty acids', definition: 'A saturated fatty acid that can contribute to a firm bar and dense lather. Batter rich in stearic acid can thicken quickly as it cools.', searchTerms: 'false trace' },
  { id: 'oleic-acid', term: 'Oleic acid', category: 'Oils & fatty acids', definition: 'A monounsaturated fatty acid found in many liquid oils. In soap it is often associated with a mild feel and a slower-developing lather; curing and the full formula matter.' },
  { id: 'linoleic-acid', term: 'Linoleic acid', category: 'Oils & fatty acids', definition: 'A polyunsaturated fatty acid found in many plant oils. It contributes to the character of an oil blend, but large amounts of highly unsaturated oils can make a bar more prone to rancidity.' },
  { id: 'linolenic-acid', term: 'Linolenic acid', category: 'Oils & fatty acids', definition: 'A highly unsaturated fatty acid found in some plant oils. It can contribute to a softer-feeling bar and may increase oxidation risk when present in larger amounts.' },
  { id: 'ricinoleic-acid', term: 'Ricinoleic acid', category: 'Oils & fatty acids', definition: 'A fatty acid characteristic of castor oil. In soap recipes, castor oil is often used in modest amounts to support lather.' },
  { id: 'tallow', term: 'Tallow', category: 'Oils & fatty acids', definition: 'Rendered animal fat used in some soap recipes. Its properties and SAP can depend on the animal and how the fat was prepared; use a matching source value.' },
  { id: 'lard', term: 'Lard', category: 'Oils & fatty acids', definition: 'Rendered pork fat used in some soap recipes. Use an SAP value that matches the ingredient and source rather than assuming all animal fats are interchangeable.' },
  { id: 'soap-butter', term: 'Butters in soap', category: 'Oils & fatty acids', definition: 'Plant fats sold as butters, such as shea or cocoa butter. Check that the product is a clearly identified, unblended fat before using a published SAP value.', searchTerms: 'shea cocoa butter' },

  { id: 'lather', term: 'Lather', category: 'Bar qualities', definition: 'The foam produced when soap is mixed with water and rubbed. Lather depends on the oil blend, water, use, and bar age; more foam does not automatically mean better cleansing.' },
  { id: 'bubbly-lather', term: 'Bubbly lather', category: 'Bar qualities', definition: 'Lather with larger, quicker-forming bubbles. Some fatty acids can support it, but the blend and conditions of use also matter.', searchTerms: 'bubbles' },
  { id: 'creamy-lather', term: 'Creamy lather', category: 'Bar qualities', definition: 'Dense, fine-textured foam. Some fats can support a creamier lather, especially when balanced with oils that help create bubbles.' },
  { id: 'cleansing', term: 'Cleansing', category: 'Bar qualities', definition: 'A soap-formulation term often used for how readily a bar removes oils and soil. It is not a clinical skin-care rating, and stronger cleansing is not always preferable.' },
  { id: 'conditioning', term: 'Conditioning', category: 'Bar qualities', definition: 'A traditional soap-calculator label for a recipe’s predicted mild or skin feel. It is an estimate, not a regulated measurement or a guarantee for every person.', searchTerms: 'mildness' },
  { id: 'hardness', term: 'Hardness', category: 'Bar qualities', definition: 'How firm a soap bar becomes. Oil blend, water, cure time, and storage can all affect firmness; a calculator’s hardness score is only a recipe estimate.' },
  { id: 'longevity', term: 'Longevity', category: 'Bar qualities', definition: 'How long a bar lasts in use. A harder, well-cured bar kept out of standing water often lasts longer, but use and storage make a difference.' },
  { id: 'solubility', term: 'Solubility', category: 'Bar qualities', definition: 'How readily soap dissolves in water. A very soluble bar may produce lather quickly but can wear away faster if it stays wet between uses.' },

  { id: 'essential-oil', term: 'Essential oil', category: 'Additives & scent', definition: 'A concentrated aromatic material obtained from plants. “Natural” does not mean harmless: each essential oil has its own safe-use limits and may need an exact supplier document.' },
  { id: 'fragrance-oil', term: 'Fragrance oil', category: 'Additives & scent', definition: 'A scent ingredient or blend made for products such as soap. Use the maximum rate for the exact fragrance and soap application, not a rate copied from a different scent.' },
  { id: 'ifra', term: 'IFRA standard and use limit', category: 'Additives & scent', definition: 'Industry standards and product-category limits published by the International Fragrance Association. For soap, check the current statement for the exact fragrance and rinse-off soap category; it is a use limit, not proof that a finished formula is safe.', searchTerms: 'category 9 fragrance maximum rate certificate' },
  { id: 'colorant', term: 'Colorant', category: 'Additives & scent', definition: 'A material used to color soap. Choose colorants intended for the product and follow the seller’s dosage and usage instructions; a colorant suitable for crafts may not be suitable for skin-contact products.' },
  { id: 'mica', term: 'Mica', category: 'Additives & scent', definition: 'A shimmery mineral-based powder often used as a colorant. Some micas can change color or lose brightness in soap’s high-pH environment; check that the grade is intended for the use.' },
  { id: 'iron-oxide', term: 'Iron oxide pigment', category: 'Additives & scent', definition: 'A mineral pigment used to color soap. Only use a grade intended for cosmetic or soap use and follow its supplier’s directions.', searchTerms: 'oxide pigment' },
  { id: 'clay', term: 'Clay', category: 'Additives & scent', definition: 'A fine mineral powder sometimes added to soap for color or feel. Disperse it as directed to help prevent clumps, and use a product intended for the purpose.' },
  { id: 'chelator', term: 'Chelator', category: 'Additives & scent', definition: 'An ingredient that binds certain metal ions in water. In soap it can help reduce mineral-related soap scum or discoloration; it does not replace accurate lye calculations.', searchTerms: 'sodium citrate EDTA' },
  { id: 'sodium-lactate', term: 'Sodium lactate', category: 'Additives & scent', definition: 'A salt sometimes added to lye liquid to help unmold a bar sooner or make it feel firmer. Use the supplier’s recommended amount; it does not replace curing.' },
  { id: 'sugar', term: 'Sugar in soap', category: 'Additives & scent', definition: 'Sugar can encourage more bubbles in some recipes. It can also make batter heat up more, so measure carefully and manage temperature.', searchTerms: 'honey' },
  { id: 'salt', term: 'Salt in soap', category: 'Additives & scent', definition: 'Sodium chloride can change a bar’s firmness and lather depending on when and how much is added. Too much may reduce lather; salt bars use a distinct recipe approach.' },
  { id: 'milk-soap', term: 'Milk soap', category: 'Additives & scent', definition: 'Soap made with milk as some or all of the recipe liquid. Sugars in milk can heat and darken during lye mixing, so use a tested method for that particular milk and process.' },
  { id: 'glycerin', term: 'Glycerin', category: 'Additives & scent', definition: 'A substance naturally produced during saponification. It remains in properly made handmade soap and helps give the bar its characteristic feel.' },

  { id: 'cure', term: 'Cure', category: 'Curing & troubleshooting', definition: 'The weeks after soap is unmolded when excess water evaporates and the bar’s structure continues to develop. A longer cure often makes a bar firmer and longer-lasting; it does not fix a lye-heavy or unknown recipe.', searchTerms: 'curing time' },
  { id: 'evaporation', term: 'Evaporation', category: 'Curing & troubleshooting', definition: 'Water leaving the soap as it cures. This loss of moisture helps the bar firm up and last longer in use.' },
  { id: 'soda-ash', term: 'Soda ash', category: 'Curing & troubleshooting', definition: 'A pale, powdery surface layer, usually sodium carbonate, that can form when fresh soap reacts with carbon dioxide in air. It is usually cosmetic and is not the same as unreacted lye.' },
  { id: 'dos', term: 'DOS (dreaded orange spots)', category: 'Curing & troubleshooting', definition: 'Orange or brown spots that can signal oxidized or rancid oils in soap. Causes may include old oils, storage, formula, or trace metals; a spotty bar should not be assumed to be fine based on appearance alone.', searchTerms: 'orange spots rancidity' },
  { id: 'rancidity', term: 'Rancidity', category: 'Curing & troubleshooting', definition: 'Oxidation or breakdown of fats that can cause an off smell or spots in soap. Fresh ingredients, suitable storage, and a balanced formula can help reduce the risk.' },
  { id: 'glycerin-rivers', term: 'Glycerin rivers', category: 'Curing & troubleshooting', definition: 'Translucent streaks or veins that sometimes appear in soap as it heats and cools. They are generally a visual effect, not literal rivers of extra glycerin.' },
  { id: 'stearic-spots', term: 'Stearic spots', category: 'Curing & troubleshooting', definition: 'Opaque specks or streaks that can form when high-melting fats cool unevenly or a batter thickens before it is fully mixed. They can be mistaken for other defects, so review the full process.', searchTerms: 'false trace' },
  { id: 'separation-defect', term: 'Separation', category: 'Curing & troubleshooting', definition: 'When oil or liquid visibly separates from soap batter or a finished bar. Do not assume separated soap is safe to use; have the exact recipe and process reviewed.' },
  { id: 'ph', term: 'pH', category: 'Curing & troubleshooting', definition: 'A measure of how acidic or alkaline a water-based solution is. Soap is naturally alkaline; one pH reading or strip cannot by itself prove that a bar is correctly formulated or safe.', searchTerms: 'acidity alkalinity ph strips' },
  { id: 'water-testing', term: 'pH strip testing', category: 'Curing & troubleshooting', definition: 'A rough check of acidity or alkalinity using indicator paper. Results depend on the test method and the strip; a pH reading alone does not detect every formulation problem or certify soap as safe.', searchTerms: 'pH testing' },

  { id: 'ppe', term: 'PPE (personal protective equipment)', category: 'Safety', definition: 'Protective gear used to reduce exposure to lye and splashes, such as chemical-resistant gloves, eye protection, long sleeves, and closed shoes. Follow the safety instructions for the specific lye and process.', searchTerms: 'gloves goggles clothing' },
  { id: 'sds', term: 'SDS (Safety Data Sheet)', category: 'Safety', definition: 'A supplier document describing a chemical’s hazards, handling, storage, first aid, and other safety information. Read the SDS for the exact lye product before using it.', searchTerms: 'MSDS' },
  { id: 'lye-to-water', term: 'Add lye to water', category: 'Safety', definition: 'A lye-mixing safety rule: slowly add lye into the measured liquid while stirring, never pour liquid onto a pile of lye. The mixture gets hot and can release irritating fumes; use appropriate PPE and ventilation.', searchTerms: 'never water into lye' },
  { id: 'chemical-burn', term: 'Chemical burn', category: 'Safety', definition: 'Damage to skin or eyes caused by a corrosive material such as lye. Follow the lye supplier’s first-aid instructions and seek urgent medical or poison-control guidance for exposure; do not try to neutralize a burn with another chemical.', searchTerms: 'lye burn first aid' },
  { id: 'zap-test', term: '“Zap test”', category: 'Safety', definition: 'An old folk method that involves touching soap to the tongue to look for an electric-like sensation. Do not put soap or uncured batter in your mouth; use a reliable, safety-reviewed assessment method instead.', searchTerms: 'tongue test safety' },
];

const categories: GlossaryCategory[] = [
  'Basics & methods',
  'Formula & lye',
  'Mixing & stages',
  'Oils & fatty acids',
  'Bar qualities',
  'Additives & scent',
  'Curing & troubleshooting',
  'Safety',
];

function searchableText(term: GlossaryTerm): string {
  return `${term.term} ${term.definition} ${term.searchTerms ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function SoapmakingGlossaryPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'All terms'>('All terms');
  const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const filteredGlossary = useMemo(
    () => glossary.filter((term) =>
      (activeCategory === 'All terms' || term.category === activeCategory) &&
      (!normalizedQuery || searchableText(term).includes(normalizedQuery)),
    ),
    [activeCategory, normalizedQuery],
  );

  return (
    <>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-8 pt-12 sm:flex-row sm:items-end sm:justify-between lg:px-8 lg:pt-16">
        <div className="max-w-3xl animate-rise">
          <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Soapmaking guide
          </p>
          <h1 className="font-display text-5xl leading-[.98] tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-6xl">
            Soapmaking, in <span className="text-[hsl(var(--primary))]">plain language.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Look up common soapmaking words, from SAP values and trace to cure time and lye safety.
          </p>
        </div>
        <Link
          href="/calculators/cold-process-soap"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(184_75%_29%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] sm:self-auto"
          data-testid="link-glossary-calculator"
        >
          Open the soap calculator <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8 lg:pb-16" aria-label="Soapmaking definitions">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="glossary-search" className="sr-only">Search soapmaking terms</label>
            <div className="relative min-w-0 flex-1">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                id="glossary-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a term or meaning…"
                className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-11 pr-4 text-sm text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)]"
                data-testid="input-glossary-search"
              />
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                data-testid="button-clear-glossary-search"
              >
                <X size={16} aria-hidden="true" /> Clear search
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter definitions by category">
            <button
              type="button"
              onClick={() => setActiveCategory('All terms')}
              aria-pressed={activeCategory === 'All terms'}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${activeCategory === 'All terms' ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'}`}
              data-testid="button-glossary-category-all"
            >
              All terms
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${activeCategory === category ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'}`}
                data-testid={`button-glossary-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]" aria-live="polite" data-testid="text-glossary-count">
              {filteredGlossary.length} {filteredGlossary.length === 1 ? 'definition' : 'definitions'}
            </p>
            {activeCategory !== 'All terms' && <span className="text-xs text-[hsl(var(--muted-foreground))]">{activeCategory}</span>}
          </div>
        </div>

        {filteredGlossary.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-[hsl(var(--border))] bg-white px-6 py-14 text-center" data-testid="empty-glossary">
            <BookOpen size={26} aria-hidden="true" className="mx-auto text-[hsl(var(--primary))]" />
            <h2 className="mt-3 font-display text-2xl text-[hsl(var(--foreground))]">No matching terms</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try another search, or clear your filters to see all definitions.</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveCategory('All terms'); }}
              className="mt-5 rounded-full border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              data-testid="button-reset-glossary"
            >
              Show all terms
            </button>
          </div>
        ) : (
          categories
            .map((category) => ({
              category,
              terms: filteredGlossary.filter((term) => term.category === category),
            }))
            .filter((group) => group.terms.length > 0)
            .map(({ category, terms }) => (
              <section key={category} className="mt-8" aria-labelledby={`glossary-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 id={`glossary-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="font-display text-2xl text-[hsl(var(--foreground))] sm:text-3xl">
                    {category}
                  </h2>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{terms.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {terms.map((term) => (
                    <article
                      key={term.id}
                      className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 transition-shadow hover:shadow-card"
                      data-testid={`glossary-term-${term.id}`}
                    >
                      <h3 className="font-display text-xl text-[hsl(var(--foreground))]">{term.term}</h3>
                      <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{term.definition}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))
        )}

        <aside className="mt-10 rounded-3xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] p-5 text-sm leading-6 text-[hsl(var(--accent-foreground))] sm:p-6">
          <h2 className="font-bold">A note on safety</h2>
          <p className="mt-1">
            Definitions are a learning aid, not a substitute for a tested recipe, current ingredient documents, or safe handling instructions. Always verify the amounts for your exact ingredients and wear suitable protective gear when handling lye.
          </p>
        </aside>
      </section>
    </>
  );
}