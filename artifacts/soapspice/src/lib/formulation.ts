export type FormulaOil = {
  id: string;
  percentage: number;
  weight: number; // grams
};

export type SapRecord = {
  naohSap: number;
};

export type NaohFormulaInput = {
  oils: FormulaOil[];
  ingredients: Map<string, SapRecord>;
  totalOilGrams: number;
  superfat: number;
  concentration: number;
};

export function validateNaohFormula(input: NaohFormulaInput): string[] {
  const { oils, ingredients, totalOilGrams, superfat, concentration } = input;
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
  if (!Number.isFinite(concentration) || concentration < 25 || concentration > 50) {
    errors.push('Lye concentration must be between 25% and 50%.');
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
  const water = naoh * (100 / input.concentration - 1);

  return {
    ingredientLye,
    naohBeforeSuperfat,
    naoh,
    water,
    total: naoh + water,
    batchTotal: input.totalOilGrams + naoh + water,
  };
}