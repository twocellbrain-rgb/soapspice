export type FormulaOil = {
  id: string;
  percentage: number;
  weight: number; // grams
};

export type SapRecord = {
  naohSap: number;
};

export const GRAMS_PER_OUNCE = 28.349523125;
// A transparent cold-process starting point, not a recipe-specific optimum.
export const LIQUID_TO_LYE_RATIO = 2;

export type FragranceRow = {
  id: string;
  name: string;
  amount: number;
  unit: 'g' | 'oz' | 'percent';
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
  const liquid = naoh * LIQUID_TO_LYE_RATIO;
  const fragranceDetails = (input.fragrances ?? []).map((row) => ({
    id: row.id,
    name: row.name.trim(),
    weightGrams: fragranceWeightGrams(row, input.totalOilGrams),
  }));
  const fragranceTotalGrams = fragranceDetails.reduce((sum, row) => sum + row.weightGrams, 0);

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