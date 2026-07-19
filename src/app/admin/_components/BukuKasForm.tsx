"use client";

import { useState } from "react";
import { submitBukuKas, removeTransaksi } from "@/app/actions";
import type { Santri, Transaksi } from "@/lib/db";

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
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
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 border border-emerald-100 flex-1">
          <p className="text-sm">Saldo Saat Ini</p>
          <p className="text-2xl font-bold">{formatRupiah(saldo)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Input Transaksi Baru</h2>
        <form className="space-y-4" action={submitBukuKas}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">Tanggal</span>
              <input
                type="date"
                name="tanggal"
                required
                defaultValue={todayLocal()}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">Jenis Transaksi</span>
              <select
                name="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as "Masuk" | "Keluar")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Masuk">Pemasukan (Masuk)</option>
                <option value="Keluar">Pengeluaran (Keluar)</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {jenis === "Masuk" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600">Sumber Pemasukan</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="tipeAsal"
                      value="santri"
                      checked={tipeAsal === "santri"}
                      onChange={() => setTipeAsal("santri")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Dari Santri
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="tipeAsal"
                      value="umum"
                      checked={tipeAsal === "umum"}
                      onChange={() => setTipeAsal("umum")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Umum / Donatur
                  </label>
                </div>
                {tipeAsal === "santri" ? (
                  <label className="block text-sm mt-2">
                    <span className="mb-1 block font-medium text-slate-600">Nama Santri</span>
                    <select
                      name="santri_id"
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Pilih Santri --</option>
                      {santri.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}
                        </option>
                      ))}
                    </select>
                    <input type="hidden" name="sumber_tujuan" value="Infak Santri" />
                  </label>
                ) : (
                  <label className="block text-sm mt-2">
                    <span className="mb-1 block font-medium text-slate-600">Nama Sumber</span>
                    <input
                      name="sumber_tujuan"
                      required
                      placeholder="Contoh: Donatur A, Hamba Allah"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                )}
              </div>
            ) : (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Tujuan Pengeluaran</span>
                <input
                  name="sumber_tujuan"
                  required
                  placeholder="Contoh: Beli Spidol, Konsumsi"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
                <input type="hidden" name="tipeAsal" value="umum" />
              </label>
            )}

            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Nominal (Rp)</span>
                <input
                  type="number"
                  name="nominal"
                  required
                  min="1"
                  placeholder="Contoh: 50000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Keterangan (Opsional)</span>
                <input
                  name="keterangan"
                  placeholder="Detail tambahan..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 sm:w-auto"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
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
            <tbody className="divide-y divide-slate-100">
              {transaksi.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-center text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3">{t.tanggal}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.jenis === "Masuk" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {t.jenis}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {t.santri_nama ? `${t.sumber_tujuan} - ${t.santri_nama}` : t.sumber_tujuan}
                </td>
                <td className="px-4 py-3 text-slate-500">{t.keterangan || "-"}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    t.jenis === "Masuk" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {t.jenis === "Masuk" ? "+" : "-"} {formatRupiah(t.nominal)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={removeTransaksi} onSubmit={(e) => {
                    if (!confirm("Hapus transaksi ini?")) e.preventDefault();
                  }}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-medium">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {transaksi.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
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
