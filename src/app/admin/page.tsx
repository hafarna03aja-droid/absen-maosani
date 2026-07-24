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
      <header className="glass-dark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full object-cover border-2 border-white/30" />
            <div>
              <h1 className="text-lg font-bold text-white">Panel Admin - Maosani</h1>
              <p className="text-white/60 text-xs">Input absensi & kas santri</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              Dasbor Publik
            </Link>
            <form action={logout}>
              <button className="rounded-xl glass px-3 py-1.5 text-white text-sm hover:bg-white/20 transition-colors border border-white/20">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <nav className="glass rounded-2xl flex gap-1 p-1.5 text-sm overflow-x-auto whitespace-nowrap mb-6">
          {[
            ["absensi", "Absensi"],
            ["kas", "Kas Bulanan"],
            ["buku", "Pembukuan (Infak)"],
            ["santri", "Data Santri"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`/admin?tab=${key}`}
              className={`rounded-xl px-4 py-2 font-medium transition-all ${
                tab === key
                  ? "bg-gradient-to-r from-blue-600 to-red-600 text-white shadow"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {sp.ok && (
          <p className="mb-4 rounded-xl glass border border-blue-400/30 px-3 py-2 text-sm text-blue-200">
            ✓ Data berhasil disimpan.
          </p>
        )}
        {sp.error && (
          <p className="mb-4 rounded-xl glass border border-red-400/30 px-3 py-2 text-sm text-red-200">
            ⚠ {decodeURIComponent(sp.error)}
          </p>
        )}

        <div>
          {tab === "absensi" && <AbsensiForm santri={santri} />}
          {tab === "kas" && <KasForm santri={santri} />}
          {tab === "buku" && <BukuKasForm santri={santri} saldo={buku.saldo} transaksi={buku.transaksi} />}

          {tab === "santri" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-4">Tambah Santri Baru</h2>
                <form
                  action={createSantri}
                  className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-white">Nama Santri</span>
                      <input
                        name="nama"
                        required
                        placeholder="Nama lengkap"
                        className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-white">Tempat, Tanggal Lahir</span>
                      <input
                        name="tempat_tanggal_lahir"
                        placeholder="Contoh: Jakarta, 01-01-2010"
                        className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-white">Nama Wali</span>
                      <input
                        name="nama_wali"
                        placeholder="Nama ayah/ibu"
                        className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-white">Alamat</span>
                      <input
                        name="alamat_wali"
                        placeholder="Alamat tempat tinggal"
                        className="w-full rounded-xl border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
                      />
                    </label>
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-2.5 font-medium text-white hover:from-blue-700 hover:to-red-700 shadow transition-all h-[42px] whitespace-nowrap">
                    Tambah Santri
                  </button>
                </form>
              </div>

              <div className="glass rounded-2xl overflow-x-auto shadow-lg">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="border-b border-white/10 text-white/50 text-left">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">No</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">TTL</th>
                      <th className="px-4 py-3">Wali</th>
                      <th className="px-4 py-3">Alamat</th>
                      <th className="px-4 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {santri.map((s, idx) => (
                      <tr key={s.id} className="border-t border-white/10 group hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center text-white/40 align-top">{idx + 1}</td>
                        <td className="px-4 py-3" colSpan={4}>
                          <form action={editSantri} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <input type="hidden" name="id" value={s.id} />
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block md:hidden">Nama</label>
                              <input
                                name="nama"
                                defaultValue={s.nama}
                                required
                                className="w-full bg-white/90 border-b border-transparent group-hover:border-white/40 focus:border-blue-400 focus:bg-white px-1 py-1 text-sm text-slate-800 transition-all rounded"
                                placeholder="Nama"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block md:hidden">TTL</label>
                              <input
                                name="tempat_tanggal_lahir"
                                defaultValue={s.tempat_tanggal_lahir || ""}
                                className="w-full bg-white/90 border-b border-transparent group-hover:border-white/40 focus:border-blue-400 focus:bg-white px-1 py-1 text-sm text-slate-800 transition-all rounded"
                                placeholder="Tempat, Tgl Lahir"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block md:hidden">Wali</label>
                              <input
                                name="nama_wali"
                                defaultValue={s.nama_wali || ""}
                                className="w-full bg-white/90 border-b border-transparent group-hover:border-white/40 focus:border-blue-400 focus:bg-white px-1 py-1 text-sm text-slate-800 transition-all rounded"
                                placeholder="Nama Wali"
                              />
                            </div>
                            <div className="flex gap-2 items-start">
                              <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block md:hidden">Alamat</label>
                                <input
                                  name="alamat_wali"
                                  defaultValue={s.alamat_wali || ""}
                                  className="w-full bg-white/90 border-b border-transparent group-hover:border-white/40 focus:border-blue-400 focus:bg-white px-1 py-1 text-sm text-slate-800 transition-all rounded"
                                  placeholder="Alamat"
                                />
                              </div>
                              <button
                                type="submit"
                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap font-medium"
                              >
                                Simpan
                              </button>
                            </div>
                          </form>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <form action={removeSantri}>
                            <input type="hidden" name="id" value={s.id} />
                            <button className="text-xs text-red-400 hover:text-red-300 hover:underline mt-1 transition-colors">
                              Hapus
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-white/40">
                Total {santri.length} santri. Menghapus santri juga menghapus seluruh absensi & kas-nya.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
