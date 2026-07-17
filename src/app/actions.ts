"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addSantri,
  deleteSantri,
  upsertKas,
  upsertKehadiran,
  insertTransaksi,
  insertBanyakTransaksi,
  deleteTransaksi,
  type KategoriKas,
  type StatusKehadiran,
  type TipeKelas,
} from "@/lib/db";
import { checkPassword } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/cookie";
import { validateHari } from "@/lib/constants";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (!checkPassword(pw)) {
    redirect("/login?error=1");
  }
  const store = await cookies();
  store.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  const from = String(formData.get("from") || "/admin");
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}

export async function createSantri(formData: FormData) {
  const nama = String(formData.get("nama") || "").trim();
  if (nama) {
    try {
      await addSantri(nama);
    } catch (e: any) {
      console.error(e);
      redirect(`/admin?tab=santri&error=${encodeURIComponent(e.message || "Failed")}`);
    }
  }
  redirect("/admin?tab=santri");
}

export async function removeSantri(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) {
    try {
      await deleteSantri(id);
    } catch (e: any) {
      console.error(e);
    }
  }
  redirect("/admin?tab=santri");
}

export async function submitKehadiran(formData: FormData) {
  const tanggal = String(formData.get("tanggal") || "");
  const tipeKelas = String(formData.get("tipeKelas") || "") as TipeKelas;
  const inputBy = String(formData.get("inputBy") || "admin");
  const err = validateHari(tipeKelas, tanggal);
  if (err) redirect(`/admin?tab=absensi&error=${encodeURIComponent(err)}`);
  const rows: { santriId: string; status: StatusKehadiran }[] = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("status_")) {
      rows.push({ santriId: key.slice(7), status: val as StatusKehadiran });
    }
  }
  await upsertKehadiran(rows, tanggal, tipeKelas, inputBy);
  redirect("/admin?tab=absensi&ok=1");
}

export async function submitKas(formData: FormData) {
  const tanggal = String(formData.get("tanggal") || "");
  const kategori = String(formData.get("kategori") || "") as KategoriKas;
  const inputBy = String(formData.get("inputBy") || "admin");
  const rows: { santriId: string; lunas: boolean; nominal: number | null }[] = [];
  const transaksis: any[] = [];
  
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("nominal_")) {
        const id = key.slice(8);
        const nominalRaw = val as string;
        const nominal = nominalRaw ? Number(nominalRaw) || null : null;
        const isLunas = formData.get(`lunas_${id}`) === "on";
        
        // Simpan ke kas jika lunas dicentang ATAU ada nominal yang diisi
        if (isLunas || (nominal && nominal > 0)) {
          rows.push({ santriId: id, lunas: isLunas, nominal });
          
          if (nominal && nominal > 0) {
            transaksis.push({
              tanggal,
              jenis: "Masuk",
              santri_id: id,
              sumber_tujuan: `Kas ${kategori}`,
              nominal,
              keterangan: isLunas ? "Otomatis dari Kas Bulanan" : "Cicilan Kas Bulanan",
              input_by: inputBy,
            });
          }
        }
      }
    }
  await upsertKas(rows, tanggal, kategori, inputBy);
  if (transaksis.length > 0) {
    await insertBanyakTransaksi(transaksis);
  }
  redirect("/admin?tab=kas&ok=1");
}

export async function submitBukuKas(formData: FormData) {
  const tanggal = String(formData.get("tanggal") || "");
  const jenis = String(formData.get("jenis")) as "Masuk" | "Keluar";
  const tipeAsal = String(formData.get("tipeAsal") || ""); // "santri" atau "umum"
  const santriId = tipeAsal === "santri" ? String(formData.get("santri_id") || "") : null;
  const sumberTujuan = String(formData.get("sumber_tujuan") || "");
  const nominal = Number(formData.get("nominal") || "0");
  const keterangan = String(formData.get("keterangan") || "");
  const inputBy = String(formData.get("inputBy") || "admin");

  if (nominal > 0) {
    try {
      await insertTransaksi({
        tanggal,
        jenis,
        santri_id: santriId,
        sumber_tujuan: sumberTujuan,
        nominal,
        keterangan: keterangan || null,
        input_by: inputBy,
      });
    } catch (e: any) {
      console.error(e);
      redirect(`/admin?tab=buku&error=${encodeURIComponent(e.message)}`);
    }
  }
  redirect("/admin?tab=buku");
}

export async function removeTransaksi(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) {
    try {
      await deleteTransaksi(id);
    } catch (e) {
      console.error(e);
    }
  }
  redirect("/admin?tab=buku");
}
