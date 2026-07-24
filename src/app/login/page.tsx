import Link from "next/link";
import { login } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        action={login}
        className="glass-white w-full max-w-sm rounded-2xl p-7 shadow-2xl text-slate-800"
      >
        <div className="flex justify-center mb-5">
          <img src="/logo.jpg" alt="Logo" className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg" />
        </div>
        <h1 className="text-lg font-bold text-slate-800 text-center">Login Admin / Ustadz</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">
          Halaman input dilindungi. Masukkan kata sandi.
        </p>
        {sp.error && (
          <p className="mt-3 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            Kata sandi salah.
          </p>
        )}
        <input type="hidden" name="from" value={sp.from || "/admin"} />
        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Kata Sandi</span>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-xl border border-slate-200 bg-white text-slate-800 px-3 py-2 focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </label>
        <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-4 py-2.5 font-semibold text-white hover:from-blue-700 hover:to-red-700 shadow transition-all">
          Masuk
        </button>
        <Link href="/" className="mt-3 block text-center text-xs text-slate-400 hover:text-slate-600 hover:underline transition-colors">
          ← Kembali ke dasbor publik
        </Link>
      </form>
    </main>
  );
}
