import { createClient } from "@supabase/supabase-js";

export type Santri = { id: string; nama: string };

export type TipeKelas = "Reguler" | "Kitab";
export type StatusKehadiran = "H" | "S" | "I" | "A";
export type KategoriKas = "Kas Reguler" | "Kas Umum";

export type Kehadiran = {
  id: string;
  santriId: string;
  tanggal: string;
  tipeKelas: TipeKelas;
  status: StatusKehadiran;
  inputBy: string;
};

export type Kas = {
  id: string;
  santriId: string;
  tanggal: string;
  kategori: KategoriKas;
  lunas: boolean;
  nominal: number | null;
  inputBy: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function listSantri(): Promise<Santri[]> {
  if (supabaseUrl.includes("placeholder")) return [];
  const { data, error } = await supabase.from("santri").select("*").order("nama");
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export async function addSantri(nama: string): Promise<Santri> {
  const { data, error } = await supabase.from("santri").insert([{ nama: nama.trim() }]).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSantri(id: string): Promise<void> {
  const { error } = await supabase.from("santri").delete().eq("id", id);
  if (error) throw error;
}

const monthKey = (iso: string) => iso.slice(0, 7);

export type RekapSantri = {
  id: string;
  nama: string;
  totalHadir: number;
  totalSesi: number;
  persen: number;
  kasReguler: "Lunas" | "Belum";
  kasUmum: "Lunas" | "Belum";
};

export async function getRekap(bulan: string): Promise<RekapSantri[]> {
  if (supabaseUrl.includes("placeholder")) return [];
  
  const { data: santris, error: errS } = await supabase.from("santri").select("*").order("nama");
  if (errS) {
    console.error(errS);
    return [];
  }
  
  const startDate = `${bulan}-01`;
  const endDate = `${bulan}-31`; 
  
  const { data: kehadiran, error: errK } = await supabase
    .from("kehadiran")
    .select("*")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  if (errK) {
    console.error(errK);
    return [];
  }

  const { data: kas, error: errC } = await supabase
    .from("kas")
    .select("*")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  if (errC) {
    console.error(errC);
    return [];
  }

  return (santris || []).map((s) => {
    const sesi = (kehadiran || []).filter((k) => k.santri_id === s.id);
    const totalHadir = sesi.filter((k) => k.status === "H").length;
    const totalSesi = sesi.length;
    const persen = totalSesi === 0 ? 0 : Math.round((totalHadir / totalSesi) * 100);
    const kasReguler = (kas || []).some((k) => k.santri_id === s.id && k.kategori === "Kas Reguler" && k.lunas)
      ? "Lunas"
      : "Belum";
    const kasUmum = (kas || []).some((k) => k.santri_id === s.id && k.kategori === "Kas Umum" && k.lunas)
      ? "Lunas"
      : "Belum";
    return { id: s.id, nama: s.nama, totalHadir, totalSesi, persen, kasReguler, kasUmum };
  });
}

export async function upsertKehadiran(
  rows: { santriId: string; status: StatusKehadiran }[],
  tanggal: string,
  tipeKelas: TipeKelas,
  inputBy: string
): Promise<void> {
  if (rows.length === 0) return;
  const payload = rows.map((r) => ({
    santri_id: r.santriId,
    tanggal,
    tipe_kelas: tipeKelas,
    status: r.status,
    input_by: inputBy,
  }));
  const { error } = await supabase.from("kehadiran").upsert(payload, { onConflict: "santri_id, tanggal, tipe_kelas" });
  if (error) throw error;
}

export async function upsertKas(
  rows: { santriId: string; lunas: boolean; nominal: number | null }[],
  tanggal: string,
  kategori: KategoriKas,
  inputBy: string
): Promise<void> {
  if (rows.length === 0) return;
  const payload = rows.map((r) => ({
    santri_id: r.santriId,
    tanggal,
    kategori,
    lunas: r.lunas,
    nominal: r.nominal,
    input_by: inputBy,
  }));
  const { error } = await supabase.from("kas").upsert(payload, { onConflict: "santri_id, tanggal, kategori" });
  if (error) throw error;
}

export async function getLog(tanggal: string, tipeKelas: TipeKelas) {
  if (supabaseUrl.includes("placeholder")) return [];
  const { data, error } = await supabase
    .from("kehadiran")
    .select("*")
    .eq("tanggal", tanggal)
    .eq("tipe_kelas", tipeKelas);
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).map(row => ({
    id: row.id,
    santriId: row.santri_id,
    tanggal: row.tanggal,
    tipeKelas: row.tipe_kelas,
    status: row.status,
    inputBy: row.input_by
  }));
}

export async function getKasLog(tanggal: string, kategori: KategoriKas) {
  if (supabaseUrl.includes("placeholder")) return [];
  const { data, error } = await supabase
    .from("kas")
    .select("*")
    .eq("tanggal", tanggal)
    .eq("kategori", kategori);
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).map(row => ({
    id: row.id,
    santriId: row.santri_id,
    tanggal: row.tanggal,
    kategori: row.kategori,
    lunas: row.lunas,
    nominal: row.nominal,
    inputBy: row.input_by
  }));
}
