import Link from "next/link";
import { getRekap, getBukuKas } from "@/lib/db";

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
  searchParams: Promise<{ q?: string; bulan?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const bulan = sp.bulan || todayMonth();
  let rekap = await getRekap(bulan);
  if (q) rekap = rekap.filter((r) => r.nama.toLowerCase().includes(q));

  const lunas = rekap.filter((r) => r.kasReguler === "Lunas" && r.kasUmum === "Lunas").length;
  
  const buku = await getBukuKas();
  const topTransaksi = buku.transaksi.slice(0, 5);

  return (
    <main className="flex-1">
      <header className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo Maosani" className="h-16 w-16 rounded-full object-cover shrink-0 bg-white" />
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Rumah Quran Maosani</h1>
            <p className="text-emerald-100 text-sm">Dasbor Publik Absensi & Kas Santri</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-slate-600">Cari nama santri</span>
            <input
              name="q"
              defaultValue={sp.q || ""}
              placeholder="Ketik nama..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Bulan</span>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <button className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800">
            Tampilkan
          </button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 shadow-sm">
            <h2 className="text-sm font-medium text-emerald-800">Saldo Pembukuan (Kas/Infak)</h2>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{formatRupiah(buku.saldo)}</p>
          </div>
          <div className="rounded-lg bg-white p-4 text-sm shadow-sm border border-slate-200 flex items-center">
            <p className="text-slate-600">
              Periode <strong>{bulanLabel(bulan)}</strong> — {rekap.length} santri —
              lunas penuh kas bulanan: <strong>{lunas}</strong> santri
            </p>
          </div>
        </div>

        {topTransaksi.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">5 Transaksi Terakhir</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center font-semibold">No</th>
                      <th className="px-4 py-3 font-semibold">Tgl</th>
                      <th className="px-4 py-3 font-semibold">Keterangan</th>
                      <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topTransaksi.map((t, idx) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.tanggal}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {t.santri_nama ? `${t.sumber_tujuan} - ${t.santri_nama}` : t.sumber_tujuan}
                        </div>
                        {t.keterangan && <div className="text-xs text-slate-500">{t.keterangan}</div>}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${t.jenis === "Masuk" ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.jenis === "Masuk" ? "+" : "-"} {formatRupiah(t.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-800 mt-8 mb-3">Data Santri</h2>


        {rekap.length === 0 ? (
          <p className="mt-6 text-center text-slate-500">Tidak ada data yang cocok.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rekap.map((r, i) => (
              <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-800">{i + 1}. {r.nama}</h3>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Kehadiran</span>
                    <span>{r.persen}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${r.persen}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {r.totalHadir}/{r.totalSesi} sesi hadir
                  </p>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-1 font-medium ${
                      r.kasReguler === "Lunas"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    Kas Reguler: {r.kasReguler}
                  </span>
                    <span
                    className={`rounded-full px-2 py-1 font-medium ${
                      r.kasUmum === "Lunas"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                    >
                      Kas Umum: {r.kasUmum}
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Data pembaruan maksimal 1 jam setelah kegiatan selesai. ·
          <Link href="/login" className="ml-1 text-emerald-700 underline">
            Akses Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
