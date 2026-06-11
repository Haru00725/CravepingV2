"use client";

import { useState } from "react";

export default function QRGeneratorPage() {
  const [cafeSlug, setCafeSlug] = useState("brew-lab");
  const [tables, setTables] = useState("1,2,3,4,5");
  const [qrList, setQrList] = useState<{ table: string; url: string; qr: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const tableIds = tables.split(",").map((t) => t.trim()).filter(Boolean);

    const results = await Promise.all(
      tableIds.map(async (t) => {
        const res = await fetch(`/api/qr?cafe_slug=${cafeSlug}&table_id=table-${t}`);
        const { url } = await res.json();
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
        return { table: t, url, qr };
      })
    );

    setQrList(results);
    setLoading(false);
  };

  const downloadQR = (qrUrl: string, table: string) => {
    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `table-${table}-qr.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  const downloadAll = () => {
    qrList.forEach(({ table, qr }) => downloadQR(qr, table));
  };

  return (
    <div className="min-h-screen bg-[#f5f2e8] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">QR Generator</h1>
        <p className="text-gray-500 text-sm mb-8">Generate signed QR codes for each table</p>

        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Café Slug
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
              value={cafeSlug}
              onChange={(e) => setCafeSlug(e.target.value)}
              placeholder="brew-lab"
            />
            <p className="text-xs text-gray-400 mt-1">
              Must match exactly what is in your Supabase cafes table
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Table Numbers
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              placeholder="1,2,3,4,5"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma separated — e.g. 1,2,3 or Rooftop-A,Rooftop-B
            </p>
          </div>

          <button
            onClick={generate}
            disabled={loading || !cafeSlug || !tables}
            className="w-full py-3 bg-[#1a1a1a] text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
          >
            {loading ? "Generating…" : "Generate QR Codes"}
          </button>
        </div>

        {qrList.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{qrList.length} QR codes ready</h2>
              <button
                onClick={downloadAll}
                className="text-sm bg-amber-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-amber-400 transition-colors"
              >
                Download All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {qrList.map(({ table, url, qr }) => (
                <div key={table} className="bg-white rounded-3xl p-5 shadow-sm text-center">
                  <img
                    src={qr}
                    alt={`Table ${table}`}
                    className="w-40 h-40 mx-auto mb-3"
                  />
                  <p className="font-bold text-gray-800 mb-0.5">Table {table}</p>
                  <p className="text-[10px] text-gray-400 break-all mb-3 leading-relaxed">
                    {url}
                  </p>
                  <button
                    onClick={() => downloadQR(qr, table)}
                    className="text-xs text-amber-500 font-semibold hover:underline"
                  >
                    Download PNG
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}