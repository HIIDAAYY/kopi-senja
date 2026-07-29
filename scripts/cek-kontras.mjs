/**
 * Hitung rasio kontras WCAG untuk setiap pasangan warna yang benar-benar
 * dipakai di situs. Dijadikan skrip agar bisa dijalankan ulang setiap kali
 * token warna berubah — bukan diperiksa manual sekali lalu dilupakan.
 *
 * Jalankan: node scripts/cek-kontras.mjs
 * Keluar dengan kode 1 kalau ada pasangan yang gagal.
 */

const TOKEN = {
  cream: '#f7f0e6',
  'cream-muted': '#efe4d4',
  espresso: '#2b1d15',
  'espresso-deep': '#1a110c',
  amber: '#c97b3c',
  'amber-wash': '#e8c99b',
  terracotta: '#85462d',
  'status-buka': '#45a06a',
  'status-tutup': '#9a8e84',
};

/** Kanal sRGB -> linear, sesuai definisi WCAG 2.1 */
function keLinear(kanal) {
  const c = kanal / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminansi(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = keLinear((n >> 16) & 255);
  const g = keLinear((n >> 8) & 255);
  const b = keLinear(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rasio(a, b) {
  const la = luminansi(a);
  const lb = luminansi(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Campur dua warna sRGB seperti color-mix(in srgb, X p%, transparent)
 * di atas latar tertentu. Dipakai untuk teks deskripsi kartu.
 */
function campur(depan, persen, latar) {
  const d = parseInt(depan.slice(1), 16);
  const l = parseInt(latar.slice(1), 16);
  const p = persen / 100;
  const ch = (geser) => {
    const cd = (d >> geser) & 255;
    const cl = (l >> geser) & 255;
    return Math.round(cd * p + cl * (1 - p));
  };
  return (
    '#' +
    [16, 8, 0]
      .map((g) => ch(g).toString(16).padStart(2, '0'))
      .join('')
  );
}

const T = TOKEN;

const PASANGAN = [
  // [latar, teks, ambang, keterangan]
  [T.cream, T.espresso, 4.5, 'Teks body di hero & menu'],
  [T.espresso, T.cream, 4.5, 'Teks di section Tentang'],
  [T.espresso, T['cream-muted'], 4.5, 'Paragraf Tentang'],
  [T.espresso, T['amber-wash'], 4.5, 'Label "Tentang Kami"'],
  [T.cream, T.terracotta, 4.5, 'Label "Menu" & hero'],
  [T['amber-wash'], T.espresso, 4.5, 'Teks di section Lokasi'],
  [T['amber-wash'], T.terracotta, 4.5, 'Label "Lokasi & Jam Buka"'],
  [T['espresso-deep'], T.cream, 4.5, 'Teks footer'],
  [T['espresso-deep'], T['amber-wash'], 4.5, 'Tagline footer'],
  [T['cream-muted'], T.espresso, 4.5, 'Nama item di kartu menu'],
  [
    T['cream-muted'],
    campur(T.espresso, 72, T['cream-muted']),
    4.5,
    'Deskripsi item (espresso 72%)',
  ],
  [T.espresso, T.cream, 4.5, 'Tombol Pesan (isi gelap, teks cream)'],
  [T.terracotta, T.cream, 4.5, 'Tombol Pesan saat hover'],
  // Non-teks: focus ring dan indikator status hanya butuh 3:1.
  // --warna-fokus default espresso, di-override jadi amber-wash oleh
  // section berlatar gelap (Tentang & Footer).
  [T.cream, T.espresso, 3, 'Focus ring di Hero & Menu (non-teks)'],
  [T['cream-muted'], T.espresso, 3, 'Focus ring di kartu menu (non-teks)'],
  [T['amber-wash'], T.espresso, 3, 'Focus ring di Lokasi (non-teks)'],
  [T.espresso, T['amber-wash'], 3, 'Focus ring di Tentang (non-teks)'],
  [T['espresso-deep'], T['amber-wash'], 3, 'Focus ring di Footer (non-teks)'],
  // Badge status adalah chip berlatar --espresso, bukan lapisan
  // transparan di atas --amber-wash. Rasio dihitung terhadap chip itu.
  [T.espresso, T.cream, 4.5, 'Teks badge status'],
  [T.espresso, T['status-buka'], 3, 'Titik badge "buka" (non-teks)'],
  [T.espresso, T.amber, 3, 'Titik badge "segera tutup" (non-teks)'],
  [T.espresso, T['status-tutup'], 3, 'Titik badge "tutup" (non-teks)'],
];

let gagal = 0;

console.log(
  'LATAR      TEKS       RASIO   AMBANG  HASIL  KETERANGAN'
);
console.log('-'.repeat(78));

for (const [latar, teks, ambang, ket] of PASANGAN) {
  const r = rasio(latar, teks);
  const lolos = r >= ambang;
  if (!lolos) gagal += 1;
  console.log(
    `${latar}  ${teks}  ${r.toFixed(2).padStart(5)}   ${String(ambang).padStart(3)}     ${
      lolos ? 'LOLOS' : 'GAGAL'
    }  ${ket}`
  );
}

console.log('-'.repeat(78));
if (gagal > 0) {
  console.log(`${gagal} pasangan GAGAL memenuhi WCAG AA.`);
  process.exit(1);
}
console.log(`Semua ${PASANGAN.length} pasangan lolos WCAG AA.`);
