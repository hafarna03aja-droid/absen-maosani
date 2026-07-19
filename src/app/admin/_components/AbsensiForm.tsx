"use client";

import { useMemo, useState } from "react";
import { submitKehadiran } from "@/app/actions";
import { STATUS, TIPE_KELAS, validateHari } from "@/lib/constants";
import type { Santri } from "@/lib/db";

export default function AbsensiForm({ santri }: { santri: Santri[] }) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipe, setTipe] = useState<TipeKelasLocal>("Reguler");

  const error = useMemo(
    () => validateHari(tipe, tanggal),
    [tipe, tanggal]
  );

  return (
    <form action={submitKehadiran} className="space-y-4">
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
          <span className="mb-1 block font-medium text-slate-600">Tipe Kelas</span>
          <select
            name="tipeKelas"
            value={tipe}
            onChange={(e) => setTipe(e.target.value as TipeKelasLocal)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {TIPE_KELAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠ {error}</p>
      )}

      <input type="hidden" name="inputBy" value="admin" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 w-12 text-center">No</th>
              <th className="px-4 py-2">Santri</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {santri.map((s, idx) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-center text-slate-500">{idx + 1}</td>
                <td className="px-4 py-2">{s.nama}</td>
                <td className="px-4 py-2">
                  <select
                    name={`status_${s.id}`}
                    defaultValue="H"
                    className="rounded-lg border border-slate-300 px-2 py-1 focus:border-emerald-500 focus:outline-none"
                  >
                    {STATUS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code} — {st.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={!!error}
        className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Simpan Absensi
      </button>
    </form>
  );
}

type TipeKelasLocal = "Reguler" | "Kitab";
