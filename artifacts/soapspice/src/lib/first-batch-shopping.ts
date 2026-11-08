import { firstBatchSupplies } from '@/data/first-batch-supplies';
import { getAmazonLink } from '@/lib/amazon-links';
import { GRAMS_PER_OUNCE } from '@/lib/formulation';
import type { PrintableFormula } from '@/lib/formula-sheet';

export type BatchShoppingItem = {
  id: string;
  name: string;
  detail: string;
  amount?: string;
  weightGrams?: number;
  group: 'materials' | 'tools' | 'safety';
  level: 'required' | 'recommended' | 'verify';
  href: string;
  isAffiliate: boolean;
};

export type FirstBatchShoppingList = {
  unit: 'g' | 'oz';
  materials: BatchShoppingItem[];
  tools: BatchShoppingItem[];
  safety: BatchShoppingItem[];
  fragranceSelected: boolean;
};

export function formatBatchWeight(grams: number, unit: 'g' | 'oz') {
  return unit === 'oz'
    ? `${(grams / GRAMS_PER_OUNCE).toFixed(2)} oz`
    : `${grams.toFixed(2)} g`;
}

function fragranceGrams(
  fragrance: PrintableFormula['fragrances'][number],
  totalOilGrams: number,
) {
  if (fragrance.unit === 'oz') return fragrance.amount * GRAMS_PER_OUNCE;
  if (fragrance.unit === 'percent') return totalOilGrams * fragrance.amount / 100;
  return fragrance.amount;
}

function withAmazonLink(
  item: Omit<BatchShoppingItem, 'href' | 'isAffiliate'>,
  searchQuery: string,
): BatchShoppingItem {
  return { ...item, ...getAmazonLink(item.id, searchQuery) };
}

export function buildFirstBatchShoppingList(formula: PrintableFormula, displayUnit?: 'g' | 'oz'): FirstBatchShoppingList {
  const unit = displayUnit ?? (formula.oilInputUnit === 'oz' ? 'oz' : 'g');
  const totalOilGrams = formula.oils.reduce((sum, oil) => sum + oil.weight, 0);
  const materials: BatchShoppingItem[] = formula.oils.map((oil) =>
    withAmazonLink({
      id: oil.id,
      name: oil.name,
      amount: formatBatchWeight(oil.weight, unit),
      weightGrams: oil.weight,
      detail: `${oil.percentage.toFixed(2)}% of the oils. Match the exact grade shown in the calculator.`,
      group: 'materials',
      level: 'required',
    }, `${oil.name} soap making oil`),
  );

  materials.push(withAmazonLink({
    id: 'sodium-hydroxide',
    name: 'Sodium hydroxide (NaOH, commonly called lye)',
    amount: formatBatchWeight(formula.result.naoh, unit),
    weightGrams: formula.result.naoh,
    detail: `Calculator amount at ${formula.superfat}% superfat. Confirm product purity; the calculation assumes 100% NaOH.`,
    group: 'materials',
    level: 'required',
  }, '100% pure sodium hydroxide beads soap making lye'));

  const liquidQuery = formula.liquidName.toLowerCase().includes('distilled water')
    ? 'distilled water gallon'
    : `${formula.liquidName} soap making liquid`;
  materials.push(withAmazonLink({
    id: `mixing-liquid-${formula.liquidName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: `${formula.liquidName} for NaOH solution`,
    amount: formatBatchWeight(formula.result.liquid, unit),
    weightGrams: formula.result.liquid,
    detail: 'Use the calculator’s weight, not a cup-volume estimate.',
    group: 'materials',
    level: 'required',
  }, liquidQuery));

  for (const fragrance of formula.fragrances) {
    const grams = fragranceGrams(fragrance, totalOilGrams);
    materials.push(withAmazonLink({
      id: `fragrance-${fragrance.id}`,
      name: fragrance.name,
      amount: formatBatchWeight(grams, unit),
      weightGrams: grams,
      detail: grams > 0
        ? 'Use only if this dose is within the supplier’s current IFRA limit for your soap.'
        : 'The calculator dose is zero. Verify a current supplier safety limit before using or buying for this batch.',
      group: 'materials',
      level: grams > 0 ? 'required' : 'verify',
    }, `${fragrance.name} fragrance oil soap making`));
  }

  const supplies = firstBatchSupplies.map((supply) => withAmazonLink({
    id: supply.id,
    name: supply.name,
    detail: supply.detail,
    group: supply.group,
    level: supply.level,
  }, supply.searchQuery));

  return {
    unit,
    materials,
    tools: supplies.filter((item) => item.group === 'tools'),
    safety: supplies.filter((item) => item.group === 'safety'),
    fragranceSelected: formula.fragrances.length > 0,
  };
}
