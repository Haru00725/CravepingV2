/**
 * Craveping — QR Code Generator
 *
 * Generates ONE clean, colorful QR per café — transparent background.
 * Import into Canva and add your own text/design around it.
 *
 * Usage:
 *   node generate-qr.mjs --cafe=brew-lab
 *   node generate-qr.mjs --cafe=brew-lab --domain=https://cravepingv2.vercel.app
 *   node generate-qr.mjs --cafe=brew-lab --domain=https://cravepingv2.vercel.app --color=#f59e0b
 *
 * Output: ./qr-output/brew-lab.png
 * Resolution: 1200×1200px, transparent background — paste directly into Canva
 */

import QRCode from "qrcode";
import sharp  from "sharp";
import fs     from "fs/promises";
import path   from "path";

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.replace(/^--/, "").split("="))
);

const cafeSlug  = args.cafe;
const domain    = (args.domain ?? "https://cravepingv2.vercel.app").replace(/\/$/, "");
const color     = args.color ?? "#f59e0b";
const outputDir = path.join(".", "qr-output");

if (!cafeSlug) {
  console.error("❌  Missing --cafe argument.\n   Usage: node generate-qr.mjs --cafe=brew-lab");
  process.exit(1);
}

// ── Colour presets you can use with --color= ──────────────────────────────────
// #f59e0b  Amber            (CravePing default)
// #1a1a1a  Charcoal Black   (premium, minimal)
// #e11d48  Deep Rose        (bold, trendy)
// #16a34a  Forest Green     (natural, earthy)
// #2563eb  Ocean Blue       (clean, modern)
// #9333ea  Purple           (luxury, premium)
// #d97706  Dark Amber       (warm, inviting)
// Or pass any hex: --color=#YourBrandColor

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function generateQR() {
  await fs.mkdir(outputDir, { recursive: true });

  // ✅ Correct URL — matches your /{cafe_slug} route
  const url      = `${domain}/${cafeSlug}`;
  const filename = path.join(outputDir, `${cafeSlug}.png`);
  const size     = 1200;

  console.log(`\n🎨  Generating QR for "${cafeSlug}"`);
  console.log(`    URL:    ${url}`);
  console.log(`    Color:  ${color}`);
  console.log(`    Output: ${path.resolve(filename)}`);
  console.log(`    Size:   ${size}×${size}px\n`);

  // 1. Generate QR as SVG — transparent background, colored modules
  const svgString = await QRCode.toString(url, {
    type:                 "svg",
    errorCorrectionLevel: "H",      // Highest — survives logos/overlays in Canva
    margin:               2,
    color: {
      dark:  color,        // QR dots = your brand color
      light: "#00000000",  // Background = fully transparent
    },
  });

  // 2. Convert SVG → high-res PNG via sharp (preserves transparency)
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(size, size, {
      fit:        "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 6 })
    .toBuffer();

  // 3. Save to disk
  await fs.writeFile(filename, pngBuffer);

  // 4. Done
  console.log(`✅  Saved: ${path.resolve(filename)}\n`);
  console.log(`💡  Canva tips:`);
  console.log(`    1. Upload ${cafeSlug}.png to Canva`);
  console.log(`    2. Place it on any background — it's fully transparent`);
  console.log(`    3. Add café name, "Scan to view menu & order" text`);
  console.log(`    4. The QR color matches your brand — no editing needed\n`);
  console.log(`🔗  Scans to: ${url}\n`);
}

generateQR().catch(err => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});