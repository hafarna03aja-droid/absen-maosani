-- Run in Supabase SQL Editor

CREATE TABLE santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  tempat_tanggal_lahir TEXT,
  nama_wali TEXT,
  alamat_wali TEXT
);

CREATE TABLE kehadiran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  tipe_kelas TEXT NOT NULL,
  status TEXT NOT NULL,
  input_by TEXT NOT NULL,
  UNIQUE(santri_id, tanggal, tipe_kelas)
);

CREATE TABLE kas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  kategori TEXT NOT NULL,
  lunas BOOLEAN NOT NULL DEFAULT FALSE,
  nominal NUMERIC,
  input_by TEXT NOT NULL,
  UNIQUE(santri_id, tanggal, kategori)
);
