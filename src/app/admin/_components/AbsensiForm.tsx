"use client";

import { useEffect, useMemo, useState } from "react";
import { submitKehadiran, getKehadiranLog } from "@/app/actions";
import { STATUS, TIPE_KELAS, validateHari } from "@/lib/constants";
import type { Santri, StatusKehadiran, TipeKelas } from "@/lib/db";

export default function AbsensiForm({ santri }: { santri: Santri[] }) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipe, setTipe] = useState<TipeKelas>("Reguler");
  const [statuses, setStatuses] = useState<Record<string, StatusKehadiran>>({});
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);

  const error = useMemo(() => validateHari(tipe, tanggal), [tipe, tanggal]);

  useEffect(() => {
    let active = true;
    if (error) {
      setIsExisting(false);
      return;
    }

    setLoading(true);
    getKehadiranLog(tanggal, tipe)
      .then((logs) => {
        if (!active) return;
        if (logs.length > 0) {
          const map: Record<string, StatusKehadiran> = {};
          logs.forEach((log) => {
            map[log.santriId] = log.status;
          });
          setStatuses(map);
          setIsExisting(true);
        } else {
          setStatuses({});
          setIsExisting(false);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tanggal, tipe, error]);

  const handleStatusChange = (santriId: string, value: StatusKehadiran) => {
    setStatuses((prev) => ({ ...prev, [santriId]: value }));
  };

  return (
    <form action={submitKehadiran} className="space-y-4">
      <div className="glass rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-end">
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
          <span className="mb-1 block font-medium text-white">Tipe Kelas</span>
          <select
            name="tipeKelas"
            value={tipe}
            onChange={(e) => setTipe(e.target.value as TipeKelas)}
            className="rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
          >
            {TIPE_KELAS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        {loading && (
          <span className="text-xs text-white/70 pb-2">Memuat data absensi...</span>
        )}
      </div>

      {error && (
        <p className="rounded-xl glass border border-red-400/30 px-3 py-2 text-sm text-red-200">⚠ {error}</p>
      )}

      {!error && isExisting && (
        <p className="rounded-xl glass border border-blue-400/30 px-3 py-2 text-sm text-blue-200">
          ℹ Data absensi tanggal ini sudah tersimpan. Silakan edit status di bawah untuk memperbarui.
        </p>
      )}

      <input type="hidden" name="inputBy" value="admin" />

      <div className="glass rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 w-12 text-center">No</th>
              <th className="px-4 py-3">Santri</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {santri.map((s, idx) => (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-2.5 text-center text-white/40">{idx + 1}</td>
                <td className="px-4 py-2.5 text-white">{s.nama}</td>
                <td className="px-4 py-2.5">
                  <select
                    name={`status_${s.id}`}
                    value={statuses[s.id] ?? "H"}
                    onChange={(e) => handleStatusChange(s.id, e.target.value as StatusKehadiran)}
                    className="rounded-lg border border-white/30 bg-white text-slate-800 px-2 py-1 focus:border-blue-400 focus:outline-none text-sm"
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
        disabled={!!error || loading}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-2.5 font-medium text-white hover:from-blue-700 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-40 shadow transition-all"
      >
        {isExisting ? "Perbarui Absensi" : "Simpan Absensi"}
      </button>
    </form>
  );
}
