import catalog from '@/data/ingredient-catalog.json';
import { calculateNaohFormula } from '@/lib/formulation';
import type { PrintableFormula } from '@/lib/formula-sheet';

// An explicitly labelled calculator example, not a tested production recipe.
export function createStarterFormula(): PrintableFormula {
  const oils = [
    { id: 'olive-oil', percentage: 70, weight: 350 },
    { id: 'coconut-oil-76', percentage: 20, weight: 100 },
    { id: 'shea-butter', percentage: 10, weight: 50 },
  ].map((oil) => {
    const ingredient = catalog.find((entry) => entry.id === oil.id);
    if (!ingredient) throw new Error(`Starter ingredient is missing: ${oil.id}`);
    return { ...oil, name: ingredient.name, sap: ingredient.naohSap };
  });
  return {
    name: 'Unscented starter example — 500 g oils',
    oils,
    oilInputUnit: 'g',
    fragrances: [],
    result: calculateNaohFormula({
      oils,
      ingredients: new Map(catalog.map((ingredient) => [ingredient.id, ingredient])),
      totalOilGrams: 500,
      superfat: 5,
      fragrances: [],
    }),
    liquidName: 'Distilled water',
    superfat: 5,
    generatedAt: new Date().toISOString(),
  };
}
