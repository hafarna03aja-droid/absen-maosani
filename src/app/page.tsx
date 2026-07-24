import Link from "next/link";
import { getRekap, getBukuKas, getDetailSantri, listSantri } from "@/lib/db";
import UnduhPdfForm from "./_components/UnduhPdfForm";

function todayMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function bulanLabel(b: string): string {
  const [y, m] = b.split("-");
  const nama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${nama[Number(m) - 1]} ${y}`;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bulan?: string; detail?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const bulan = sp.bulan || todayMonth();
  let rekap = await getRekap(bulan);
  if (q) rekap = rekap.filter((r) => r.nama.toLowerCase().includes(q));

  const lunas = rekap.filter((r) => r.kasReguler === "Lunas" && r.kasUmum === "Lunas").length;

  const buku = await getBukuKas();
  const topTransaksi = buku.transaksi.slice(0, 5);

  const detail = sp.detail ? await getDetailSantri(sp.detail, bulan) : null;
  const baseUrl = `/?bulan=${bulan}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const daftarSantri = await listSantri();

  return (
    <main className="flex-1">
      <header className="glass-dark">
        <div className="mx-auto max-w-5xl px-4 py-6 flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo Maosani" className="h-16 w-16 rounded-full object-cover shrink-0 border-2 border-white/30 shadow-lg" />
          <div>
            <h1 className="text-xl font-bold sm:text-2xl text-white drop-shadow">Rumah Quran Maosani</h1>
            <p className="text-white/70 text-sm">Dasbor Publik Absensi & Kas Santri</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <form className="glass rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-white">Cari nama santri</span>
            <input
              name="q"
              defaultValue={sp.q || ""}
              placeholder="Ketik nama..."
              className="w-full rounded-lg border border-white/30 bg-white text-slate-800 placeholder-slate-400 px-3 py-2 focus:border-blue-400 focus:outline-none"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-white">Bulan</span>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="rounded-lg border border-white/30 bg-white text-slate-800 px-3 py-2 focus:border-blue-400 focus:outline-none"
            />
          </label>
          <button className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 font-medium text-white shadow transition-colors">
            Tampilkan
          </button>
        </form>

        <div className="mt-4">
          <UnduhPdfForm daftarSantri={daftarSantri} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-5 shadow-lg">
            <h2 className="text-sm font-medium text-white/70">Saldo Pembukuan (Kas/Infak)</h2>
            <p className="mt-1 text-3xl font-bold text-white drop-shadow">{formatRupiah(buku.saldo)}</p>
          </div>
          <div className="glass rounded-2xl p-5 shadow-lg flex items-center">
            <p className="text-white/80 text-sm leading-relaxed">
              Periode <strong className="text-white">{bulanLabel(bulan)}</strong> — {rekap.length} santri —{" "}
              lunas penuh kas bulanan: <strong className="text-white">{lunas}</strong> santri
            </p>
          </div>
        </div>

        {topTransaksi.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-white mb-3 drop-shadow">5 Transaksi Terakhir</h2>
            <div className="glass rounded-2xl overflow-x-auto shadow-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Tgl</th>
                    <th className="px-4 py-3 font-semibold">Keterangan</th>
                    <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {topTransaksi.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-center text-white/50">{idx + 1}</td>
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">{t.tanggal}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {t.santri_nama ? `${t.sumber_tujuan} - ${t.santri_nama}` : t.sumber_tujuan}
                        </div>
                        {t.keterangan && <div className="text-xs text-white/50">{t.keterangan}</div>}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${t.jenis === "Masuk" ? "text-blue-300" : "text-red-300"}`}>
                        {t.jenis === "Masuk" ? "+" : "-"} {formatRupiah(t.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-white mt-8 mb-3 drop-shadow">Data Santri</h2>

        {rekap.length === 0 ? (
          <p className="mt-6 text-center text-white/50">Tidak ada data yang cocok.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rekap.map((r, i) => (
              <Link
                key={r.id}
                href={`${baseUrl}&detail=${r.id}`}
                className="glass rounded-2xl p-4 shadow-lg hover:bg-white/20 transition-all cursor-pointer block group"
              >
                <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors">{i + 1}. {r.nama}</h3>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Kehadiran</span>
                    <span className="font-semibold text-white">{r.persen}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-red-400 transition-all"
                      style={{ width: `${r.persen}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    {r.totalHadir}/{r.totalSesi} sesi hadir
                  </p>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-1 font-medium border ${
                      r.kasReguler === "Lunas"
                        ? "bg-blue-500/30 text-blue-200 border-blue-400/30"
                        : "bg-red-500/30 text-red-200 border-red-400/30"
                    }`}
                  >
                    Kas Reguler: {r.kasReguler}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-white/40">
          Data pembaruan maksimal 1 jam setelah kegiatan selesai. ·
          <Link href="/login" className="ml-1 text-blue-300 underline hover:text-blue-200">
            Akses Admin
          </Link>
        </p>
      </div>

      {detail && detail.santri && (
        <>
          <Link
            href={baseUrl}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="glass-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto pointer-events-auto text-slate-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 sticky top-0 bg-white/90 backdrop-blur rounded-t-2xl">
                <div>
                  <h2 className="text-base font-bold text-slate-800">{detail.santri.nama}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{bulanLabel(bulan)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/pdf?jenis=santri&santriId=${sp.detail}&dari=${bulan}-01&sampai=${bulan}-31`}
                    download
                    className="text-xs rounded-lg bg-blue-600 text-white px-3 py-1.5 font-medium hover:bg-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>↓</span> PDF
                  </a>
                  <Link
                    href={baseUrl}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none px-2 transition-colors"
                    aria-label="Tutup"
                  >
                    ✕
                  </Link>
                </div>
              </div>

              <div className="px-5 py-4 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Status Kas</h3>
                  {detail.kas.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data kas bulan ini.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.kas.map((k, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                          <span className="text-slate-600 font-medium">{k.kategori}</span>
                          <div className="flex items-center gap-2">
                            {k.nominal != null && (
                              <span className="text-xs text-slate-400">{formatRupiah(k.nominal)}</span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${k.lunas ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}>
                              {k.lunas ? "Lunas" : "Belum"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Riwayat Absensi</h3>
                  {detail.kehadiran.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data absensi bulan ini.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left">Tanggal</th>
                            <th className="px-3 py-2 text-left">Kelas</th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {detail.kehadiran.map((k, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{k.tanggal}</td>
                              <td className="px-3 py-2 text-slate-500">{k.tipeKelas}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${
                                  k.status === "H" ? "bg-blue-100 text-blue-700" :
                                  k.status === "S" ? "bg-slate-100 text-slate-600" :
                                  k.status === "I" ? "bg-amber-100 text-amber-700" :
                                  "bg-red-100 text-red-600"
                                }`}>
                                  {k.status === "H" ? "Hadir" : k.status === "S" ? "Sakit" : k.status === "I" ? "Izin" : "Alpha"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
