export type FormulaOil = {
  id: string;
  percentage: number;
  weight: number; // grams
};

export function oilWeightTotal(oils: Pick<FormulaOil, 'weight'>[]): number {
  return oils.reduce((total, oil) => total + oil.weight, 0);
}

export function percentagesFromWeights<T extends FormulaOil>(oils: T[]): T[] {
  const total = oilWeightTotal(oils);
  return oils.map((oil) => ({
    ...oil,
    percentage: Number.isFinite(total) && total > 0 ? oil.weight / total * 100 : 0,
  }));
}

export type SapRecord = {
  naohSap: number;
};

export const GRAMS_PER_OUNCE = 28.349523125;
// Approximate typical liquid share of the complete pre-saponification batch.
// This is our own disclosed starting model, not Bramble Berry's published formula.
export const LIQUID_BATCH_FRACTION = 0.22;
// Bramble Berry publishes 0.7 oz/lb of total cold-process soap as a general
// medium-strength reference. Mild and strong are SoapSpice guide levels, not
// fragrance-specific recommendations from Bramble Berry.
export const SCENT_GUIDE_OZ_PER_LB = [
  { label: 'Strong', ouncesPerPound: 1 },
  { label: 'Medium', ouncesPerPound: 0.7 },
  { label: 'Mild', ouncesPerPound: 0.35 },
] as const;

export type FragranceRow = {
  id: string;
  name: string;
  amount: number;
  unit: 'g' | 'oz' | 'percent';
  ifraMaxPercent?: number;
  ifraSourceUrl?: string;
};

export type NaohFormulaInput = {
  oils: FormulaOil[];
  ingredients: Map<string, SapRecord>;
  totalOilGrams: number;
  superfat: number;
  fragrances?: FragranceRow[];
};

export function fragranceWeightGrams(row: FragranceRow, totalOilGrams: number): number {
  switch (row.unit) {
    case 'g': return row.amount;
    case 'oz': return row.amount * GRAMS_PER_OUNCE;
    case 'percent': return totalOilGrams * row.amount / 100;
    default: return NaN;
  }
}

export function fragranceIfraScreen(row: FragranceRow, totalOilGrams: number) {
  // IFRA certificates express a limit for finished product. Oil weight is a
  // conservative screening base while the cured soap weight is unknown.
  const maximumGrams = row.ifraMaxPercent == null || !Number.isFinite(row.ifraMaxPercent) ||
    row.ifraMaxPercent < 0 || row.ifraMaxPercent > 100
    ? null : totalOilGrams * row.ifraMaxPercent / 100;
  const enteredGrams = fragranceWeightGrams(row, totalOilGrams);
  return {
    maximumGrams,
    enteredGrams,
    exceeds: maximumGrams !== null && enteredGrams > maximumGrams + 1e-9,
  };
}

function unscentedGuideBatchGrams(totalOilGrams: number, naohGrams: number): number {
  return (totalOilGrams + naohGrams) / (1 - LIQUID_BATCH_FRACTION);
}

export function combinedScentStrength(fragrances: FragranceRow[], totalOilGrams: number, naohGrams: number) {
  const totalGrams = fragrances.reduce((sum, row) => sum + fragranceWeightGrams(row, totalOilGrams), 0);
  const guideBatchGrams = unscentedGuideBatchGrams(totalOilGrams, naohGrams);
  const ouncesPerPound = totalGrams / guideBatchGrams * 16;
  const mild = SCENT_GUIDE_OZ_PER_LB[2].ouncesPerPound;
  const medium = SCENT_GUIDE_OZ_PER_LB[1].ouncesPerPound;
  const strong = SCENT_GUIDE_OZ_PER_LB[0].ouncesPerPound;
  const closeTo = (value: number) => Math.abs(ouncesPerPound - value) < 1e-9;
  const strengthLabel = closeTo(mild) ? 'At mild'
    : closeTo(medium) ? 'At medium'
    : closeTo(strong) ? 'At strong'
    : ouncesPerPound < mild ? 'Below mild'
    : ouncesPerPound < medium ? 'Between mild and medium'
    : ouncesPerPound < strong ? 'Between medium and strong'
    : 'Above strong';
  return { totalGrams, guideBatchGrams, ouncesPerPound, strengthLabel };
}

