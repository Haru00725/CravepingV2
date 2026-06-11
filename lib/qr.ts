// lib/qr.ts
// Cryptographically signed QR codes — expires daily, prevents table spoofing.

import { createHmac } from "crypto";

const SECRET = process.env.QR_SECRET!;

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function sign(cafe_slug: string, table_id: string, date: string): string {
  return createHmac("sha256", SECRET)
    .update(`${cafe_slug}:${table_id}:${date}`)
    .digest("hex");
}

/** Generate a signed QR URL for a table */
export function generateQRUrl(cafe_slug: string, table_id: string): string {
  const date = today();
  const sig = sign(cafe_slug, table_id, date);
  const base = process.env.NEXT_PUBLIC_APP_URL;
  return `${base}/${cafe_slug}/${table_id}?date=${date}&sig=${sig}`;
}

/** Verify a QR URL's signature. Returns true if valid. */
export function verifyQR(
  cafe_slug: string,
  table_id: string,
  date: string,
  sig: string
): boolean {
  if (!cafe_slug || !table_id || !date || !sig) return false;

  // Allow today and yesterday (grace period for midnight orders)
  const todayStr = today();
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const validDates = [todayStr, yesterdayStr];
  return validDates.some((d) => {
    if (d !== date) return false;
    const expected = sign(cafe_slug, table_id, date);
    return expected === sig;
  });
}
