import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateNaohFormula, fragranceWeightGrams, GRAMS_PER_OUNCE, validateNaohFormula, type NaohFormulaInput } from './formulation.ts';

const ingredients = new Map([
  ['olive', { naohSap: 0.135 }],
  ['coconut', { naohSap: 0.183 }],
  ['shea', { naohSap: 0.128 }],
]);

function oneOil(overrides: Partial<NaohFormulaInput> = {}): NaohFormulaInput {
  return {
    oils: [{ id: 'olive', weight: 1000, percentage: 100 }],
    ingredients,
    totalOilGrams: 1000,
    superfat: 5,
    ...overrides,
  };
}

function near(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should equal ${expected}`);
}

test('single-oil NaOH and liquid use source SAP, superfat, and the stated 2:1 baseline', () => {
  const result = calculateNaohFormula(oneOil());
  near(result.naohBeforeSuperfat, 135);
  near(result.naoh, 128.25);
  near(result.liquid, 128.25 * 2);
  near(result.batchTotal, 1000 + result.naoh + result.liquid);
});

test('multi-oil formula sums per-oil SAP contributions before the lye discount', () => {
  const result = calculateNaohFormula({
    oils: [
      { id: 'olive', weight: 500, percentage: 50 },
      { id: 'coconut', weight: 300, percentage: 30 },
      { id: 'shea', weight: 200, percentage: 20 },
    ],
    ingredients,
    totalOilGrams: 1000,
    superfat: 5,
  });
  near(result.naohBeforeSuperfat, 500 * 0.135 + 300 * 0.183 + 200 * 0.128);
  near(result.naoh, 140.6);
  assert.equal(result.ingredientLye.length, 3);
});

test('superfat changes NaOH and recommended liquid, not theoretical SAP', () => {
  const withoutDiscount = calculateNaohFormula(oneOil({ superfat: 0 }));
  const withDiscount = calculateNaohFormula(oneOil({ superfat: 10 }));
  near(withoutDiscount.naohBeforeSuperfat, withDiscount.naohBeforeSuperfat);
  near(withoutDiscount.naoh, 135);
  near(withDiscount.naoh, 121.5);
  assert.ok(withDiscount.liquid < withoutDiscount.liquid);
});

test('fragrance amounts in grams, ounces, and percent contribute to batch mass but never to NaOH or liquid', () => {
  const base = calculateNaohFormula(oneOil());
  const fragrances = [
    { id: 'a', name: 'Lavender', amount: 10, unit: 'g' as const },
    { id: 'b', name: 'Cedar', amount: 1, unit: 'oz' as const },
    { id: 'c', name: 'Citrus', amount: 1.5, unit: 'percent' as const },
  ];
  const scented = calculateNaohFormula(oneOil({ fragrances }));
  near(fragranceWeightGrams(fragrances[1], 1000), GRAMS_PER_OUNCE);
  near(scented.fragranceTotalGrams, 10 + GRAMS_PER_OUNCE + 15);
  near(scented.naoh, base.naoh);
  near(scented.liquid, base.liquid);
  near(scented.batchTotal, base.batchTotal + scented.fragranceTotalGrams);
});

test('fragrance names, units and positive amounts are required', () => {
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: '', amount: 2, unit: 'percent' }] })).some((error) => error.includes('Name')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: 'Rose', amount: -1, unit: 'oz' }] })).some((error) => error.includes('positive')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: 'Rose', amount: 150, unit: 'percent' }] })).some((error) => error.includes('more than')));
});

test('scaling from 1000 g to 2500 g preserves the formulation ratios', () => {
  const original = calculateNaohFormula(oneOil());
  const scaled = calculateNaohFormula(oneOil({
    oils: [{ id: 'olive', weight: 2500, percentage: 100 }],
    totalOilGrams: 2500,
  }));
  near(scaled.naoh, original.naoh * 2.5);
  near(scaled.liquid, original.liquid * 2.5);
});

test('rejects invalid percentages, missing SAP, and mismatched oil weights', () => {
  assert.ok(validateNaohFormula(oneOil({
    oils: [{ id: 'olive', weight: 990, percentage: 99 }],
  })).some((error) => error.includes('100%')));
  assert.ok(validateNaohFormula(oneOil({
    oils: [{ id: 'unlisted', weight: 1000, percentage: 100 }],
  })).some((error) => error.includes('SAP')));
  assert.ok(validateNaohFormula(oneOil({
    oils: [{ id: 'olive', weight: 900, percentage: 100 }],
  })).some((error) => error.includes('add up')));
  assert.throws(() => calculateNaohFormula(oneOil({ totalOilGrams: -1000 })));
});

test('small and large batches remain finite and scale proportionally', () => {
  const tiny = calculateNaohFormula(oneOil({
    oils: [{ id: 'olive', weight: 1, percentage: 100 }],
    totalOilGrams: 1,
  }));
  const large = calculateNaohFormula(oneOil({
    oils: [{ id: 'olive', weight: 100000, percentage: 100 }],
    totalOilGrams: 100000,
  }));
  assert.ok(Number.isFinite(tiny.naoh) && Number.isFinite(large.naoh));
  near(large.naoh / tiny.naoh, 100000);
});