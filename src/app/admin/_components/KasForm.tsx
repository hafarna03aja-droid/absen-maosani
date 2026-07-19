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
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tanggal</span>
          <input
            type="date"
            name="tanggal"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Kategori Kas</span>
          <select
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {KATEGORI_KAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="inputBy" value="admin" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 w-12 text-center">No</th>
                <th className="px-4 py-2">Santri</th>
                <th className="px-4 py-2">Lunas</th>
                <th className="px-4 py-2">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {santri.map((s, idx) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-2">{s.nama}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    name={`lunas_${s.id}`}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    name={`nominal_${s.id}`}
                    placeholder="0"
                    className="w-28 rounded-lg border border-slate-300 px-2 py-1 focus:border-emerald-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800"
      >
        Simpan Kas
      </button>
    </form>
  );
}
