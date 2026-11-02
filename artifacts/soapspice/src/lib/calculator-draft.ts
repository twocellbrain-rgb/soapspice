// Ephemeral calculator draft kept in sessionStorage so the calculator and the
// results route share full input state across same-tab navigation and refresh.
// Reads are never destructive, so React state initializers can run repeatedly.

export const CALCULATOR_DRAFT_KEY = 'soapspice-calculator-draft';
export const CALCULATOR_PATH = '/calculators/cold-process-soap';
export const RESULTS_PATH = '/calculators/cold-process-soap/results';

export type CalculatorDraft = {
  version: 1;
  superfat: number;
  oilInputUnit: 'percent' | 'g' | 'oz';
  percentBaseGrams: number;
  liquidType: 'distilled-water' | 'goat-milk' | 'cow-milk' | 'other';
  customLiquid: string;
  legacyLiquidNotice: string;
  oils: unknown[];
  fragrances: unknown[];
  scentStrength: string;
  validated: boolean;
  validatedFingerprint: string;
  recipeName: string;
  activeRecipeId: string | null;
  openedSnapshot: unknown;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
function oil(value: unknown): boolean {
  return record(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
    finite(value.weight) && finite(value.percentage);
}
function fragrance(value: unknown): boolean {
  return record(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
    finite(value.amount) && ['g', 'oz', 'percent'].includes(String(value.unit)) &&
    (value.ifraMaxPercent === undefined || finite(value.ifraMaxPercent)) &&
    (value.ifraSourceUrl === undefined || typeof value.ifraSourceUrl === 'string');
}

export function readCalculatorDraft(): CalculatorDraft | null {
  try {
    const raw = sessionStorage.getItem(CALCULATOR_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const draft = parsed as Partial<CalculatorDraft>;
    if (draft.version !== 1 || !Array.isArray(draft.oils) || !Array.isArray(draft.fragrances)) return null;
    if (!draft.oils.every(oil) || !draft.fragrances.every(fragrance) ||
      !finite(draft.superfat) || !finite(draft.percentBaseGrams) ||
      !['percent', 'g', 'oz'].includes(String(draft.oilInputUnit)) ||
      !['distilled-water', 'goat-milk', 'cow-milk', 'other'].includes(String(draft.liquidType)) ||
      !['light', 'medium', 'strong'].includes(String(draft.scentStrength)) ||
      typeof draft.validated !== 'boolean' || typeof draft.validatedFingerprint !== 'string' ||
      typeof draft.recipeName !== 'string' || typeof draft.customLiquid !== 'string' ||
      typeof draft.legacyLiquidNotice !== 'string' ||
      !(draft.activeRecipeId === null || typeof draft.activeRecipeId === 'string')) return null;
    if (draft.openedSnapshot !== null && (!record(draft.openedSnapshot) ||
      !Array.isArray(draft.openedSnapshot.oils) || !draft.openedSnapshot.oils.every(oil))) return null;
    return draft as CalculatorDraft;
  } catch {
    return null;
  }
}

export function writeCalculatorDraft(draft: CalculatorDraft): boolean {
  try {
    sessionStorage.setItem(CALCULATOR_DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}
