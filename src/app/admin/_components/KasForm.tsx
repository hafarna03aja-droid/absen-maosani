"use client";

import { useState } from "react";
import { submitKas } from "@/app/actions";
import { KATEGORI_KAS } from "@/lib/constants";
import type { Santri } from "@/lib/db";

export default function KasForm({ santri }: { santri: Santri[] }) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [kategori, setKategori] = useState<string>("Kas Reguler");

  return (
    <form action={submitKas} className="space-y-4">
      <div className="glass rounded-2xl p-4 flex flex-col gap-3 sm:flex-row">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-white">Tanggal</span>
          <input
            type="date"
            name="tanggal"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-white">Kategori Kas</span>
          <select
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
          >
            {KATEGORI_KAS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="inputBy" value="admin" />

      <div className="glass rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 w-12 text-center">No</th>
              <th className="px-4 py-3">Santri</th>
              <th className="px-4 py-3">Lunas</th>
              <th className="px-4 py-3">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {santri.map((s, idx) => (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-2.5 text-center text-white/40">{idx + 1}</td>
                <td className="px-4 py-2.5 text-white">{s.nama}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    name={`lunas_${s.id}`}
                    className="h-4 w-4 rounded border-white/30 accent-blue-500"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    name={`nominal_${s.id}`}
                    placeholder="0"
                    className="w-28 rounded-lg border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-2 py-1 focus:border-blue-400 focus:outline-none text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-2.5 font-medium text-white hover:from-blue-700 hover:to-red-700 shadow transition-all"
      >
        Simpan Kas
      </button>
    </form>
  );
}
