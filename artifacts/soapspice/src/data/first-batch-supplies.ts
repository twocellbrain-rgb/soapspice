export type FirstBatchSupply = {
  id: string;
  name: string;
  detail: string;
  searchQuery: string;
  group: 'tools' | 'safety';
  level: 'required' | 'recommended';
};

export const firstBatchSupplies: FirstBatchSupply[] = [
  {
    id: 'first-batch-scale',
    name: 'Digital scale with 1 g resolution',
    detail: 'Weigh every ingredient; do not measure soap ingredients by cups.',
    searchQuery: 'digital kitchen scale 1 gram resolution',
    group: 'tools',
    level: 'required',
  },
  {
    id: 'first-batch-lye-pitcher',
    name: 'Lye-safe mixing pitcher',
    detail: 'Choose HDPE #2 plastic or stainless steel. Never use aluminum.',
    searchQuery: 'HDPE #2 lye mixing pitcher soap making',
    group: 'tools',
    level: 'required',
  },
  {
    id: 'first-batch-stainless-pot',
    name: 'Stainless-steel pot for oils',
    detail: 'Use stainless steel or another soap-safe material; avoid aluminum.',
    searchQuery: 'stainless steel pot soap making oils',
    group: 'tools',
    level: 'required',
  },
  {
    id: 'first-batch-spatula',
    name: 'Stainless-steel or silicone spatula',
    detail: 'Keep tools dedicated to soapmaking and out of food use.',
    searchQuery: 'stainless steel silicone spatula soap making',
    group: 'tools',
    level: 'required',
  },
  {
    id: 'first-batch-mold',
    name: 'Small silicone soap mold',
    detail: 'Pick a mold sized for the oil weight in your formula.',
    searchQuery: 'small silicone loaf soap mold',
    group: 'tools',
    level: 'required',
  },
  {
    id: 'first-batch-immersion-blender',
    name: 'Dedicated immersion blender',
    detail: 'Recommended for mixing; do not return soapmaking tools to food use.',
    searchQuery: 'stainless immersion blender soap making',
    group: 'tools',
    level: 'recommended',
  },
  {
    id: 'first-batch-thermometer',
    name: 'Digital thermometer',
    detail: 'Helpful for checking oil and lye-solution temperatures.',
    searchQuery: 'digital kitchen thermometer soap making',
    group: 'tools',
    level: 'recommended',
  },
  {
    id: 'first-batch-splash-goggles',
    name: 'Chemical splash goggles',
    detail: 'Wear sealed splash goggles; ordinary glasses do not protect against splashes.',
    searchQuery: 'chemical splash goggles sodium hydroxide lye',
    group: 'safety',
    level: 'required',
  },
  {
    id: 'first-batch-gloves',
    name: 'Chemical-resistant gloves',
    detail: 'Check the manufacturer’s label for sodium-hydroxide compatibility.',
    searchQuery: 'chemical resistant gloves sodium hydroxide lye soap making',
    group: 'safety',
    level: 'required',
  },
  {
    id: 'first-batch-apron',
    name: 'Long-sleeved apron',
    detail: 'Cover skin with long sleeves and an apron while handling NaOH.',
    searchQuery: 'chemical resistant apron soap making lye',
    group: 'safety',
    level: 'required',
  },
];
