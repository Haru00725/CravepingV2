import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-white tracking-widest mb-2">CRAVEPING</h1>
      <p className="text-white/50 text-sm mb-10">Video-first digital menus for modern cafés</p>
      <Link
        href="/brew-lab"
        className="bg-amber-500 text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-amber-400 transition-colors"
      >
        View Demo Menu →
      </Link>
    </main>
  );
}
