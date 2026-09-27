import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateNaohFormula, combinedScentStrength, fragranceIfraScreen, fragranceScentGuide, fragranceWeightGrams, GRAMS_PER_OUNCE, LIQUID_BATCH_FRACTION, oilWeightTotal, percentagesFromWeights, validateNaohFormula, type NaohFormulaInput } from './formulation.ts';
import { BRAMBLE_BERRY_FRAGRANCES, chooseSupplierFragrance, renameFragrance, selectedSupplierFragrance } from './supplier-fragrances.ts';

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

test('single-oil NaOH uses 100% purity and liquid is 22% of the complete batch', () => {
  const result = calculateNaohFormula(oneOil());
  near(result.naohBeforeSuperfat, 135);
  near(result.naoh, 128.25);
  near(result.liquid, (1000 + 128.25) * LIQUID_BATCH_FRACTION / (1 - LIQUID_BATCH_FRACTION));
  near(result.batchTotal, 1000 + result.naoh + result.liquid);
  near(result.liquid / result.batchTotal, LIQUID_BATCH_FRACTION);
});

test('oil amounts define the total weight and changing a weight updates the derived formula', () => {
  const oils = percentagesFromWeights([
    { id: 'olive', weight: 500, percentage: 0 },
    { id: 'coconut', weight: 300, percentage: 0 },
  ]);
  near(oilWeightTotal(oils), 800);
  near(oils[0].percentage, 62.5);
  const first = calculateNaohFormula({ oils, ingredients, totalOilGrams: oilWeightTotal(oils), superfat: 5 });
  const changed = percentagesFromWeights(oils.map(oil => oil.id === 'coconut' ? { ...oil, weight: 400 } : oil));
  near(oilWeightTotal(changed), 900);
  near(changed.reduce((sum, oil) => sum + oil.percentage, 0), 100);
  const second = calculateNaohFormula({ oils: changed, ingredients, totalOilGrams: oilWeightTotal(changed), superfat: 5 });
  near(second.naoh - first.naoh, 100 * 0.183 * 0.95);
  assert.ok(second.liquid > first.liquid);
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

test('fragrance amounts in grams, ounces, and percent contribute to batch and liquid estimate but not NaOH', () => {
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
  near(scented.liquid - base.liquid, scented.fragranceTotalGrams * LIQUID_BATCH_FRACTION / (1 - LIQUID_BATCH_FRACTION));
  near(scented.batchTotal, base.batchTotal + scented.fragranceTotalGrams + (scented.liquid - base.liquid));
  near(scented.liquid / scented.batchTotal, LIQUID_BATCH_FRACTION);
});

test('fragrance names, units and positive amounts are required', () => {
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: '', amount: 2, unit: 'percent' }] })).some((error) => error.includes('Name')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: 'Rose', amount: -1, unit: 'oz' }] })).some((error) => error.includes('positive')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ id: 'a', name: 'Rose', amount: 150, unit: 'percent' }] })).some((error) => error.includes('more than')));
});

test('scent levels scale from unscented complete-batch weight and do not change with entered scent amount', () => {
  const base = calculateNaohFormula(oneOil());
  const first = fragranceScentGuide({ id: 'rose', name: 'Rose', amount: 25, unit: 'g', ifraMaxPercent: 7 }, 1000, base.naoh);
  const changed = fragranceScentGuide({ id: 'rose', name: 'Rose', amount: 80, unit: 'g', ifraMaxPercent: 7 }, 1000, base.naoh);
  near(first.unscentedBatchGrams, (1000 + base.naoh) / (1 - LIQUID_BATCH_FRACTION));
  near(first.tiers[0].grams, first.unscentedBatchGrams / 16);
  near(first.tiers[1].grams, first.unscentedBatchGrams * 0.7 / 16);
  near(first.tiers[2].grams, first.unscentedBatchGrams * 0.35 / 16);
  near(first.maximumGrams!, 70);
  assert.equal(first.exceeds, false);
  assert.equal(changed.exceeds, true);
  assert.equal(first.tiers[0].exceeds, true);
  assert.equal(first.tiers[1].exceeds, false);
  near(changed.tiers[1].grams, first.tiers[1].grams);
});