export function fragranceScentGuide(row: FragranceRow, totalOilGrams: number, naohGrams: number) {
  // Bramble Berry's cold-process guide uses total soap weight (oils, liquid,
  // lye). Use the unscented baseline so adding fragrance never raises its own
  // recommendation. The existing liquid model is kept unchanged.
  const unscentedBatchGrams = unscentedGuideBatchGrams(totalOilGrams, naohGrams);
  const screen = fragranceIfraScreen(row, totalOilGrams);
  return {
    ...screen,
    unscentedBatchGrams,
    tiers: SCENT_GUIDE_OZ_PER_LB.map((tier) => {
      const grams = unscentedBatchGrams * tier.ouncesPerPound / 16;
      return {
        ...tier,
        grams,
        percentOfBatch: tier.ouncesPerPound / 16 * 100,
        exceeds: screen.maximumGrams !== null && grams > screen.maximumGrams + 1e-9,
      };
    }),
  };
}

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateNaohFormula(input: NaohFormulaInput): string[] {
  const { oils, ingredients, totalOilGrams, superfat } = input;
  const fragrances = input.fragrances ?? [];
  const errors: string[] = [];

  if (!Number.isFinite(totalOilGrams) || totalOilGrams <= 0) {
    errors.push('Total oil weight must be greater than zero.');
  }
  if (oils.length === 0) {
    errors.push('Add at least one oil or butter.');
  }
  if (new Set(oils.map((oil) => oil.id)).size !== oils.length) {
    errors.push('Each ingredient can only be added once.');
  }
  if (oils.some((oil) => !Number.isFinite(oil.percentage) || oil.percentage <= 0 || oil.percentage > 100)) {
    errors.push('Every ingredient must have a percentage between 0% and 100%.');
  }
  if (oils.some((oil) => !Number.isFinite(oil.weight) || oil.weight <= 0)) {
    errors.push('Every ingredient needs a weight greater than zero.');
  }

  const percentTotal = oils.reduce((sum, oil) => sum + oil.percentage, 0);
  if (!Number.isFinite(percentTotal) || Math.abs(percentTotal - 100) > 0.01) {
    errors.push(`Percentages add up to ${Number.isFinite(percentTotal) ? percentTotal.toFixed(2) : 'an invalid number'}%. They must equal 100%.`);
  }
  const weightTotal = oils.reduce((sum, oil) => sum + oil.weight, 0);
  if (Number.isFinite(totalOilGrams) && Number.isFinite(weightTotal) && Math.abs(weightTotal - totalOilGrams) > Math.max(0.02, totalOilGrams * 0.00001)) {
    errors.push('Ingredient weights must add up to the total oil weight.');
  }
  if (oils.some((oil) => {
    const sap = ingredients.get(oil.id)?.naohSap;
    return sap == null || !Number.isFinite(sap) || sap <= 0 || sap >= 1;
  })) {
    errors.push('Every ingredient must have a valid NaOH SAP value.');
  }
  if (!Number.isFinite(superfat) || superfat < 0 || superfat > 15) {
    errors.push('Superfat must be between 0% and 15% for this calculator.');
  }
  if (fragrances.some((row) => !row.name.trim())) {
    errors.push('Name each fragrance before validating.');
  }
  if (fragrances.some((row) => !Number.isFinite(row.amount) || row.amount <= 0 || !Number.isFinite(fragranceWeightGrams(row, totalOilGrams)))) {
    errors.push('Every fragrance needs a positive amount in grams, ounces, or percent of oils.');
  }
  if (fragrances.reduce((sum, row) => sum + fragranceWeightGrams(row, totalOilGrams), 0) > totalOilGrams) {
    errors.push('Fragrance cannot weigh more than the total oils. Check the entered units.');
  }
  if (fragrances.some((row) => row.ifraMaxPercent != null &&
    (!Number.isFinite(row.ifraMaxPercent) || row.ifraMaxPercent < 0 || row.ifraMaxPercent > 100))) {
    errors.push('An IFRA maximum must be a percentage from 0% to 100%. Use 0% if the fragrance is not permitted in soap.');
  }
  if (fragrances.some((row) => row.ifraSourceUrl?.trim() &&
    (row.ifraSourceUrl.length > 500 || !validHttpUrl(row.ifraSourceUrl)))) {
    errors.push('Each IFRA source link must be a valid http or https URL of at most 500 characters.');
  }

  return errors;
}

export function calculateNaohFormula(input: NaohFormulaInput) {
  const errors = validateNaohFormula(input);
  if (errors.length) {
    throw new Error(errors.join(' '));
  }

  const ingredientLye = input.oils.map((oil) => ({
    id: oil.id,
    weight: oil.weight,
    sap: input.ingredients.get(oil.id)!.naohSap,
    theoreticalNaoh: oil.weight * input.ingredients.get(oil.id)!.naohSap,
  }));
  const naohBeforeSuperfat = ingredientLye.reduce((sum, oil) => sum + oil.theoreticalNaoh, 0);
  const naoh = naohBeforeSuperfat * (1 - input.superfat / 100);
  const fragranceDetails = (input.fragrances ?? []).map((row) => ({
    id: row.id,
    name: row.name.trim(),
    weightGrams: fragranceWeightGrams(row, input.totalOilGrams),
  }));
  const fragranceTotalGrams = fragranceDetails.reduce((sum, row) => sum + row.weightGrams, 0);
  // liquid = fraction × (oils + NaOH + fragrances + liquid)
  const liquid = (input.totalOilGrams + naoh + fragranceTotalGrams) * LIQUID_BATCH_FRACTION / (1 - LIQUID_BATCH_FRACTION);

  return {
    ingredientLye,
    fragranceDetails,
    fragranceTotalGrams,
    naohBeforeSuperfat,
    naoh,
    liquid,
    total: naoh + liquid,
    batchTotal: input.totalOilGrams + naoh + liquid + fragranceTotalGrams,
  };
}