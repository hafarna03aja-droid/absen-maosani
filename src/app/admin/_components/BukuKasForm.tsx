"use client";

import { useState } from "react";
import { submitBukuKas, removeTransaksi } from "@/app/actions";
import type { Santri, Transaksi } from "@/lib/db";

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function BukuKasForm({
  santri,
  saldo,
  transaksi,
}: {
  santri: Santri[];
  saldo: number;
  transaksi: Transaksi[];
}) {
  const [jenis, setJenis] = useState<"Masuk" | "Keluar">("Masuk");
  const [tipeAsal, setTipeAsal] = useState<"santri" | "umum">("santri");

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl px-5 py-4 shadow-lg">
        <p className="text-sm text-white/60">Saldo Saat Ini</p>
        <p className="text-3xl font-bold text-white drop-shadow mt-1">{formatRupiah(saldo)}</p>
      </div>

      <div className="glass rounded-2xl p-5 shadow-lg">
        <h2 className="mb-4 font-semibold text-white">Input Transaksi Baru</h2>
        <form className="space-y-4" action={submitBukuKas}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-white">Tanggal</span>
              <input
                type="date"
                name="tanggal"
                required
                defaultValue={todayLocal()}
                className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-white">Jenis Transaksi</span>
              <select
                name="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as "Masuk" | "Keluar")}
                className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
              >
                <option value="Masuk">Pemasukan (Masuk)</option>
                <option value="Keluar">Pengeluaran (Keluar)</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {jenis === "Masuk" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-white">Sumber Pemasukan</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white font-medium">
                    <input
                      type="radio"
                      name="tipeAsal"
                      value="santri"
                      checked={tipeAsal === "santri"}
                      onChange={() => setTipeAsal("santri")}
                      className="accent-blue-500"
                    />
                    Dari Santri
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white font-medium">
                    <input
                      type="radio"
                      name="tipeAsal"
                      value="umum"
                      checked={tipeAsal === "umum"}
                      onChange={() => setTipeAsal("umum")}
                      className="accent-blue-500"
                    />
                    Umum / Donatur
                  </label>
                </div>
                {tipeAsal === "santri" ? (
                  <label className="block text-sm mt-2">
                    <span className="mb-1 block font-medium text-white">Nama Santri</span>
                    <select
                      name="santri_id"
                      required
                      className="w-full rounded-xl border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">-- Pilih Santri --</option>
                      {santri.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama}</option>
                      ))}
                    </select>
                    <input type="hidden" name="sumber_tujuan" value="Infak Santri" />
                  </label>
                ) : (
                  <label className="block text-sm mt-2">
                    <span className="mb-1 block font-medium text-white">Nama Sumber</span>
                    <input
                      name="sumber_tujuan"
                      required
                      placeholder="Contoh: Donatur A, Hamba Allah"
                      className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                    />
                  </label>
                )}
              </div>
            ) : (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-white">Tujuan Pengeluaran</span>
                <input
                  name="sumber_tujuan"
                  required
                  placeholder="Contoh: Beli Spidol, Konsumsi"
                  className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                />
                <input type="hidden" name="tipeAsal" value="umum" />
              </label>
            )}

            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-white">Nominal (Rp)</span>
                <input
                  type="number"
                  name="nominal"
                  required
                  min="1"
                  placeholder="Contoh: 50000"
                  className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-white">Keterangan (Opsional)</span>
                <input
                  name="keterangan"
                  placeholder="Detail tambahan..."
                  className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-2.5 font-medium text-white hover:from-blue-700 hover:to-red-700 shadow transition-all"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl overflow-x-auto shadow-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-white/50">
            <tr>
              <th className="px-4 py-3 w-12 text-center font-semibold">No</th>
              <th className="px-4 py-3 font-semibold">Tgl</th>
              <th className="px-4 py-3 font-semibold">Jenis</th>
              <th className="px-4 py-3 font-semibold">Sumber / Tujuan</th>
              <th className="px-4 py-3 font-semibold">Keterangan</th>
              <th className="px-4 py-3 font-semibold text-right">Nominal</th>
              <th className="px-4 py-3 font-semibold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {transaksi.map((t, idx) => (
              <tr key={t.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-center text-white/40">{idx + 1}</td>
                <td className="px-4 py-3 text-white/70">{t.tanggal}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    t.jenis === "Masuk" ? "bg-blue-500/30 text-blue-200 border border-blue-400/30" : "bg-red-500/30 text-red-200 border border-red-400/30"
                  }`}>
                    {t.jenis}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {t.santri_nama ? `${t.sumber_tujuan} - ${t.santri_nama}` : t.sumber_tujuan}
                </td>
                <td className="px-4 py-3 text-white/50">{t.keterangan || "-"}</td>
                <td className={`px-4 py-3 text-right font-bold ${t.jenis === "Masuk" ? "text-blue-300" : "text-red-300"}`}>
                  {t.jenis === "Masuk" ? "+" : "-"} {formatRupiah(t.nominal)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={removeTransaksi} onSubmit={(e) => {
                    if (!confirm("Hapus transaksi ini?")) e.preventDefault();
                  }}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {transaksi.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
