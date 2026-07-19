# Panduan Pengguna - Dasbor Rumah Quran Maosani

Sistem ini digunakan untuk memantau absensi dan pembukuan kas santri. Terdapat dua halaman utama: **Dasbor Publik** (bisa dilihat semua orang) dan **Panel Admin** (khusus pengurus).

---

## 1. Dasbor Publik (Halaman Utama)
Siapapun bisa mengakses halaman ini tanpa login. Halaman ini berfungsi untuk transparansi laporan.

**Fitur yang tersedia:**
- **Pencarian Santri**: Ketik nama santri di kolom pencarian untuk memfilter data rekap dengan cepat.
- **Filter Bulan**: Pilih bulan tertentu untuk melihat rekap absensi dan status kas pada bulan tersebut.
- **Ringkasan Kas & Transaksi**: 
  - Menampilkan total **Saldo Pembukuan** saat ini.
  - Menampilkan tabel **5 Transaksi Terakhir** (Pemasukan/Pengeluaran).
- **Data Santri**: Menampilkan daftar rekap santri berupa:
  - Persentase kehadiran (dilengkapi *progress bar* hijau).
  - Jumlah sesi hadir dibanding total sesi di bulan tersebut.
  - Status Kas Reguler & Kas Umum (Lunas / Belum Lunas).

---

## 2. Akses Panel Admin
Panel admin digunakan oleh pengurus untuk memasukkan data (absensi, setoran kas, tambah santri, dll).

1. Buka halaman utama dasbor.
2. Scroll ke paling bawah, klik tulisan **"Akses Admin"** (atau buka URL `/login`).
3. Masukkan password admin. *(Hubungi pembuat sistem/ketua pengurus untuk password)*.

---

## 3. Penggunaan Panel Admin (Menu-menu)

Setelah berhasil login, admin akan melihat 4 (empat) menu di bagian atas: **Absensi**, **Kas**, **Buku**, dan **Santri**.

### A. Menu Absensi
Digunakan untuk mencatat kehadiran harian santri saat KBM berlangsung.
1. Buka tab **Absensi**.
2. Tentukan **Tanggal** pertemuan.
3. Tentukan **Tipe Kelas** (Reguler atau Kitab).
   > **Catatan Validasi Hari (SOP):**
   > - Kelas **Reguler** hanya bisa diisi pada hari: Selasa, Rabu, Jumat, Sabtu.
   > - Kelas **Kitab** hanya bisa diisi pada hari: Sabtu.
   > - Jika salah hari, sistem akan menolak dan memunculkan peringatan merah.
4. Pada tabel di bawah, ubah status tiap santri (default: Hadir):
   - **H**: Hadir
   - **S**: Sakit
   - **I**: Izin
   - **A**: Alpha
5. Klik tombol **Simpan Absensi**.

### B. Menu Kas (Iuran Bulanan Santri)
Digunakan untuk mencatat pembayaran kas bulanan santri.
1. Buka tab **Kas**.
2. Tentukan **Tanggal** pembayaran.
3. Pilih **Kategori Kas** yang dibayarkan (Kas Reguler atau Kas Umum).
4. Pada tabel di bawah, **centang (ceklis)** kotak di kolom "Lunas" pada baris nama santri yang membayar.
5. (Opsional) Isi nominal (Rp) jika diperlukan, atau biarkan kosong.
6. Klik tombol **Simpan Kas**.

### C. Menu Buku (Pemasukan & Pengeluaran Kas)
Digunakan untuk mencatat mutasi uang (donasi, operasional, dll) yang memengaruhi total Saldo Pembukuan.
1. Buka tab **Buku**.
2. Tentukan **Tanggal** transaksi.
3. Pilih **Jenis Transaksi**:
   - **Masuk** (Pemasukan)
   - **Keluar** (Pengeluaran)
4. Tentukan **Sumber / Tujuan**:
   - Jika *Masuk*, pilih apakah uang berasal dari santri tertentu atau dari Umum/Donatur.
   - Jika *Keluar*, tulis tujuan pengeluarannya (Misal: "Beli Spidol", "Konsumsi Guru").
5. Masukkan **Nominal (Rp)** (tanpa titik, misal: 50000).
6. (Opsional) Tambahkan **Keterangan** detail.
7. Klik tombol **Simpan Transaksi**.
   > *Catatan: Transaksi yang sudah tersimpan bisa dihapus melalui tombol "Hapus" berwarna merah di tabel bawah.*

### D. Menu Santri (Manajemen Data Santri)
Digunakan untuk menambah santri baru atau menghapus santri yang keluar.
- **Tambah Santri Baru**: 
  1. Ketik nama lengkap santri di kotak input.
  2. Klik **Tambah Santri**.
- **Hapus Santri**: 
  1. Cari nama santri di tabel bawah.
  2. Klik tombol **Hapus** berwarna merah di sebelah kanannya.
  > *Peringatan: Hati-hati menghapus santri, karena ini dapat berdampak pada rekap data absensi santri tersebut.*

---

## 4. Keluar dari Panel Admin (Logout)
Untuk keluar, klik tombol **Logout** (warna merah) di pojok kanan atas layar Panel Admin. Selalu logout setelah selesai menginput data jika Anda menggunakan perangkat umum/bersama.