test('missing, zero, and invalid IFRA rates cannot be mistaken for a safe maximum', () => {
  const fragrance = { id: 'rose', name: 'Rose', amount: 10, unit: 'g' as const };
  assert.equal(fragranceIfraScreen(fragrance, 1000).maximumGrams, null);
  assert.equal(fragranceIfraScreen({ ...fragrance, ifraMaxPercent: 0 }, 1000).exceeds, true);
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ ...fragrance, ifraMaxPercent: -1 }] })).some(e => e.includes('IFRA maximum')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ ...fragrance, ifraMaxPercent: 101 }] })).some(e => e.includes('IFRA maximum')));
  assert.ok(validateNaohFormula(oneOil({ fragrances: [{ ...fragrance, ifraSourceUrl: 'javascript:alert(1)' }] })).some(e => e.includes('IFRA source')));
  assert.deepEqual(validateNaohFormula(oneOil({ fragrances: [{ ...fragrance, ifraMaxPercent: 5, ifraSourceUrl: 'https://supplier.example/ifra.pdf' }] })), []);
});

test('two fragrances at the medium guide each add up to above strong, not medium', () => {
  const base = calculateNaohFormula(oneOil());
  const mediumGrams = fragranceScentGuide({ id: 'a', name: 'A', amount: 1, unit: 'g' }, 1000, base.naoh).tiers[1].grams;
  const combined = combinedScentStrength([
    { id: 'a', name: 'A', amount: mediumGrams, unit: 'g' },
    { id: 'b', name: 'B', amount: mediumGrams, unit: 'g' },
  ], 1000, base.naoh);
  near(combined.ouncesPerPound, 1.4);
  assert.equal(combined.strengthLabel, 'Above strong');
  const one = combinedScentStrength([{ id: 'a', name: 'A', amount: mediumGrams, unit: 'g' }], 1000, base.naoh);
  assert.equal(one.strengthLabel, 'At medium');
});

test('the documented supplier selection follows exact product identity, not a similar scent name', () => {
  const empty = { id: 'first', name: '', amount: 4, unit: 'percent' as const };
  assert.equal(selectedSupplierFragrance({ ...empty, name: 'Lavender Fragrance Oil' }), undefined);
  const selected = chooseSupplierFragrance(empty, 'V000266');
  assert.equal(selected.name, 'Lavender and Cedar Fragrance Oil');
  assert.equal(selected.ifraMaxPercent, 6.08);
  assert.equal(selectedSupplierFragrance(selected)?.sku, 'V000266');
  assert.deepEqual(validateNaohFormula(oneOil({ fragrances: [selected] })), []);
  const renamed = renameFragrance(selected, 'Lavender from another supplier');
  assert.equal(renamed.ifraMaxPercent, undefined);
  assert.equal(renamed.ifraSourceUrl, undefined);
  assert.equal(selectedSupplierFragrance(renamed), undefined);
  const manual = chooseSupplierFragrance(selected, '');
  assert.equal(manual.name, selected.name);
  assert.equal(manual.ifraMaxPercent, undefined);
  assert.equal(manual.ifraSourceUrl, undefined);
  assert.equal(selectedSupplierFragrance({ ...selected, ifraMaxPercent: 7 }), undefined);
});

test('all catalog entries have distinct SKUs and source links that identify the matching statement', () => {
  assert.equal(new Set(BRAMBLE_BERRY_FRAGRANCES.map((p) => p.sku)).size, BRAMBLE_BERRY_FRAGRANCES.length);
  for (const product of BRAMBLE_BERRY_FRAGRANCES) {
    assert.ok(product.ifraMaxPercent >= 0 && product.ifraMaxPercent <= 100);
    assert.match(product.productUrl, new RegExp(`/${product.sku}\\.html$`));
    assert.ok(product.ifraUrl.includes(`ifra51_eu_prop65_${product.sku}_`));
    assert.ok(product.ifraUrl.length <= 500);
    assert.match(product.assessedOn, /^\d{4}-\d{2}-\d{2}$/);
  }
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