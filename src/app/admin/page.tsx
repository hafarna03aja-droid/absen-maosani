import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSantri, getBukuKas } from "@/lib/db";
import { createSantri, logout, removeSantri, editSantri } from "@/app/actions";
import AbsensiForm from "./_components/AbsensiForm";
import KasForm from "./_components/KasForm";
import BukuKasForm from "./_components/BukuKasForm";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; ok?: string; error?: string }>;
}) {
  await requireAuth();
  const sp = await searchParams;
  const tab = sp.tab || "absensi";
  const santri = await listSantri();
  const buku = tab === "buku" ? await getBukuKas() : { saldo: 0, transaksi: [] };

  return (
    <main className="flex-1">
      <header className="bg-emerald-800 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full object-cover bg-white" />
            <div>
              <h1 className="text-lg font-bold">Panel Admin - Maosani</h1>
              <p className="text-emerald-100 text-xs">Input absensi & kas santri</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-emerald-100 hover:underline">
              Dasbor Publik
            </Link>
            <form action={logout}>
              <button className="rounded-lg bg-emerald-900/60 px-3 py-1 hover:bg-emerald-900">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
          <nav className="flex gap-2 border-b border-slate-200 pb-2 text-sm overflow-x-auto whitespace-nowrap">
            {[
              ["absensi", "Absensi"],
              ["kas", "Kas Bulanan"],
              ["buku", "Pembukuan (Infak)"],
              ["santri", "Data Santri"],
            ].map(([key, label]) => (
            <Link
              key={key}
              href={`/admin?tab=${key}`}
              className={`rounded-lg px-3 py-2 font-medium ${
                tab === key
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {sp.ok && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✓ Data berhasil disimpan.
          </p>
        )}
        {sp.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            ⚠ {decodeURIComponent(sp.error)}
          </p>
        )}

          <div className="mt-6">
            {tab === "absensi" && <AbsensiForm santri={santri} />}
  
            {tab === "kas" && <KasForm santri={santri} />}

            {tab === "buku" && <BukuKasForm santri={santri} saldo={buku.saldo} transaksi={buku.transaksi} />}
  
            {tab === "santri" && (
            <div className="space-y-4">
              <form
                action={createSantri}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Nama Santri</span>
                    <input
                      name="nama"
                      required
                      placeholder="Nama lengkap"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Tempat, Tanggal Lahir</span>
                    <input
                      name="tempat_tanggal_lahir"
                      placeholder="Contoh: Jakarta, 01-01-2010"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Nama Wali</span>
                    <input
                      name="nama_wali"
                      placeholder="Nama ayah/ibu"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-600">Alamat</span>
                    <input
                      name="alamat_wali"
                      placeholder="Alamat tempat tinggal"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                </div>
                <button className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 h-[42px] whitespace-nowrap">
                  Tambah Santri
                </button>
              </form>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center">No</th>
                      <th className="px-4 py-2">Nama</th>
                      <th className="px-4 py-2">TTL</th>
                      <th className="px-4 py-2">Wali</th>
                      <th className="px-4 py-2">Alamat</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                    <tbody>
                      {santri.map((s, idx) => (
                        <tr key={s.id} className="border-t border-slate-100 group hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-500 align-top">{idx + 1}</td>
                          <td className="px-4 py-3" colSpan={4}>
                            <form action={editSantri} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                              <input type="hidden" name="id" value={s.id} />
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 block md:hidden">Nama</label>
                                <input
                                  name="nama"
                                  defaultValue={s.nama}
                                  required
                                  className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-1 text-sm transition-all"
                                  placeholder="Nama"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 block md:hidden">TTL</label>
                                <input
                                  name="tempat_tanggal_lahir"
                                  defaultValue={s.tempat_tanggal_lahir || ""}
                                  className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-1 text-sm transition-all"
                                  placeholder="Tempat, Tgl Lahir"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 block md:hidden">Wali</label>
                                <input
                                  name="nama_wali"
                                  defaultValue={s.nama_wali || ""}
                                  className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-1 text-sm transition-all"
                                  placeholder="Nama Wali"
                                />
                              </div>
                              <div className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 block md:hidden">Alamat</label>
                                  <input
                                    name="alamat_wali"
                                    defaultValue={s.alamat_wali || ""}
                                    className="w-full bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1 py-1 text-sm transition-all"
                                    placeholder="Alamat"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="opacity-0 group-hover:opacity-100 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-all whitespace-nowrap"
                                  title="Simpan perubahan"
                                >
                                  Simpan
                                </button>
                              </div>
                            </form>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <form action={removeSantri}>
                              <input type="hidden" name="id" value={s.id} />
                              <button className="text-xs text-red-600 hover:underline mt-1">
                                Hapus
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">
                Total {santri.length} santri. Menghapus santri juga menghapus seluruh
                absensi & kas-nya.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
