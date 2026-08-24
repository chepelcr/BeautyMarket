// Generates the tsuru.jcampos.dev QR in print + digital variants using the very
// same `qrcode` lib the POS ships (fe/pos-system QrShareModal).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '../../..');
// Resolve the POS's own qrcode install so the card QR and the POS's share-modal QR
// are produced by byte-identical code.
const require = createRequire(import.meta.url);
const QRCode = require(resolve(REPO, 'fe/pos-system/node_modules/qrcode'));
import { writeFile } from 'node:fs/promises';

const URL_TARGET = 'https://tsuru.jcampos.dev';
const OUT = __dirname;

// Brand palette (docs/roadmap/tsuru_brand_asset_guide.md §1)
const BORGONA = '#6B2A22';
const ARENA   = '#F4EFE6';

const variants = [
  { name: 'tsuru-qr-brand',      dark: BORGONA, light: ARENA,     ec: 'H' },
  { name: 'tsuru-qr-mono',       dark: '#000000', light: '#FFFFFF', ec: 'H' },
  { name: 'tsuru-qr-brand-white', dark: BORGONA, light: '#FFFFFF', ec: 'H' },
];

for (const v of variants) {
  const color = { dark: v.dark, light: v.light };

  // Vector — the one to hand the printer.
  const svg = await QRCode.toString(URL_TARGET, {
    type: 'svg', errorCorrectionLevel: v.ec, margin: 4, color,
  });
  await writeFile(`${OUT}/${v.name}.svg`, svg);

  // Raster — 2048px ≈ 300dpi well past any business-card size.
  await QRCode.toFile(`${OUT}/${v.name}-2048.png`, URL_TARGET, {
    type: 'png', errorCorrectionLevel: v.ec, margin: 4, width: 2048, color,
  });

  // Screen-size preview.
  await QRCode.toFile(`${OUT}/${v.name}-512.png`, URL_TARGET, {
    type: 'png', errorCorrectionLevel: v.ec, margin: 4, width: 512, color,
  });
  console.log(`✔ ${v.name} (EC ${v.ec})`);
}

// Report the symbol version / module count so we know how small it can print.
const qr = QRCode.create(URL_TARGET, { errorCorrectionLevel: 'H' });
console.log(`\nURL: ${URL_TARGET}`);
console.log(`QR version: ${qr.version}  modules: ${qr.modules.size}x${qr.modules.size}`);
