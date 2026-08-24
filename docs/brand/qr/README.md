# Tsuru QR — `https://tsuru.jcampos.dev`

Generated with the **same `qrcode` library the POS ships** (`qrcode@1.5.4`, the engine
behind `fe/pos-system/src/components/dashboard/QrShareModal.tsx`), so the code on a
business card is produced by the same tool as the one merchants share from the POS
dashboard.

## Files

| File | Use |
|---|---|
| `tsuru-qr-brand.svg` | **Give this to the printer.** Vector, Borgoña `#6B2A22` on Arena `#F4EFE6`. |
| `tsuru-qr-brand-white.svg` | Vector, Borgoña on pure white — for a white card stock. |
| `tsuru-qr-mono.svg` | Vector, pure black on white — safest fallback, one-colour printing. |
| `*-2048.png` | 2048 px raster of each variant (≈300 dpi at 17 cm; far past card size). |
| `*-512.png` | Screen-size preview / slide use. |

## Symbol specs

- Payload: `https://tsuru.jcampos.dev`
- Version **4** → **33 × 33 modules**, plus the 4-module quiet zone = **41 modules across**
- Error correction **H** (30% recoverable) — survives ink spread, a fold, or a scuff
- Colours from `docs/roadmap/tsuru_brand_asset_guide.md` §1

## Printing on the business card

- **Minimum printed size: 21 mm square.** 41 modules × 0.5 mm/module. Below that,
  phone cameras start failing on textured stock.
- **Recommended: 25 mm square.** Comfortable scan at arm's length.
- **Keep the quiet zone.** It is already baked into the files — do not crop the
  white/cream border or place text against the code's edge.
- Dark-on-light only. Never invert (light modules on a dark card) — many scanners
  refuse inverted codes.
- Matte or uncoated stock scans better than high-gloss, which throws camera glare.

## Verification

All raster variants were decoded back with `jsQR` and returned exactly
`https://tsuru.jcampos.dev`. Re-verify after any edit — especially if a designer
recolours or overlays a logo on the code.

## Regenerating

The generator is `docs/brand/qr/generate-qr.mjs`. It resolves `qrcode` from
`fe/pos-system/node_modules`, so run it with the POS deps installed:

```bash
node docs/brand/qr/generate-qr.mjs
```
