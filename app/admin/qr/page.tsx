"use client";

import { useState, useRef } from "react";

const THEMES = [
  { name: "CravePing", bg: "#f5f2e8", bar: "#f59e0b", text: "#1a1a1a", pill: "#1a1a1a", pillText: "#f5f2e8", qrFg: "1a1a1a", qrBg: "f5f2e8" },
  { name: "Midnight", bg: "#0f0f0f", bar: "#6366f1", text: "#ffffff", pill: "#6366f1", pillText: "#ffffff", qrFg: "ffffff", qrBg: "0f0f0f" },
  { name: "Forest", bg: "#f0fdf4", bar: "#16a34a", text: "#14532d", pill: "#14532d", pillText: "#f0fdf4", qrFg: "14532d", qrBg: "f0fdf4" },
  { name: "Ocean", bg: "#eff6ff", bar: "#2563eb", text: "#1e3a8a", pill: "#1e3a8a", pillText: "#eff6ff", qrFg: "1e3a8a", qrBg: "eff6ff" },
  { name: "Rose", bg: "#fff1f2", bar: "#e11d48", text: "#881337", pill: "#881337", pillText: "#fff1f2", qrFg: "881337", qrBg: "fff1f2" },
  { name: "Charcoal", bg: "#f8fafc", bar: "#334155", text: "#0f172a", pill: "#0f172a", pillText: "#f8fafc", qrFg: "0f172a", qrBg: "f8fafc" },
  { name: "Mango", bg: "#fffbeb", bar: "#d97706", text: "#92400e", pill: "#92400e", pillText: "#fffbeb", qrFg: "92400e", qrBg: "fffbeb" },
  { name: "Purple", bg: "#faf5ff", bar: "#9333ea", text: "#581c87", pill: "#581c87", pillText: "#faf5ff", qrFg: "581c87", qrBg: "faf5ff" },
];

