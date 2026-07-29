import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const ROOT = process.argv[2];

await mkdir(`${ROOT}/public/img/menu`, { recursive: true });
await mkdir(`${ROOT}/public/img/suasana`, { recursive: true });

const buat = (w, h, keluaran) =>
  sharp({ create: { width: w, height: h, channels: 3, background: '#8C4A2F' } })
    .webp()
    .toFile(keluaran);

await buat(1920, 1080, `${ROOT}/public/img/hero.webp`);

const menu = [
  'kopi-susu-senja',
  'espresso',
  'americano',
  'cappuccino',
  'caffe-latte',
  'kopi-tubruk',
  'matcha-latte',
  'cokelat-panas',
  'pisang-goreng-keju',
  'roti-bakar-cokelat',
];
await Promise.all(menu.map((id) => buat(800, 800, `${ROOT}/public/img/menu/${id}.webp`)));

const suasana = [
  [1200, 1600],
  [900, 700],
  [900, 1200],
  [1400, 900],
];
await Promise.all(
  suasana.map(([w, h], i) => buat(w, h, `${ROOT}/public/img/suasana/${i + 1}.webp`))
);

// og-image placeholder, diganti foto asli di Task 14
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#8C4A2F' } })
  .jpeg({ quality: 82 })
  .toFile(`${ROOT}/public/img/og-image.jpg`);

console.log('placeholder dibuat: hero, 10 menu, 4 suasana, og-image');
