import { renderToString } from 'react-dom/server';
import App from './App';

export { pageSeo, indexablePaths, staticPaths, sitemapXml } from './lib/seo';
export { soapmakingLibraryResources } from './data/soapmaking-library-resources';

// Build-time only. No Node server or API is required on Hostinger.
export function render(path: string) {
  return renderToString(<App ssrPath={path} />);
}
