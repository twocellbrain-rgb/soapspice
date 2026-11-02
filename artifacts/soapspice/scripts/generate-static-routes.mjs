import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Hostinger must be able to serve deep links even without SPA rewrite support.
const output = fileURLToPath(new URL('../dist/public/', import.meta.url));
const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url), 'utf8'));
const routes = [
  'ingredients',
  'calculators/cold-process-soap',
  'how-to-start-soapmaking',
  'soapmaking-glossary',
  'my-formulas',
  'batch-sheet',
  'formula-print',
  ...catalog.map(({ id }) => `ingredients/${id}`),
];
for (const route of routes) {
  if (!/^[a-z0-9/-]+$/.test(route) || route.split('/').includes('..')) {
    throw new Error(`Invalid public route: ${route}`);
  }
  const directory = path.join(output, route);
  await mkdir(directory, { recursive: true });
  await copyFile(path.join(output, 'index.html'), path.join(directory, 'index.html'));
}
await copyFile(path.join(output, 'index.html'), path.join(output, '404.html'));
console.log(`Generated ${routes.length} standalone route entry files and a 404 fallback.`);
