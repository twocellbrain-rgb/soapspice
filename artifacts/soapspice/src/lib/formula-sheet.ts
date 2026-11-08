import type { FormulaCalculation, OilResultRow } from '@/components/FormulaResults';
import type { FragranceRow } from '@/lib/formulation';

export type PrintableFormula = {
  name: string;
  oils: OilResultRow[];
  oilInputUnit: 'percent' | 'g' | 'oz';
  fragrances: FragranceRow[];
  result: FormulaCalculation;
  liquidName: string;
  superfat: number;
  generatedAt: string;
};

type FormulaSheetInput = Omit<PrintableFormula, 'generatedAt'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPrintableFormula(value: unknown): value is PrintableFormula {
  if (!isRecord(value) || !isRecord(value.result)) return false;
  const result = value.result;
  const requiredNumbers = [
    'naoh',
    'naohBeforeSuperfat',
    'liquid',
    'total',
    'fragranceTotalGrams',
    'batchTotal',
  ];

  return typeof value.name === 'string' &&
    Array.isArray(value.oils) &&
    value.oils.every((oil) =>
      isRecord(oil) &&
      typeof oil.id === 'string' &&
      typeof oil.name === 'string' &&
      finite(oil.percentage) &&
      finite(oil.weight) &&
      finite(oil.sap),
    ) &&
    ['percent', 'g', 'oz'].includes(String(value.oilInputUnit)) &&
    Array.isArray(value.fragrances) &&
    value.fragrances.every((fragrance) =>
      isRecord(fragrance) &&
      typeof fragrance.id === 'string' &&
      typeof fragrance.name === 'string' &&
      finite(fragrance.amount) &&
      ['g', 'oz', 'percent'].includes(String(fragrance.unit)),
    ) &&
    Array.isArray(result.ingredientLye) &&
    result.ingredientLye.every((line) =>
      isRecord(line) && typeof line.id === 'string' && finite(line.theoreticalNaoh),
    ) &&
    requiredNumbers.every((key) => finite(result[key])) &&
    typeof value.liquidName === 'string' &&
    finite(value.superfat) &&
    typeof value.generatedAt === 'string';
}

export function loadPrintableFormula(): PrintableFormula | null {
  try {
    if (typeof window === 'undefined') return null;
    const draftId = new URLSearchParams(window.location.search).get('draft');
    if (!draftId || !/^[a-f0-9-]{36}$/i.test(draftId)) return null;
    const storageKey = `soapspice-print:${draftId}`;
    const raw = sessionStorage.getItem(storageKey) ?? localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPrintableFormula(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePrintableFormula(formula: FormulaSheetInput): string | null {
  try {
    const draftId = crypto.randomUUID();
    const storageKey = `soapspice-print:${draftId}`;
    const data: PrintableFormula = { ...formula, generatedAt: new Date().toISOString() };
    sessionStorage.setItem(storageKey, JSON.stringify(data));
    return draftId;
  } catch {
    return null;
  }
}
