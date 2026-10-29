/**
 * Monta a pasta dist/ com apenas os arquivos que vão para o ar.
 *
 * Uso:  node build.mjs            (avisa pendências, mas gera a pasta)
 *       node build.mjs --strict   (falha se houver pendências)
 *
 * - Copia o site (HTML, CSS, JS, assets, robots, sitemap, .htaccess, _headers).
 * - Deixa de fora originais (imagens/), documentação e arquivos de desenvolvimento.
 * - Lista placeholders [ASSIM] não preenchidos e arquivos referenciados que não existem.
 * A Vercel roda este script no deploy (ver vercel.json).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const STRICT = process.argv.includes('--strict');

const FILES = ['index.html', 'politica-de-privacidade.html', 'robots.txt', 'sitemap.xml', '.htaccess', '_headers'];
const DIRS = ['css', 'js', 'assets'];
const SKIP = /(\.md$|\.DS_Store$|Thumbs\.db$)/;

const PLACEHOLDER = /\[[A-Z][A-Z_ ]{3,}[^\]]*\]/g;
const REFERENCE = /(?:src|href)="(?!https?:|#|mailto:|tel:)([^"]+)"|srcset="([^"]+)"/g;

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

function check(name) {
  const warnings = [];
  const text = stripComments(readFileSync(join(DIST, name), 'utf8'));

  for (const token of [...new Set(text.match(PLACEHOLDER) || [])].sort()) {
    warnings.push(`${name}: placeholder não preenchido ${token}`);
  }

  if (name.endsWith('.html')) {
    for (const [, single, srcset] of text.matchAll(REFERENCE)) {
      const refs = single ? [single] : srcset.split(',').map((part) => part.trim().split(' ')[0]);
      for (const ref of refs) {
        const target = ref.split('?')[0];
        if (!target || /\[/.test(target)) continue; // placeholders já listados acima
        if (!existsSync(join(DIST, target))) warnings.push(`${name}: arquivo não encontrado ${target}`);
      }
    }
  }
  return warnings;
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);

for (const name of FILES) {
  if (existsSync(join(ROOT, name))) cpSync(join(ROOT, name), join(DIST, name));
}
for (const name of DIRS) {
  cpSync(join(ROOT, name), join(DIST, name), { recursive: true, filter: (src) => !SKIP.test(src) });
}

const warnings = FILES.filter((name) => existsSync(join(DIST, name))).flatMap(check);
const files = listFiles(DIST);
const size = files.reduce((total, file) => total + statSync(file).size, 0);
console.log(`dist/ pronta: ${files.length} arquivos, ${Math.round(size / 1024)} KB`);

if (warnings.length) {
  console.log(`\n${warnings.length} pendência(s) antes de publicar:`);
  warnings.forEach((w) => console.log(`  - ${w}`));
  if (STRICT) process.exit(1);
} else {
  console.log('Nenhuma pendência encontrada. Pode publicar o conteúdo de dist/.');
}
