import { NextRequest, NextResponse } from "next/server";
import { getRekapRentang, getDetailSantri, listSantri } from "@/lib/db";
import { renderToBuffer, Document, Page, Text, View, Image, StyleSheet, Font, type Styles } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

Font.register({ family: "Helvetica", fonts: [] });

const STATUS_LABEL: Record<string, string> = { H: "Hadir", S: "Sakit", I: "Izin", A: "Alpha" };

function formatTanggal(iso: string) {
  const [y, m, d] = iso.split("-");
  const bln = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
  return `${d} ${bln[Number(m) - 1]} ${y}`;
}

function formatRupiah(n: number | null) {
  if (n == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function periodeLabel(dari: string, sampai: string) {
  const a = formatTanggal(dari), b = formatTanggal(sampai);
  return dari === sampai ? a : `${a} – ${b}`;
}

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 32, color: "#1e293b" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, borderBottom: "1.5pt solid #065f46", paddingBottom: 10 },
  logo: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  headerText: { flex: 1 },
  orgName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#065f46" },
  subTitle: { fontSize: 9, color: "#475569", marginTop: 2 },
  periode: { fontSize: 8, color: "#64748b", marginTop: 1 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#065f46", marginBottom: 6, marginTop: 14, borderBottom: "0.5pt solid #d1fae5", paddingBottom: 3 },
  table: { width: "100%" },
  thead: { flexDirection: "row", backgroundColor: "#d1fae5" },
  trow: { flexDirection: "row", borderBottom: "0.3pt solid #e2e8f0" },
  trowAlt: { flexDirection: "row", borderBottom: "0.3pt solid #e2e8f0", backgroundColor: "#f8fafc" },
  th: { fontFamily: "Helvetica-Bold", padding: "4pt 5pt", fontSize: 8, color: "#065f46" },
  td: { padding: "3pt 5pt", fontSize: 8, color: "#334155" },
  badge: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, fontSize: 7 },
  badgeGreen: { backgroundColor: "#d1fae5", color: "#065f46" },
  badgeAmber: { backgroundColor: "#fef3c7", color: "#92400e" },
  badgeRed: { backgroundColor: "#fee2e2", color: "#991b1b" },
  badgeBlue: { backgroundColor: "#dbeafe", color: "#1e40af" },
  santriBlock: { marginTop: 10 },
  santriName: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1e293b", marginBottom: 4 },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { width: "30%", fontSize: 8, color: "#64748b" },
  infoValue: { flex: 1, fontSize: 8, color: "#1e293b" },
  colNo: { width: "5%" },
  colNama: { width: "28%" },
  colHadir: { width: "13%" },
  colPersen: { width: "10%" },
  colKasR: { width: "22%" },
  colKasU: { width: "22%" },
  colTgl: { width: "28%" },
  colKelas: { width: "30%" },
  colStatus: { width: "42%" },
  colKasNama: { width: "35%" },
  colKasKat: { width: "20%" },
  colKasNom: { width: "25%" },
  colKasLunas: { width: "20%" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, textAlign: "center", fontSize: 7, color: "#94a3b8", borderTop: "0.5pt solid #e2e8f0", paddingTop: 4 },
});

function StatusBadge({ status }: { status: string }) {
  const styleMap: Styles = { H: s.badgeGreen, S: s.badgeBlue, I: s.badgeAmber, A: s.badgeRed };
  return (
    <View style={[s.badge, styleMap[status] ?? s.badgeAmber]}>
      <Text>{STATUS_LABEL[status] ?? status}</Text>
    </View>
  );
}

function KasBadge({ lunas }: { lunas: string }) {
  return (
    <View style={[s.badge, lunas === "Lunas" ? s.badgeGreen : s.badgeAmber]}>
      <Text>{lunas}</Text>
    </View>
  );
}

function PdfHeader({ logoData, subTitle, periode, now, total }: {
  logoData: string | null; subTitle: string; periode: string; now: string; total?: number;
}) {
  return (
    <View style={s.header}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {logoData && <Image src={logoData} style={s.logo} />}
      <View style={s.headerText}>
        <Text style={s.orgName}>Rumah Quran Maosani</Text>
        <Text style={s.subTitle}>{subTitle}</Text>
        <Text style={s.periode}>Periode: {periode}</Text>
      </View>
      <View>
        <Text style={[s.periode, { textAlign: "right" }]}>Dicetak: {now}</Text>
        {total != null && (
          <Text style={[s.periode, { textAlign: "right", marginTop: 2 }]}>Total santri: {total}</Text>
        )}
      </View>
    </View>
  );
}

