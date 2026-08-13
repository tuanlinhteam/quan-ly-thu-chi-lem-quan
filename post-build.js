import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');

// Create /quanly/index.html and /admin/index.html
// so that clean URLs /quanly and /admin serve the SPA
const routes = ['quanly', 'admin'];

for (const route of routes) {
  const routeDir = join(distDir, route);
  if (!existsSync(routeDir)) {
    mkdirSync(routeDir, { recursive: true });
  }
  writeFileSync(join(routeDir, 'index.html'), indexHtml);
  console.log(`✅ Created dist/${route}/index.html`);
}

console.log('✅ Post-build: clean URL routes ready');
