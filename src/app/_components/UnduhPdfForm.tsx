"use client";

import { useState } from "react";

type Santri = { id: string; nama: string };

function todayISO() { return new Date().toISOString().slice(0, 10); }
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function bulanAwal(bulan: string) { return `${bulan}-01`; }
function bulanAkhir(bulan: string) {
  const [y, m] = bulan.split("-").map(Number);
  return `${bulan}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
}

export default function UnduhPdfForm({ daftarSantri }: { daftarSantri: Santri[] }) {
  const [jenis, setJenis] = useState<"semua" | "kas" | "santri">("semua");
  const [mode, setMode] = useState<"bulan" | "rentang">("bulan");
  const [bulan, setBulan] = useState(thisMonth());
  const [dari, setDari] = useState(todayISO());
  const [sampai, setSampai] = useState(todayISO());
  const [santriId, setSantriId] = useState(daftarSantri[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  function handleUnduh() {
    const d = mode === "bulan" ? bulanAwal(bulan) : dari;
    const s = mode === "bulan" ? bulanAkhir(bulan) : sampai;
    if (d > s) { alert("Tanggal 'dari' tidak boleh setelah 'sampai'."); return; }
    if (jenis === "santri" && !santriId) { alert("Pilih santri terlebih dahulu."); return; }

    setLoading(true);
    let url = `/api/pdf?dari=${d}&sampai=${s}&jenis=${jenis}`;
    if (jenis === "santri") url += `&santriId=${santriId}`;

    const a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setLoading(false), 3000);
  }

  return (
    <div className="glass rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Unduh Laporan PDF</h2>
        <div className="flex rounded-xl overflow-hidden border border-white/20 text-xs">
          <button
            onClick={() => setMode("bulan")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "bulan" ? "bg-blue-600 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"}`}
          >
            Per Bulan
          </button>
          <button
            onClick={() => setMode("rentang")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "rentang" ? "bg-blue-600 text-white" : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"}`}
          >
            Rentang Tanggal
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-xs flex-wrap">
        {(["semua", "kas", "santri"] as const).map((j) => (
          <button
            key={j}
            onClick={() => setJenis(j)}
            className={`rounded-full px-3 py-1.5 font-medium border transition-all ${
              jenis === j
                ? "bg-gradient-to-r from-blue-600 to-red-600 text-white border-transparent shadow"
                : "bg-white/10 text-white/60 border-white/20 hover:text-white hover:bg-white/20"
            }`}
          >
            {j === "semua" ? "Rekap Semua Santri" : j === "kas" ? "Rekap Kas" : "Per Santri"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {mode === "bulan" ? (
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-white">Bulan</span>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
            />
          </label>
        ) : (
          <>
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium text-white">Dari</span>
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium text-white">Sampai</span>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
              />
            </label>
          </>
        )}

        {jenis === "santri" && (
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-white">Pilih Santri</span>
            <select
              value={santriId}
              onChange={(e) => setSantriId(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
            >
              {daftarSantri.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </label>
        )}

        <button
          onClick={handleUnduh}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2 shadow transition-all"
        >
          {loading ? (
            <><span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyiapkan...</>
          ) : (
            <><span>↓</span> Unduh PDF</>
          )}
        </button>
      </div>
    </div>
  );
}
