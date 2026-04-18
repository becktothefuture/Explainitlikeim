import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyThemeTokens } from '../src/theme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'public', 'theme-token-map.json');

const tokenMap = {};

const fakeRoot = {
  style: {
    setProperty(name, value) {
      tokenMap[name] = String(value);
    },
  },
  ownerDocument: {
    querySelector() {
      return null;
    },
  },
};

applyThemeTokens(fakeRoot);

const sorted = Object.fromEntries(
  Object.entries(tokenMap).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(outputPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${Object.keys(sorted).length} theme tokens to ${path.relative(repoRoot, outputPath)}`);
