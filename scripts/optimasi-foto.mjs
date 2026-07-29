/**
 * Ubah foto mentah di raw/ menjadi WebP teroptimasi di public/img/.
 *
 * Dijadikan skrip, bukan langkah manual, supaya hasilnya bisa diulang
 * persis kalau suatu saat fotonya diganti.
 *
 * Jalankan: node scripts/optimasi-foto.mjs
 *
 * Struktur yang diharapkan:
 *   raw/hero.jpg
 *   raw/menu/<id-item>.jpg      (10 file, id harus cocok dengan menu.json)
 *   raw/suasana/1.jpg .. 4.jpg
 *
 * Setelah dijalankan, skrip mencetak ukuran akhir tiap file. Angka foto
 * suasana WAJIB disalin ke array `foto` di src/components/Tentang.astro —
 * width/height di HTML harus cocok dengan file aslinya, kalau tidak
 * Lighthouse akan melaporkan CLS.
 */
import { readdir, access } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

async function ada(jalur) {
  try {
    await access(jalur);
    return true;
  } catch {
    return false;
  }
}

if (!(await ada('raw'))) {
  console.error(
    'Folder raw/ belum ada.\n\n' +
      'Buat folder raw/, raw/menu/, dan raw/suasana/, isi dengan foto\n' +
      'mentah sesuai nama file di menu.json, lalu jalankan lagi.'
  );
  process.exit(1);
}

const TUGAS = [
  { dari: 'raw', ke: 'public/img', file: 'hero.jpg', w: 1920, h: 1080 },
  { dari: 'raw/menu', ke: 'public/img/menu', semua: true, w: 800, h: 800 },
  { dari: 'raw/suasana', ke: 'public/img/suasana', semua: true, w: 1400 },
];

for (const tugas of TUGAS) {
  if (!(await ada(tugas.dari))) {
    console.warn(`Lewati ${tugas.dari} — folder tidak ada.`);
    continue;
  }

  await mkdir(tugas.ke, { recursive: true });

  const daftar = tugas.semua
    ? (await readdir(tugas.dari)).filter((f) => /\.(jpe?g|png)$/i.test(f))
    : [tugas.file];

  for (const nama of daftar) {
    const keluaran = join(tugas.ke, nama.replace(/\.\w+$/, '.webp'));

    await sharp(join(tugas.dari, nama))
      .resize(tugas.w, tugas.h, {
        // Foto menu dan hero di-crop ke rasio pasti; foto suasana
        // dibiarkan mengikuti rasio aslinya agar kolase tetap asimetris.
        fit: tugas.h ? 'cover' : 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(keluaran);

    const { width, height } = await sharp(keluaran).metadata();
    console.log(`${keluaran} — ${width}x${height}`);
  }
}

// Gambar preview saat link dibagikan ke WhatsApp. JPEG, bukan WebP:
// beberapa scraper media sosial masih belum mendukung WebP.
if (await ada('raw/hero.jpg')) {
  await sharp('raw/hero.jpg')
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toFile('public/img/og-image.jpg');
  console.log('public/img/og-image.jpg — 1200x630');
}

console.log(
  '\nSelesai. Salin ukuran foto suasana di atas ke array `foto` di\n' +
    'src/components/Tentang.astro, dan perbarui teks alt-nya agar cocok\n' +
    'dengan isi foto yang sebenarnya.'
);
