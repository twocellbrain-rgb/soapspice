import assert from 'node:assert/strict';
import test from 'node:test';
import { readCalculatorDraft, writeCalculatorDraft, type CalculatorDraft } from './calculator-draft.ts';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  },
});
const valid: CalculatorDraft = {
  version: 1, superfat: 5, oilInputUnit: 'g', percentBaseGrams: 1000,
  liquidType: 'distilled-water', customLiquid: '', legacyLiquidNotice: '',
  oils: [{ id: 'olive-oil', name: 'Olive Oil', weight: 1000, percentage: 100 }],
  fragrances: [], scentStrength: 'medium', validated: true, validatedFingerprint: 'fingerprint',
  recipeName: 'Draft test', activeRecipeId: null, openedSnapshot: null,
};

test('results draft survives repeated reads and preserves inputs and validation marker', () => {
  assert.equal(writeCalculatorDraft(valid), true);
  assert.deepEqual(readCalculatorDraft(), valid);
  assert.deepEqual(readCalculatorDraft(), valid);
});

test('malformed draft rows and incomplete draft state recover without crashing', () => {
  for (const bad of [
    { ...valid, oils: [null] },
    { ...valid, fragrances: [{ name: 'No amount' }] },
    { ...valid, liquidType: 'invalid' },
    { ...valid, openedSnapshot: {} },
    { ...valid, recipeName: null },
    { version: 1, oils: [], fragrances: [], superfat: 5, oilInputUnit: 'g' },
  ]) {
    writeCalculatorDraft(bad as CalculatorDraft);
    assert.equal(readCalculatorDraft(), null);
  }
});

test('unparseable browser storage recovers with no draft', () => {
  values.set('soapspice-calculator-draft', '{invalid');
  assert.equal(readCalculatorDraft(), null);
});

test('unavailable browser storage is reported to the navigation caller', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')!;
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true, get() { throw new Error('Storage blocked'); },
  });
  try {
    assert.equal(writeCalculatorDraft(valid), false);
    assert.equal(readCalculatorDraft(), null);
  } finally {
    Object.defineProperty(globalThis, 'sessionStorage', original);
  }
});
