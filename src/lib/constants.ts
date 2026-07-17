import type { KategoriKas, StatusKehadiran, TipeKelas } from "./db";

export const STATUS: { code: StatusKehadiran; label: string }[] = [
  { code: "H", label: "Hadir" },
  { code: "S", label: "Sakit" },
  { code: "I", label: "Izin" },
  { code: "A", label: "Alpha" },
];

export const TIPE_KELAS: TipeKelas[] = ["Reguler", "Kitab"];

export const KATEGORI_KAS: KategoriKas[] = ["Kas Reguler", "Kas Umum"];

// Hari dalam seminggu (0 = Minggu .. 6 = Sabtu)
export const HARI_REGULER = [2, 3, 5, 0]; // Selasa, Rabu, Jumat, Ahad
export const HARI_KITAB = [6]; // Sabtu

const NAMA_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function namaHari(d: Date): string {
  return NAMA_HARI[d.getDay()];
}

// Validasi Silang Hari (SOP): kunci tipe kelas yang tidak sesuai hari
export function validateHari(tipeKelas: TipeKelas, tanggalISO: string): string | null {
  const hari = new Date(tanggalISO + "T00:00:00").getDay();
  if (tipeKelas === "Kitab" && !HARI_KITAB.includes(hari)) {
    return "Kelas Maosani Kitab hanya boleh diisi pada hari Sabtu.";
  }
  if (tipeKelas === "Reguler" && !HARI_REGULER.includes(hari)) {
    return "Kelas Reguler hanya boleh diisi pada hari Selasa, Rabu, Jumat, atau Ahad.";
  }
  return null;
}
