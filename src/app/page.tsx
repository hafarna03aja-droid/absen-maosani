import Link from "next/link";
import { getRekap } from "@/lib/db";

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

        <div className="mt-4 rounded-lg bg-white p-4 text-sm shadow-sm">
          <p className="text-slate-600">
            Periode <strong>{bulanLabel(bulan)}</strong> · {rekap.length} santri ·
            lunas penuh kas: <strong>{lunas}</strong> santri
          </p>
        </div>

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