function getLogo() {
  const logoPath = path.join(process.cwd(), "public", "logo.jpg");
  return fs.existsSync(logoPath)
    ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`
    : null;
}

async function buildDocSemua(dari: string, sampai: string) {
  const rekap = await getRekapRentang(dari, sampai);
  const logoData = getLogo();
  const periode = periodeLabel(dari, sampai);
  const now = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document title={`Laporan Absensi & Kas - ${periode}`}>
      <Page size="A4" style={s.page}>
        <PdfHeader logoData={logoData} subTitle="Laporan Absensi & Kas Santri" periode={periode} now={now} total={rekap.length} />

        <Text style={s.sectionTitle}>Rekap Santri</Text>
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.colNo]}>No</Text>
            <Text style={[s.th, s.colNama]}>Nama</Text>
            <Text style={[s.th, s.colHadir]}>Hadir/Sesi</Text>
            <Text style={[s.th, s.colPersen]}>%</Text>
            <Text style={[s.th, s.colKasR]}>Kas Reguler</Text>
            <Text style={[s.th, s.colKasU]}>Kas Umum</Text>
          </View>
          {rekap.map((r, i) => (
            <View key={r.id} style={i % 2 === 0 ? s.trow : s.trowAlt}>
              <Text style={[s.td, s.colNo]}>{i + 1}</Text>
              <Text style={[s.td, s.colNama]}>{r.nama}</Text>
              <Text style={[s.td, s.colHadir]}>{r.totalHadir}/{r.totalSesi}</Text>
              <Text style={[s.td, s.colPersen]}>{r.persen}%</Text>
              <View style={[s.td, s.colKasR, { justifyContent: "center" }]}><KasBadge lunas={r.kasReguler} /></View>
              <View style={[s.td, s.colKasU, { justifyContent: "center" }]}><KasBadge lunas={r.kasUmum} /></View>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Detail Absensi Per Santri</Text>
        {rekap.map((r) => (
          <View key={r.id} style={s.santriBlock} wrap={false}>
            <Text style={s.santriName}>{r.nama}</Text>
            {r.kehadiran.length === 0 ? (
              <Text style={[s.td, { color: "#94a3b8" }]}>Tidak ada data absensi pada periode ini.</Text>
            ) : (
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.th, s.colTgl]}>Tanggal</Text>
                  <Text style={[s.th, s.colKelas]}>Kelas</Text>
                  <Text style={[s.th, s.colStatus]}>Status</Text>
                </View>
                {r.kehadiran.map((k, ki) => (
                  <View key={ki} style={ki % 2 === 0 ? s.trow : s.trowAlt}>
                    <Text style={[s.td, s.colTgl]}>{formatTanggal(k.tanggal)}</Text>
                    <Text style={[s.td, s.colKelas]}>{k.tipeKelas}</Text>
                    <View style={[s.td, s.colStatus, { justifyContent: "center" }]}><StatusBadge status={k.status} /></View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={s.footer}>Rumah Quran Maosani · Laporan Absensi & Kas · Periode: {periode}</Text>
      </Page>
    </Document>
  );
}

async function buildDocKas(dari: string, sampai: string) {
  const rekap = await getRekapRentang(dari, sampai);
  const logoData = getLogo();
  const periode = periodeLabel(dari, sampai);
  const now = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  const kasMap: Record<string, { reguler: { lunas: boolean; nominal: number | null } | null; umum: { lunas: boolean; nominal: number | null } | null }> = {};
  for (const r of rekap) kasMap[r.id] = { reguler: null, umum: null };

  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: kasRows } = await sb.from("kas").select("*").gte("tanggal", dari).lte("tanggal", sampai);
    for (const k of kasRows || []) {
      if (!kasMap[k.santri_id]) continue;
      if (k.kategori === "Kas Reguler") kasMap[k.santri_id].reguler = { lunas: k.lunas, nominal: k.nominal };
      if (k.kategori === "Kas Umum") kasMap[k.santri_id].umum = { lunas: k.lunas, nominal: k.nominal };
    }
  }

  return (
    <Document title={`Laporan Kas - ${periode}`}>
      <Page size="A4" style={s.page}>
        <PdfHeader logoData={logoData} subTitle="Laporan Kas Santri" periode={periode} now={now} total={rekap.length} />

        <Text style={s.sectionTitle}>Rekap Kas Santri</Text>
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.colNo]}>No</Text>
            <Text style={[s.th, s.colKasNama]}>Nama</Text>
            <Text style={[s.th, s.colKasR]}>Kas Reguler</Text>
            <Text style={[s.th, s.colKasNom]}>Nominal</Text>
            <Text style={[s.th, s.colKasR]}>Kas Umum</Text>
            <Text style={[s.th, s.colKasNom]}>Nominal</Text>
          </View>
          {rekap.map((r, i) => {
            const km = kasMap[r.id];
            return (
              <View key={r.id} style={i % 2 === 0 ? s.trow : s.trowAlt}>
                <Text style={[s.td, s.colNo]}>{i + 1}</Text>
                <Text style={[s.td, s.colKasNama]}>{r.nama}</Text>
                <View style={[s.td, s.colKasR, { justifyContent: "center" }]}>
                  <KasBadge lunas={km?.reguler ? (km.reguler.lunas ? "Lunas" : "Belum") : "Belum"} />
                </View>
                <Text style={[s.td, s.colKasNom]}>{km?.reguler ? formatRupiah(km.reguler.nominal) : "-"}</Text>
                <View style={[s.td, s.colKasR, { justifyContent: "center" }]}>
                  <KasBadge lunas={km?.umum ? (km.umum.lunas ? "Lunas" : "Belum") : "Belum"} />
                </View>
                <Text style={[s.td, s.colKasNom]}>{km?.umum ? formatRupiah(km.umum.nominal) : "-"}</Text>
              </View>
            );
          })}
        </View>

        <Text style={s.footer}>Rumah Quran Maosani · Laporan Kas · Periode: {periode}</Text>
      </Page>
    </Document>
  );
}

async function buildDocSantri(santriId: string, dari: string, sampai: string) {
  const bulan = dari.slice(0, 7);
  const detail = await getDetailSantri(santriId, bulan);
  const logoData = getLogo();
  const periode = periodeLabel(dari, sampai);
  const now = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const nama = detail.santri?.nama ?? "Santri";

  return (
    <Document title={`Laporan ${nama} - ${periode}`}>
      <Page size="A4" style={s.page}>
        <PdfHeader logoData={logoData} subTitle={`Laporan Santri: ${nama}`} periode={periode} now={now} />

        {detail.santri && (
          <>
            <Text style={s.sectionTitle}>Informasi Santri</Text>
            <View style={{ marginBottom: 4 }}>
              {detail.santri.tempat_tanggal_lahir && (
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>TTL</Text>
                  <Text style={s.infoValue}>{detail.santri.tempat_tanggal_lahir}</Text>
                </View>
              )}
              {detail.santri.nama_wali && (
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Wali</Text>
                  <Text style={s.infoValue}>{detail.santri.nama_wali}</Text>
                </View>
              )}
              {detail.santri.alamat_wali && (
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Alamat</Text>
                  <Text style={s.infoValue}>{detail.santri.alamat_wali}</Text>
                </View>
              )}
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>Status Kas</Text>
        {detail.kas.length === 0 ? (
          <Text style={[s.td, { color: "#94a3b8" }]}>Tidak ada data kas pada periode ini.</Text>
        ) : (
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.th, { width: "40%" }]}>Kategori</Text>
              <Text style={[s.th, { width: "30%" }]}>Status</Text>
              <Text style={[s.th, { width: "30%" }]}>Nominal</Text>
            </View>
            {detail.kas.map((k, i) => (
              <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
                <Text style={[s.td, { width: "40%" }]}>{k.kategori}</Text>
                <View style={[s.td, { width: "30%", justifyContent: "center" }]}>
                  <KasBadge lunas={k.lunas ? "Lunas" : "Belum"} />
                </View>
                <Text style={[s.td, { width: "30%" }]}>{formatRupiah(k.nominal)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.sectionTitle}>Riwayat Absensi</Text>
        {detail.kehadiran.length === 0 ? (
          <Text style={[s.td, { color: "#94a3b8" }]}>Tidak ada data absensi pada periode ini.</Text>
        ) : (
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.th, s.colTgl]}>Tanggal</Text>
              <Text style={[s.th, s.colKelas]}>Kelas</Text>
              <Text style={[s.th, s.colStatus]}>Status</Text>
            </View>
            {detail.kehadiran.map((k, ki) => (
              <View key={ki} style={ki % 2 === 0 ? s.trow : s.trowAlt}>
                <Text style={[s.td, s.colTgl]}>{formatTanggal(k.tanggal)}</Text>
                <Text style={[s.td, s.colKelas]}>{k.tipeKelas}</Text>
                <View style={[s.td, s.colStatus, { justifyContent: "center" }]}><StatusBadge status={k.status} /></View>
              </View>
            ))}
          </View>
        )}

        <Text style={s.footer}>Rumah Quran Maosani · Laporan Santri: {nama} · Periode: {periode}</Text>
      </Page>
    </Document>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");
  const jenis = searchParams.get("jenis") ?? "semua";
  const santriId = searchParams.get("santriId");

  if (!dari || !sampai) {
    return NextResponse.json({ error: "Parameter dari dan sampai wajib diisi" }, { status: 400 });
  }

  let doc;
  let filename: string;

  if (jenis === "kas") {
    doc = await buildDocKas(dari, sampai);
    filename = `laporan-kas-${dari}-sd-${sampai}.pdf`;
  } else if (jenis === "santri" && santriId) {
    doc = await buildDocSantri(santriId, dari, sampai);
    const santris = await listSantri();
    const nama = santris.find((s) => s.id === santriId)?.nama ?? "santri";
    filename = `laporan-${nama.replace(/\s+/g, "-").toLowerCase()}-${dari}-sd-${sampai}.pdf`;
  } else {
    doc = await buildDocSemua(dari, sampai);
    filename = `laporan-maosani-${dari}-sd-${sampai}.pdf`;
  }

  const buffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
