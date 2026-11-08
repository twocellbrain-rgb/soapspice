import { renderToString } from 'react-dom/server';
import App from './App';
import FormulaResults from './components/FormulaResults';
import type { PrintableFormula } from './lib/formula-sheet';

export { pageSeo, indexablePaths, staticPaths, sitemapXml } from './lib/seo';
export { soapmakingLibraryResources } from './data/soapmaking-library-resources';
export { firstBatchSupplies } from './data/first-batch-supplies';
export { buildFirstBatchShoppingList } from './lib/first-batch-shopping';
export { loadPrintableFormula, savePrintableFormula } from './lib/formula-sheet';
export { createStarterFormula } from './lib/starter-batch';

// Build-time only. No Node server or API is required on Hostinger.
export function render(path: string) {
  return renderToString(<App ssrPath={path} />);
}

export function renderFormulaResults(formula: PrintableFormula) {
  return renderToString(<FormulaResults {...formula} />);
}
