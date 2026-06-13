import QRCode from "qrcode";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, "").split("=")));
const cafeSlug = args.cafe;
const domain = (args.domain ?? "https://cravepingv2.vercel.app").replace(/\/$/, "");
const color = args.color ?? "#f59e0b";
const outputDir = path.join(".", "qr-output");

if (!cafeSlug) {
  console.error("Missing --cafe argument. Usage: node generate-qr.mjs --cafe=brew-lab");
  process.exit(1);
}

async function generateQR() {
  await fs.mkdir(outputDir, { recursive: true });

  const url = `${domain}/${cafeSlug}`;
  const filename = path.join(outputDir, `${cafeSlug}.png`);
  const size = 1200;

  console.log(`Generating QR for "${cafeSlug}"`);
  console.log(`URL: ${url}`);
  console.log(`Color: ${color}`);

  const svgString = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: color,
      light: "#00000000",
    },
  });

  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 6 })
    .toBuffer();

  await fs.writeFile(filename, pngBuffer);

  console.log(`Done! Saved to: ${path.resolve(filename)}`);
  console.log(`Scans to: ${url}`);
}

generateQR().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