export default function QRGeneratorPage() {
  const [cafeSlug, setCafeSlug] = useState("brew-lab");
  const [cafeName, setCafeName] = useState("Brew Lab");
  const [vercelUrl, setVercelUrl] = useState("https://your-project.vercel.app");
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customBar, setCustomBar] = useState("");
  const [customBg, setCustomBg] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = {
    ...THEMES[selectedTheme],
    bar: customBar || THEMES[selectedTheme].bar,
    bg: customBg || THEMES[selectedTheme].bg,
  };

  const QR_URL = `${vercelUrl.replace(/\/$/, "")}/${cafeSlug}`;

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    r: number | { tl: number; tr: number; bl: number; br: number }
  ) {
    const radius = typeof r === "number" ? { tl: r, tr: r, bl: r, br: r } : r;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + w - radius.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
    ctx.lineTo(x + w, y + h - radius.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
    ctx.lineTo(x + radius.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  const drawQR = async () => {
    if (!cafeSlug || !cafeName || !vercelUrl) return;
    setLoading(true);
    setGenerated(false);

    const qrFg = (customBar || theme.bar).replace("#", "");
    const qrBg = (customBg || theme.bg).replace("#", "");
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=${qrFg}&bgcolor=${qrBg}&data=${encodeURIComponent(QR_URL)}&margin=0&ecc=H`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrApiUrl;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const W = 500;
      const H = 640;
      const ctx = canvas.getContext("2d")!;
      canvas.width = W;
      canvas.height = H;

      // ── Background card ───────────────────────────────────────────────
      ctx.fillStyle = theme.bg;
      roundRect(ctx, 0, 0, W, H, 32);
      ctx.fill();

      // ── Top bar ───────────────────────────────────────────────────────
      ctx.fillStyle = theme.bar;
      roundRect(ctx, 0, 0, W, 96, { tl: 32, tr: 32, bl: 0, br: 0 });
      ctx.fill();

      // ── CRAVEPING title ───────────────────────────────────────────────
      ctx.fillStyle = theme.bg;
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CRAVEPING", W / 2, 44);

      // ── Café name ─────────────────────────────────────────────────────
      ctx.fillStyle = theme.bg;
      ctx.globalAlpha = 0.85;
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(cafeName.toUpperCase(), W / 2, 72);
      ctx.globalAlpha = 1;

      // ── White QR card ─────────────────────────────────────────────────
      const qrSize = 340;
      const qrX = (W - qrSize) / 2;
      const qrY = 118;

      ctx.fillStyle = theme.bg;
      roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 28);
      ctx.fill();

      // subtle shadow
      ctx.shadowColor = "rgba(0,0,0,0.08)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 24);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── QR image ──────────────────────────────────────────────────────
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // ── Colored corner accents ────────────────────────────────────────
      const aS = 30;
      const aR = 8;
      ctx.fillStyle = theme.bar;
      // top-left
      roundRect(ctx, qrX - 6, qrY - 6, aS, aS, aR); ctx.fill();
      // top-right
      roundRect(ctx, qrX + qrSize - aS + 6, qrY - 6, aS, aS, aR); ctx.fill();
      // bottom-left
      roundRect(ctx, qrX - 6, qrY + qrSize - aS + 6, aS, aS, aR); ctx.fill();
      // bottom-right
      roundRect(ctx, qrX + qrSize - aS + 6, qrY + qrSize - aS + 6, aS, aS, aR); ctx.fill();

      // ── Bottom text ───────────────────────────────────────────────────
      ctx.fillStyle = theme.text;
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan to view menu & order", W / 2, 516);

      ctx.fillStyle = theme.bar;
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("No app needed  ·  Just scan", W / 2, 541);

      // ── URL pill ──────────────────────────────────────────────────────
      ctx.fillStyle = theme.pill;
      roundRect(ctx, 50, 562, W - 100, 44, 22);
      ctx.fill();

      ctx.fillStyle = theme.pillText;
      ctx.font = "12px monospace";
      const shortUrl = QR_URL.replace("https://", "");
      ctx.fillText(shortUrl, W / 2, 589);

      setGenerated(true);
      setLoading(false);
    };

    img.onerror = () => setLoading(false);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${cafeSlug}-qr.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-5 flex flex-col items-center">
      <div className="w-full max-w-lg pt-10">

        {/* Header */}
        <h1 className="text-4xl font-black text-white text-center tracking-widest mb-1">
          CRAVEPING
        </h1>
        <p className="text-amber-500 text-sm text-center font-semibold tracking-widest mb-8">
          QR GENERATOR
        </p>

        {/* Form card */}
        <div className="bg-[#f5f2e8] rounded-3xl p-6 mb-5 space-y-4">

          {/* Vercel URL */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">
              Vercel URL
            </label>
            <input
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors font-mono"
              value={vercelUrl}
              onChange={(e) => { setVercelUrl(e.target.value); setGenerated(false); }}
              placeholder="https://your-project.vercel.app"
            />
          </div>

          {/* Two columns: slug + name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                Café Slug
              </label>
              <input
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-amber-400 transition-colors font-mono"
                value={cafeSlug}
                onChange={(e) => { setCafeSlug(e.target.value); setGenerated(false); }}
                placeholder="brew-lab"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">
                Display Name
              </label>
              <input
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
                value={cafeName}
                onChange={(e) => { setCafeName(e.target.value); setGenerated(false); }}
                placeholder="Brew Lab"
              />
            </div>
          </div>

          {/* URL preview */}
          <div className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">URL</span>
            <span className="text-xs font-mono text-gray-600 truncate">{QR_URL}</span>
          </div>
        </div>

        {/* Theme picker */}
        <div className="bg-[#f5f2e8] rounded-3xl p-6 mb-5">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-3">
            Theme
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => { setSelectedTheme(i); setCustomBar(""); setCustomBg(""); setGenerated(false); }}
                className={`rounded-2xl p-2.5 text-center transition-all border-2 ${
                  selectedTheme === i && !customBar && !customBg
                    ? "border-gray-800 scale-105 shadow-md"
                    : "border-transparent"
                }`}
                style={{ background: t.bg }}
              >
                <div
                  className="w-full h-5 rounded-lg mb-1.5"
                  style={{ background: t.bar }}
                />
                <span className="text-[10px] font-bold" style={{ color: t.text }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>

          {/* Custom colors */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
              Custom Colors
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">
                  Accent / Bar
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                  <input
                    type="color"
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    value={customBar || theme.bar}
                    onChange={(e) => { setCustomBar(e.target.value); setGenerated(false); }}
                  />
                  <span className="text-xs font-mono text-gray-600">
                    {customBar || theme.bar}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">
                  Background
                </label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
                  <input
                    type="color"
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    value={customBg || theme.bg}
                    onChange={(e) => { setCustomBg(e.target.value); setGenerated(false); }}
                  />
                  <span className="text-xs font-mono text-gray-600">
                    {customBg || theme.bg}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={drawQR}
          disabled={!cafeSlug || !cafeName || !vercelUrl || loading}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white font-black text-base rounded-2xl disabled:opacity-40 transition-all mb-5 tracking-wide"
        >
          {loading ? "Generating…" : "Generate QR Code"}
        </button>

        {/* Canvas preview */}
        <div className={`transition-all duration-300 ${generated ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          <div className="bg-[#2a2a2a] rounded-3xl p-4 mb-4 flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-2xl"
              style={{ width: "100%", maxWidth: 340, height: "auto" }}
            />
          </div>
          <button
            onClick={download}
            className="w-full py-4 bg-white hover:bg-gray-100 active:scale-[0.98] text-[#1a1a1a] font-black text-base rounded-2xl transition-all mb-10"
          >
            Download PNG
          </button>
        </div>

      </div>
    </div>
  );
}