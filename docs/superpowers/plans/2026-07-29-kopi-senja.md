# Kopi Senja — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun situs company profile statis satu halaman untuk kedai kopi fiktif "Kopi Senja" sebagai karya portofolio, dengan skor Lighthouse ≥ 95 di keempat kategori.

**Architecture:** Astro statis tanpa integrasi UI framework. Seluruh konten (menu, profil, jam buka) hidup di dua file JSON; komponen `.astro` membacanya saat build. Logika murni diisolasi ke `src/lib/` sebagai fungsi ES module biasa sehingga bisa diuji dengan Vitest tanpa menyentuh Astro. JavaScript sisi browser hanya tiga file kecil untuk filter, reveal, dan badge status — semuanya progressive enhancement, situs tetap berfungsi penuh tanpa JS.

**Tech Stack:** Astro 5 (`output: 'static'`), CSS murni dengan custom properties, vanilla JS, Vitest, Fontsource (Fraunces Variable + Plus Jakarta Sans Variable), sharp untuk optimasi foto.

**Spec:** [`docs/superpowers/specs/2026-07-29-kopi-senja-design.md`](../specs/2026-07-29-kopi-senja-design.md)

## Global Constraints

- **Tanpa library UI, tanpa framework CSS, tanpa library animasi.** Hanya Astro, Vitest, Fontsource, dan sharp yang boleh masuk `package.json`.
- **Node ≥ 20.** Mesin target sudah memakai v24.14.1.
- **Bahasa kode Indonesia** untuk nama variabel, fungsi, class CSS, dan komentar. Nama file dan API bawaan tetap bahasa Inggris. Pesan commit bahasa Inggris, format conventional commits.
- **Warna hanya dari token** di `src/styles/tokens.css`. Tidak boleh ada nilai hex yang ditulis langsung di komponen.
- **Setiap `<img>` wajib punya `width` dan `height` eksplisit.** Ini syarat CLS = 0.
- **Progressive enhancement wajib.** Class `js` dipasang di `<html>` oleh skrip inline. Semua CSS yang menyembunyikan konten sebelum animasi harus berada di bawah selector `.js`, sehingga tanpa JavaScript tidak ada yang tersembunyi.
- **`prefers-reduced-motion: reduce` mematikan seluruh animasi**, di CSS maupun di JS.
- **Palet:** `--cream #F7F0E6`, `--cream-muted #EFE4D4`, `--espresso #2B1D15`, `--espresso-deep #1A110C`, `--amber #C97B3C`, `--amber-wash #E8C99B`, `--terracotta #8C4A2F`.
- **Data fiktif.** Nomor WA `6281234567890`, alamat Jl. Cikapundung Barat No. 12, Bandung 40117.

---

### Task 1: Scaffold Astro, token desain, dan font

Tugas ini menghasilkan halaman kosong yang sudah memuat font dan token warna. Semua tugas berikutnya bergantung padanya.

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: —
- Produces: `Base.astro` menerima props `{ judul: string, deskripsi: string }` dan sebuah slot default. Class CSS global `.bagian`, `.wadah`, `.nomor-bagian`, `.reveal`, `.tombol`, `.tombol--utama`, `.tombol--garis`, `.label` tersedia untuk seluruh komponen.

- [ ] **Step 1: Buat `package.json`**

```json
{
  "name": "kopi-senja",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install dependensi**

```bash
npm install astro @fontsource-variable/fraunces @fontsource-variable/plus-jakarta-sans
```

```bash
npm install -D vitest sharp
```

Expected: `node_modules/` terbentuk, tidak ada error. Jalankan `npm ls astro` dan pastikan versinya 5.x.

- [ ] **Step 3: Cek entrypoint CSS Fraunces yang tersedia**

Fraunces punya sumbu `SOFT` dan `WONK` yang hanya ikut pada build "full". Periksa file mana yang ada:

```bash
ls node_modules/@fontsource-variable/fraunces/
```

Jika ada `full.css`, pakai `@fontsource-variable/fraunces/full.css` di Step 6. Jika tidak ada, pakai `@fontsource-variable/fraunces` biasa dan **catat di README** bahwa sumbu WONK tidak aktif. Jangan tebak — lihat hasil perintah ini dan pilih sesuai kenyataan.

- [ ] **Step 4: Buat `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Diperlukan agar tag <link rel="canonical"> dan Open Graph
  // menghasilkan URL absolut. Ganti setelah tahu domain aslinya.
  site: 'https://kopi-senja.netlify.app',
  output: 'static',
  build: {
    // CSS kecil di-inline ke <head> supaya tidak ada request
    // tambahan yang menghambat render pertama.
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 5: Buat `src/styles/tokens.css`**

```css
:root {
  /* Warna — diturunkan dari cahaya golden hour */
  --cream: #f7f0e6;
  --cream-muted: #efe4d4;
  --espresso: #2b1d15;
  --espresso-deep: #1a110c;
  --amber: #c97b3c;
  --amber-wash: #e8c99b;
  --terracotta: #8c4a2f;

  /* Font */
  --font-display: 'Fraunces Variable', Georgia, serif;
  --font-body: 'Plus Jakarta Sans Variable', system-ui, sans-serif;

  /* Skala tipografi */
  --fs-hero: clamp(3.5rem, 13vw, 11rem);
  --fs-section: clamp(2.25rem, 6vw, 4.5rem);
  --fs-card: clamp(1.25rem, 2vw, 1.6rem);
  --fs-price: clamp(1.5rem, 2.5vw, 2rem);
  --fs-body: 1.125rem;
  --fs-label: 0.8125rem;

  /* Ritme vertikal */
  --pad-bagian: clamp(5rem, 12vw, 10rem);
  --lebar-wadah: 1200px;

  /* Gerak */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 6: Buat `src/styles/global.css`**

Ganti baris `@import` Fraunces sesuai hasil Step 3.

```css
@import '@fontsource-variable/fraunces/full.css';
@import '@fontsource-variable/plus-jakarta-sans';
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

body,
h1,
h2,
h3,
p,
figure,
ul {
  margin: 0;
  padding: 0;
}

ul {
  list-style: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.7;
  color: var(--espresso);
  background: var(--cream);
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  /* WONK memberi lekuk khas pada g/y — ini yang membedakan
     Fraunces dari serif generik. */
  font-variation-settings: 'SOFT' 20, 'WONK' 1;
}

a {
  color: inherit;
}

/* Focus ring wajib terlihat di background terang maupun gelap */
:focus-visible {
  outline: 3px solid var(--amber);
  outline-offset: 3px;
  border-radius: 2px;
}

/* --- Layout --- */

.bagian {
  position: relative;
  padding-block: var(--pad-bagian);
  overflow: clip;
}

.wadah {
  width: min(100% - 2.5rem, var(--lebar-wadah));
  margin-inline: auto;
}

.nomor-bagian {
  position: absolute;
  top: clamp(1.5rem, 4vw, 3.5rem);
  right: clamp(0.5rem, 3vw, 2.5rem);
  font-family: var(--font-display);
  font-size: clamp(6rem, 18vw, 16rem);
  font-weight: 700;
  line-height: 1;
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
}

.label {
  font-size: var(--fs-label);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* --- Tombol --- */

.tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.75rem;
  border: 2px solid currentColor;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s var(--ease), color 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.tombol:hover {
  transform: translateY(-2px);
}

.tombol--utama {
  background: var(--espresso);
  border-color: var(--espresso);
  color: var(--cream);
}

.tombol--utama:hover {
  background: var(--terracotta);
  border-color: var(--terracotta);
}

.tombol--garis {
  background: transparent;
  color: var(--espresso);
}

.tombol--garis:hover {
  background: var(--espresso);
  color: var(--cream);
}

/* --- Reveal saat scroll ---
   Hanya aktif kalau JS ada (html.js). Tanpa JS semua langsung terlihat. */

.js .reveal {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
  transition-delay: calc(var(--i, 0) * 90ms);
}

.js .reveal--tampil {
  opacity: 1;
  transform: none;
}

/* --- Reduced motion ---
   Sengaja ditulis dua lapis: mengembalikan .reveal ke keadaan terlihat,
   dan mematikan semua transisi/animasi lain di halaman. */

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .js .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 7: Buat `src/layouts/Base.astro`**

Versi minimal dulu; meta lengkap dan JSON-LD ditambahkan di Task 6.

```astro
---
import '../styles/global.css';

const { judul, deskripsi } = Astro.props;
---

<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{judul}</title>
    <meta name="description" content={deskripsi} />
    <!-- Dipasang sebelum paint pertama supaya tidak ada kedipan.
         Semua CSS yang menyembunyikan konten bergantung pada class ini. -->
    <script is:inline>
      document.documentElement.classList.add('js');
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Buat `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base judul="Kopi Senja" deskripsi="Kedai kopi lokal di Bandung.">
  <main>
    <section class="bagian">
      <div class="wadah">
        <span class="nomor-bagian">01</span>
        <p class="label">Uji token</p>
        <h1 style="font-size: var(--fs-hero)">Kopi Senja</h1>
        <p>Paragraf uji untuk memastikan Plus Jakarta Sans termuat.</p>
        <a class="tombol tombol--utama" href="#">Tombol utama</a>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 9: Jalankan dan verifikasi secara visual**

```bash
npm run dev
```

Buka `http://localhost:4321`. Yang harus terlihat:
- Judul "Kopi Senja" memakai serif (Fraunces), bukan font sistem
- Paragraf memakai sans-serif (Plus Jakarta Sans)
- Background cream `#F7F0E6`, teks coklat tua
- Angka "01" besar samar di kanan atas
- Buka DevTools → Network, filter "font": harus ada file `.woff2` yang termuat dari origin sendiri (`localhost`), **bukan** dari `fonts.gstatic.com`

Jika font tidak berubah, cek kembali nama family di `--font-display` / `--font-body` — Fontsource memakai nama dengan akhiran `Variable`.

- [ ] **Step 10: Buat `.gitignore` sudah ada, lalu commit**

```bash
git add package.json package-lock.json astro.config.mjs src/
git commit -m "feat: scaffold Astro project with design tokens and fonts"
```

---

### Task 2: `lib/format.js` — format rupiah

**Files:**
- Create: `src/lib/format.js`
- Test: `tests/format.test.js`

**Interfaces:**
- Consumes: —
- Produces: `formatRupiah(angka: number): string` — `18000` → `"Rp 18.000"`. Dipakai Task 3 (`wa.js`), Task 9 (`MenuCard.astro`), dan Task 6 (`priceRange` di JSON-LD).

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/format.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { formatRupiah } from '../src/lib/format.js';

describe('formatRupiah', () => {
  it('menyisipkan titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(18000)).toBe('Rp 18.000');
  });

  it('menangani angka di bawah seribu tanpa pemisah', () => {
    expect(formatRupiah(500)).toBe('Rp 500');
  });

  it('menangani angka jutaan', () => {
    expect(formatRupiah(1250000)).toBe('Rp 1.250.000');
  });

  it('menangani nol', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('menangani batas tepat empat digit', () => {
    expect(formatRupiah(1000)).toBe('Rp 1.000');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "../src/lib/format.js"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/format.js`:

```js
/**
 * Format angka menjadi rupiah: 18000 -> "Rp 18.000"
 *
 * Sengaja tidak memakai Number.toLocaleString('id-ID') supaya hasilnya
 * identik di semua mesin. toLocaleString bergantung pada data locale ICU
 * yang bisa berbeda antara mesin dev dan server build.
 */
export function formatRupiah(angka) {
  const ribuan = String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${ribuan}`;
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

```bash
npm test
```

Expected: PASS — 5 test lulus.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.js tests/format.test.js
git commit -m "feat: add rupiah formatter with locale-independent output"
```

---

### Task 3: `lib/wa.js` — pembentuk link WhatsApp

Ini fitur andalan situs. Link dibangun **saat build**, bukan di browser, sehingga menghasilkan `<a href>` biasa yang tetap berfungsi tanpa JavaScript.

**Files:**
- Create: `src/lib/wa.js`
- Test: `tests/wa.test.js`

**Interfaces:**
- Consumes: `formatRupiah` dari Task 2.
- Produces:
  - `linkWAItem(profil, item): string | null` — URL `wa.me` dengan pesan pesanan terisi. Mengembalikan `null` jika `profil.wa` kosong.
  - `linkWAUmum(profil): string | null` — URL `wa.me` dengan pesan tanya-tanya umum. Mengembalikan `null` jika `profil.wa` kosong.

  Task 9 dan Task 13 memakai keduanya dan **wajib memeriksa `null`** sebelum merender tombol.

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/wa.test.js`. Perhatikan cara test membaca parameter `text`: memakai `URL.searchParams` yang otomatis men-decode, bukan membandingkan string ter-encode mentah. Ini membuat test menguji **isi pesannya**, bukan detail encoding — sekaligus tetap membuktikan encoding-nya benar, karena string yang salah encode tidak akan bisa di-decode kembali dengan benar.

```js
import { describe, it, expect } from 'vitest';
import { linkWAItem, linkWAUmum } from '../src/lib/wa.js';

const profil = {
  nama: 'Kopi Senja',
  wa: '6281234567890',
  waTemplateItem:
    'Halo {nama}, saya mau pesan {item} ({harga}). Apakah tersedia?',
  waTemplateUmum: 'Halo {nama}, saya mau tanya-tanya dulu boleh?',
};

const item = { nama: 'Kopi Susu Senja', harga: 18000 };

describe('linkWAItem', () => {
  it('mengarah ke nomor WA yang benar', () => {
    const url = new URL(linkWAItem(profil, item));
    expect(url.origin + url.pathname).toBe('https://wa.me/6281234567890');
  });

  it('mengisi nama kedai, nama item, dan harga terformat', () => {
    const url = new URL(linkWAItem(profil, item));
    expect(url.searchParams.get('text')).toBe(
      'Halo Kopi Senja, saya mau pesan Kopi Susu Senja (Rp 18.000). Apakah tersedia?'
    );
  });

  it('meng-encode pesan sehingga URL tidak mengandung spasi mentah', () => {
    expect(linkWAItem(profil, item)).not.toContain(' ');
  });

  it('mengembalikan null jika nomor WA kosong', () => {
    expect(linkWAItem({ ...profil, wa: '' }, item)).toBeNull();
  });

  it('menangani nama item yang mengandung karakter khusus', () => {
    const url = new URL(
      linkWAItem(profil, { nama: 'Caffè Latte & Co', harga: 25000 })
    );
    expect(url.searchParams.get('text')).toContain('Caffè Latte & Co');
  });
});

describe('linkWAUmum', () => {
  it('mengisi nama kedai tanpa memerlukan item', () => {
    const url = new URL(linkWAUmum(profil));
    expect(url.searchParams.get('text')).toBe(
      'Halo Kopi Senja, saya mau tanya-tanya dulu boleh?'
    );
  });

  it('mengembalikan null jika nomor WA kosong', () => {
    expect(linkWAUmum({ ...profil, wa: '' })).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "../src/lib/wa.js"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/wa.js`:

```js
import { formatRupiah } from './format.js';

/**
 * Ganti setiap {kunci} di template dengan nilai[kunci].
 * Placeholder yang tidak dikenal dibiarkan apa adanya supaya kesalahan
 * ketik di profil.json terlihat jelas di layar, bukan hilang diam-diam.
 */
function isiTemplate(template, nilai) {
  return template.replace(/\{(\w+)\}/g, (cocok, kunci) =>
    Object.hasOwn(nilai, kunci) ? nilai[kunci] : cocok
  );
}

function bangunLink(nomor, pesan) {
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

/** Link pesan untuk satu item menu. null jika nomor WA belum diisi. */
export function linkWAItem(profil, item) {
  if (!profil.wa) return null;
  return bangunLink(
    profil.wa,
    isiTemplate(profil.waTemplateItem, {
      nama: profil.nama,
      item: item.nama,
      harga: formatRupiah(item.harga),
    })
  );
}

/** Link pesan umum untuk hero dan footer. null jika nomor WA belum diisi. */
export function linkWAUmum(profil) {
  if (!profil.wa) return null;
  return bangunLink(
    profil.wa,
    isiTemplate(profil.waTemplateUmum, { nama: profil.nama })
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

```bash
npm test
```

Expected: PASS — 12 test lulus (5 dari Task 2, 7 dari task ini).

- [ ] **Step 5: Commit**

```bash
git add src/lib/wa.js tests/wa.test.js
git commit -m "feat: build WhatsApp order links at build time"
```

---

### Task 4: `lib/status.js` — perhitungan status buka/tutup

Fungsi murni yang menerima objek `Date` sebagai parameter, bukan memanggil `new Date()` di dalamnya. Ini yang membuatnya bisa diuji: test bisa menyuntikkan waktu apapun.

**Files:**
- Create: `src/lib/status.js`
- Test: `tests/status.test.js`

**Interfaces:**
- Consumes: —
- Produces:
  - `keMenit(jam: string): number` — `"08:30"` → `510`
  - `hitungStatus(sekarang: Date, jadwal: Array, ambangMenit = 60): { keadaan, label }` di mana `keadaan` adalah `'buka' | 'segera-tutup' | 'tutup'`.

  `jadwal` berbentuk array dari `profil.json` field `jam`: `[{ hari: number[], label: string, buka: "HH:MM", tutup: "HH:MM" }]`. Task 12 memakai `hitungStatus`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/status.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { keMenit, hitungStatus } from '../src/lib/status.js';

const jadwal = [
  { hari: [1, 2, 3, 4, 5], label: 'Senin–Jumat', buka: '08:00', tutup: '22:00' },
  { hari: [6, 0], label: 'Sabtu–Minggu', buka: '09:00', tutup: '23:00' },
];

// Bulan di konstruktor Date dimulai dari 0. 2026-07-27 adalah hari Senin,
// 2026-08-01 adalah hari Sabtu.
const senin = (jam, menit) => new Date(2026, 6, 27, jam, menit);
const sabtu = (jam, menit) => new Date(2026, 7, 1, jam, menit);

describe('keMenit', () => {
  it('mengubah jam:menit menjadi total menit sejak tengah malam', () => {
    expect(keMenit('08:00')).toBe(480);
    expect(keMenit('08:30')).toBe(510);
    expect(keMenit('00:00')).toBe(0);
    expect(keMenit('23:59')).toBe(1439);
  });
});

describe('hitungStatus', () => {
  it('mengembalikan buka di tengah jam operasional', () => {
    expect(hitungStatus(senin(10, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup sebelum jam buka', () => {
    expect(hitungStatus(senin(7, 0), jadwal).keadaan).toBe('tutup');
  });

  it('mengembalikan buka tepat pada menit buka', () => {
    expect(hitungStatus(senin(8, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup tepat pada menit tutup', () => {
    expect(hitungStatus(senin(22, 0), jadwal).keadaan).toBe('tutup');
  });

  it('mengembalikan segera-tutup dalam 60 menit terakhir', () => {
    expect(hitungStatus(senin(21, 30), jadwal).keadaan).toBe('segera-tutup');
  });

  it('mengembalikan segera-tutup tepat pada ambang 60 menit', () => {
    expect(hitungStatus(senin(21, 0), jadwal).keadaan).toBe('segera-tutup');
  });

  it('masih buka satu menit sebelum ambang segera-tutup', () => {
    expect(hitungStatus(senin(20, 59), jadwal).keadaan).toBe('buka');
  });

  it('memakai blok jadwal akhir pekan pada hari Sabtu', () => {
    // 22:30 masih di dalam jam Sabtu (tutup 23:00) tapi sudah lewat
    // jam Senin–Jumat. Membuktikan blok yang dipilih benar.
    expect(hitungStatus(sabtu(22, 30), jadwal).keadaan).toBe('segera-tutup');
    expect(hitungStatus(sabtu(20, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup jika hari tidak ada di jadwal manapun', () => {
    const jadwalSebagian = [
      { hari: [1], label: 'Senin', buka: '08:00', tutup: '22:00' },
    ];
    const hasil = hitungStatus(sabtu(12, 0), jadwalSebagian);
    expect(hasil.keadaan).toBe('tutup');
    expect(hasil.label).toBe('Tutup hari ini');
  });

  it('menyertakan jam tutup pada label saat sedang buka', () => {
    expect(hitungStatus(senin(10, 0), jadwal).label).toContain('22:00');
  });

  it('menghormati ambang kustom', () => {
    expect(hitungStatus(senin(21, 30), jadwal, 15).keadaan).toBe('buka');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "../src/lib/status.js"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/status.js`:

```js
/**
 * BATASAN YANG DISENGAJA
 *
 * 1. Perhitungan memakai zona waktu perangkat pengunjung, bukan WIB.
 *    Pengunjung dari luar Indonesia akan melihat status yang salah.
 *    Untuk situs portofolio ini hal tersebut diterima; konversi zona
 *    waktu menambah kompleksitas yang tidak sepadan.
 *
 * 2. Jam tutup yang melewati tengah malam (mis. buka 20:00 tutup 02:00)
 *    tidak didukung. profil.json saat ini tutup paling malam pukul 23:00.
 *    Jika suatu saat jadwalnya berubah, fungsi ini harus direvisi.
 */

/** "08:30" -> 510 (menit sejak tengah malam) */
export function keMenit(jam) {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + m;
}

/**
 * @param {Date}   sekarang    Waktu yang dievaluasi (disuntikkan agar bisa diuji)
 * @param {Array}  jadwal      profil.jam
 * @param {number} ambangMenit Berapa menit sebelum tutup dianggap "segera tutup"
 * @returns {{ keadaan: 'buka'|'segera-tutup'|'tutup', label: string }}
 */
export function hitungStatus(sekarang, jadwal, ambangMenit = 60) {
  const hariIni = sekarang.getDay();
  const blok = jadwal.find((j) => j.hari.includes(hariIni));

  if (!blok) {
    return { keadaan: 'tutup', label: 'Tutup hari ini' };
  }

  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
  const buka = keMenit(blok.buka);
  const tutup = keMenit(blok.tutup);

  if (menitSekarang < buka || menitSekarang >= tutup) {
    return { keadaan: 'tutup', label: `Tutup · Buka pukul ${blok.buka}` };
  }

  if (tutup - menitSekarang <= ambangMenit) {
    return { keadaan: 'segera-tutup', label: `Segera tutup · ${blok.tutup}` };
  }

  return { keadaan: 'buka', label: `Buka sekarang · sampai ${blok.tutup}` };
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

```bash
npm test
```

Expected: PASS — 24 test lulus seluruhnya.

- [ ] **Step 5: Commit**

```bash
git add src/lib/status.js tests/status.test.js
git commit -m "feat: add open/closed status calculation with injectable clock"
```

---

### Task 5: File data `menu.json` dan `profil.json`

**Files:**
- Create: `src/data/menu.json`
- Create: `src/data/profil.json`
- Create: `src/lib/data.js`
- Test: `tests/data.test.js`

**Interfaces:**
- Consumes: —
- Produces: `src/lib/data.js` mengekspor `menu` (array 10 item tervalidasi), `profil` (objek), dan `KATEGORI` (array `[{ id, label }]` untuk tombol filter). Seluruh komponen mengimpor dari sini, **bukan** langsung dari file JSON — supaya validasi selalu berjalan saat build.

- [ ] **Step 1: Buat `src/data/menu.json`**

```json
[
  {
    "id": "kopi-susu-senja",
    "nama": "Kopi Susu Senja",
    "kategori": "kopi",
    "harga": 18000,
    "deskripsi": "Espresso, susu segar, gula aren cair.",
    "foto": "/img/menu/kopi-susu-senja.webp",
    "unggulan": true
  },
  {
    "id": "espresso",
    "nama": "Espresso",
    "kategori": "kopi",
    "harga": 15000,
    "deskripsi": "Satu shot pekat, biji Jawa Barat.",
    "foto": "/img/menu/espresso.webp",
    "unggulan": false
  },
  {
    "id": "americano",
    "nama": "Americano",
    "kategori": "kopi",
    "harga": 18000,
    "deskripsi": "Espresso dengan air panas, ringan.",
    "foto": "/img/menu/americano.webp",
    "unggulan": false
  },
  {
    "id": "cappuccino",
    "nama": "Cappuccino",
    "kategori": "kopi",
    "harga": 25000,
    "deskripsi": "Espresso, susu, busa tebal.",
    "foto": "/img/menu/cappuccino.webp",
    "unggulan": false
  },
  {
    "id": "caffe-latte",
    "nama": "Caffè Latte",
    "kategori": "kopi",
    "harga": 25000,
    "deskripsi": "Espresso dengan susu steamed lembut.",
    "foto": "/img/menu/caffe-latte.webp",
    "unggulan": false
  },
  {
    "id": "kopi-tubruk",
    "nama": "Kopi Tubruk",
    "kategori": "kopi",
    "harga": 12000,
    "deskripsi": "Diseduh cara lama, disajikan panas.",
    "foto": "/img/menu/kopi-tubruk.webp",
    "unggulan": false
  },
  {
    "id": "matcha-latte",
    "nama": "Matcha Latte",
    "kategori": "non-kopi",
    "harga": 27000,
    "deskripsi": "Matcha upacara, susu segar.",
    "foto": "/img/menu/matcha-latte.webp",
    "unggulan": true
  },
  {
    "id": "cokelat-panas",
    "nama": "Cokelat Panas",
    "kategori": "non-kopi",
    "harga": 22000,
    "deskripsi": "Cokelat pekat, tidak terlalu manis.",
    "foto": "/img/menu/cokelat-panas.webp",
    "unggulan": false
  },
  {
    "id": "pisang-goreng-keju",
    "nama": "Pisang Goreng Keju",
    "kategori": "snack",
    "harga": 20000,
    "deskripsi": "Pisang raja, keju parut, susu kental.",
    "foto": "/img/menu/pisang-goreng-keju.webp",
    "unggulan": false
  },
  {
    "id": "roti-bakar-cokelat",
    "nama": "Roti Bakar Cokelat",
    "kategori": "snack",
    "harga": 18000,
    "deskripsi": "Roti tawar tebal, cokelat leleh.",
    "foto": "/img/menu/roti-bakar-cokelat.webp",
    "unggulan": false
  }
]
```

- [ ] **Step 2: Buat `src/data/profil.json`**

`mapsEmbed` dan `mapsLink` diisi di Task 12 dari Google Maps asli. Untuk sekarang biarkan string kosong — validator di Step 4 tidak memeriksa keduanya.

```json
{
  "nama": "Kopi Senja",
  "tagline": "Ngopi santai di tengah kota",
  "deskripsi": "Kedai kopi kecil di sudut Cikapundung. Kami menyeduh sejak 2019, dengan biji dari petani Jawa Barat dan tempat duduk yang sengaja dibuat untuk berlama-lama.",
  "wa": "6281234567890",
  "waTemplateItem": "Halo {nama}, saya mau pesan {item} ({harga}). Apakah tersedia?",
  "waTemplateUmum": "Halo {nama}, saya mau tanya-tanya dulu boleh?",
  "instagram": "kopisenja.id",
  "alamat": "Jl. Cikapundung Barat No. 12, Bandung 40117",
  "alamatStruktur": {
    "jalan": "Jl. Cikapundung Barat No. 12",
    "kota": "Bandung",
    "provinsi": "Jawa Barat",
    "kodePos": "40117",
    "negara": "ID"
  },
  "mapsEmbed": "",
  "mapsLink": "",
  "koordinat": { "lat": -6.9218, "lng": 107.6083 },
  "jam": [
    {
      "hari": [1, 2, 3, 4, 5],
      "label": "Senin–Jumat",
      "buka": "08:00",
      "tutup": "22:00"
    },
    {
      "hari": [6, 0],
      "label": "Sabtu–Minggu",
      "buka": "09:00",
      "tutup": "23:00"
    }
  ]
}
```

- [ ] **Step 3: Tulis test yang gagal**

Spec mensyaratkan build **gagal dengan pesan jelas** jika `menu.json` berisi kategori tak dikenal. Test ini yang membuktikannya.

Buat `tests/data.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validasiMenu, KATEGORI } from '../src/lib/data.js';

const itemValid = {
  id: 'espresso',
  nama: 'Espresso',
  kategori: 'kopi',
  harga: 15000,
  deskripsi: 'Satu shot pekat.',
  foto: '/img/menu/espresso.webp',
  unggulan: false,
};

describe('KATEGORI', () => {
  it('mendefinisikan tiga kategori dengan id dan label', () => {
    expect(KATEGORI.map((k) => k.id)).toEqual(['kopi', 'non-kopi', 'snack']);
    KATEGORI.forEach((k) => expect(typeof k.label).toBe('string'));
  });
});

describe('validasiMenu', () => {
  it('meloloskan menu yang valid dan mengembalikannya', () => {
    expect(validasiMenu([itemValid])).toEqual([itemValid]);
  });

  it('melempar error yang menyebut kategori tak dikenal beserta id item', () => {
    const rusak = [{ ...itemValid, kategori: 'jus' }];
    expect(() => validasiMenu(rusak)).toThrow(/espresso.*jus/);
  });

  it('melempar error jika ada id yang duplikat', () => {
    expect(() => validasiMenu([itemValid, itemValid])).toThrow(/espresso/);
  });

  it('melempar error jika harga bukan bilangan bulat positif', () => {
    expect(() => validasiMenu([{ ...itemValid, harga: -1 }])).toThrow(/harga/);
    expect(() => validasiMenu([{ ...itemValid, harga: '15000' }])).toThrow(
      /harga/
    );
  });

  it('melempar error jika ada field wajib yang hilang', () => {
    const { foto, ...tanpaFoto } = itemValid;
    expect(() => validasiMenu([tanpaFoto])).toThrow(/foto/);
  });
});
```

- [ ] **Step 4: Jalankan test, pastikan gagal**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "../src/lib/data.js"`.

- [ ] **Step 5: Tulis implementasi**

Buat `src/lib/data.js`:

```js
import menuMentah from '../data/menu.json';
import profilMentah from '../data/profil.json';

export const KATEGORI = [
  { id: 'kopi', label: 'Kopi' },
  { id: 'non-kopi', label: 'Non-Kopi' },
  { id: 'snack', label: 'Snack' },
];

const ID_KATEGORI = KATEGORI.map((k) => k.id);
const FIELD_WAJIB = [
  'id',
  'nama',
  'kategori',
  'harga',
  'deskripsi',
  'foto',
  'unggulan',
];

/**
 * Memeriksa menu dan melempar error yang menyebutkan item mana yang salah.
 * Dipanggil saat modul dimuat, sehingga `npm run build` gagal cepat dengan
 * pesan jelas — bukan diam-diam merender kartu yang tak terjangkau filter.
 */
export function validasiMenu(menu) {
  const idTerlihat = new Set();

  for (const item of menu) {
    const label = item.id ?? '(item tanpa id)';

    for (const field of FIELD_WAJIB) {
      if (!Object.hasOwn(item, field)) {
        throw new Error(`menu.json: item "${label}" kehilangan field "${field}"`);
      }
    }

    if (!ID_KATEGORI.includes(item.kategori)) {
      throw new Error(
        `menu.json: item "${label}" memakai kategori tak dikenal "${item.kategori}". ` +
          `Kategori yang sah: ${ID_KATEGORI.join(', ')}`
      );
    }

    if (!Number.isInteger(item.harga) || item.harga < 0) {
      throw new Error(
        `menu.json: item "${label}" punya harga tidak sah (${item.harga}). ` +
          `Harga harus bilangan bulat non-negatif dalam rupiah.`
      );
    }

    if (idTerlihat.has(item.id)) {
      throw new Error(`menu.json: id duplikat "${label}"`);
    }
    idTerlihat.add(item.id);
  }

  return menu;
}

export const menu = validasiMenu(menuMentah);
export const profil = profilMentah;
```

- [ ] **Step 6: Jalankan test, pastikan lulus**

```bash
npm test
```

Expected: PASS — 30 test lulus.

- [ ] **Step 7: Buktikan validator benar-benar menghentikan build**

Ubah sementara `"kategori": "kopi"` menjadi `"kategori": "jus"` pada item pertama `menu.json`, lalu:

```bash
npm run build
```

Expected: build GAGAL dengan pesan `menu.json: item "kopi-susu-senja" memakai kategori tak dikenal "jus". Kategori yang sah: kopi, non-kopi, snack`

Kembalikan ke `"kopi"` dan jalankan `npm run build` lagi untuk memastikan lulus. **Jangan commit sebelum dikembalikan.**

- [ ] **Step 8: Commit**

```bash
git add src/data/ src/lib/data.js tests/data.test.js
git commit -m "feat: add menu and profile data with build-time validation"
```

---

### Task 6: `Base.astro` lengkap — meta, Open Graph, JSON-LD

**Files:**
- Create: `src/lib/jsonld.js`
- Test: `tests/jsonld.test.js`
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `menu`, `profil` dari Task 5; `formatRupiah` dari Task 2.
- Produces: `buatJsonLd(profil, menu, urlSitus): object` — objek schema.org `CafeOrCoffeeShop`. `Base.astro` menerima props `{ judul, deskripsi }` (keduanya wajib) dan merender seluruh `<head>`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/jsonld.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buatJsonLd } from '../src/lib/jsonld.js';

const profil = {
  nama: 'Kopi Senja',
  deskripsi: 'Kedai kopi kecil di sudut Cikapundung.',
  alamatStruktur: {
    jalan: 'Jl. Cikapundung Barat No. 12',
    kota: 'Bandung',
    provinsi: 'Jawa Barat',
    kodePos: '40117',
    negara: 'ID',
  },
  koordinat: { lat: -6.9218, lng: 107.6083 },
  jam: [
    { hari: [1, 2, 3, 4, 5], label: 'Senin–Jumat', buka: '08:00', tutup: '22:00' },
    { hari: [6, 0], label: 'Sabtu–Minggu', buka: '09:00', tutup: '23:00' },
  ],
};

const menu = [
  { harga: 12000 },
  { harga: 27000 },
  { harga: 18000 },
];

describe('buatJsonLd', () => {
  const hasil = buatJsonLd(profil, menu, 'https://contoh.test');

  it('memakai tipe CafeOrCoffeeShop', () => {
    expect(hasil['@type']).toBe('CafeOrCoffeeShop');
    expect(hasil['@context']).toBe('https://schema.org');
  });

  it('memecah alamat menjadi komponen PostalAddress', () => {
    expect(hasil.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Cikapundung Barat No. 12',
      addressLocality: 'Bandung',
      addressRegion: 'Jawa Barat',
      postalCode: '40117',
      addressCountry: 'ID',
    });
  });

  it('menerjemahkan indeks hari menjadi nama hari schema.org', () => {
    expect(hasil.openingHoursSpecification[0].dayOfWeek).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]);
    expect(hasil.openingHoursSpecification[1].dayOfWeek).toEqual([
      'Saturday',
      'Sunday',
    ]);
  });

  it('menyalin jam buka dan tutup apa adanya', () => {
    expect(hasil.openingHoursSpecification[0].opens).toBe('08:00');
    expect(hasil.openingHoursSpecification[0].closes).toBe('22:00');
  });

  it('menghitung priceRange dari harga termurah dan termahal di menu', () => {
    expect(hasil.priceRange).toBe('Rp 12.000 - Rp 27.000');
  });

  it('menyertakan koordinat sebagai GeoCoordinates', () => {
    expect(hasil.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: -6.9218,
      longitude: 107.6083,
    });
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "../src/lib/jsonld.js"`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/lib/jsonld.js`:

```js
import { formatRupiah } from './format.js';

// Indeks mengikuti Date.getDay(): 0 = Minggu
const NAMA_HARI = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Bangun structured data LocalBusiness dari profil.json.
 *
 * Sengaja diturunkan dari data yang sama dengan yang tampil di halaman,
 * bukan ditulis manual — supaya jam buka di JSON-LD tidak pernah bisa
 * berbeda dengan jam buka yang dibaca pengunjung.
 */
export function buatJsonLd(profil, menu, urlSitus) {
  const harga = menu.map((i) => i.harga);
  const a = profil.alamatStruktur;

  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: profil.nama,
    description: profil.deskripsi,
    url: urlSitus,
    image: `${urlSitus}/img/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.jalan,
      addressLocality: a.kota,
      addressRegion: a.provinsi,
      postalCode: a.kodePos,
      addressCountry: a.negara,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: profil.koordinat.lat,
      longitude: profil.koordinat.lng,
    },
    openingHoursSpecification: profil.jam.map((blok) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: blok.hari.map((h) => NAMA_HARI[h]),
      opens: blok.buka,
      closes: blok.tutup,
    })),
    priceRange: `${formatRupiah(Math.min(...harga))} - ${formatRupiah(
      Math.max(...harga)
    )}`,
    servesCuisine: 'Coffee',
  };
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

```bash
npm test
```

Expected: PASS — 36 test lulus.

- [ ] **Step 5: Lengkapi `src/layouts/Base.astro`**

Ganti seluruh isi file:

```astro
---
import '../styles/global.css';
import { menu, profil } from '../lib/data.js';
import { buatJsonLd } from '../lib/jsonld.js';

const { judul, deskripsi } = Astro.props;

const urlKanonik = new URL(Astro.url.pathname, Astro.site).href;
const urlOg = new URL('/img/og-image.jpg', Astro.site).href;
const jsonLd = buatJsonLd(profil, menu, Astro.site.origin);
---

<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <title>{judul}</title>
    <meta name="description" content={deskripsi} />
    <link rel="canonical" href={urlKanonik} />

    <meta property="og:type" content="website" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:site_name" content={profil.nama} />
    <meta property="og:title" content={judul} />
    <meta property="og:description" content={deskripsi} />
    <meta property="og:url" content={urlKanonik} />
    <meta property="og:image" content={urlOg} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={judul} />
    <meta name="twitter:description" content={deskripsi} />
    <meta name="twitter:image" content={urlOg} />

    <!-- Foto hero adalah LCP. Di-preload supaya tidak menunggu CSS selesai. -->
    <link rel="preload" as="image" href="/img/hero.webp" fetchpriority="high" />

    <script
      type="application/ld+json"
      set:html={JSON.stringify(jsonLd)}
      is:inline
    />

    <!-- Dipasang sebelum paint pertama supaya tidak ada kedipan.
         Semua CSS yang menyembunyikan konten bergantung pada class ini. -->
    <script is:inline>
      document.documentElement.classList.add('js');
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 6: Buat `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#2B1D15" />
  <circle cx="16" cy="16" r="7" fill="#C97B3C" />
</svg>
```

- [ ] **Step 7: Perbarui `src/pages/index.astro` agar mengirim judul & deskripsi nyata**

```astro
---
import Base from '../layouts/Base.astro';
import { profil } from '../lib/data.js';
---

<Base
  judul={`${profil.nama} — ${profil.tagline}`}
  deskripsi={profil.deskripsi}
>
  <main>
    <section class="bagian">
      <div class="wadah">
        <p class="label">Placeholder — diganti mulai Task 7</p>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 8: Verifikasi output HTML**

```bash
npm run build
```

Lalu buka `dist/index.html` dan pastikan ada:
- Satu blok `<script type="application/ld+json">` berisi `"@type":"CafeOrCoffeeShop"` dengan `openingHoursSpecification` lengkap
- `<title>` berbunyi `Kopi Senja — Ngopi santai di tengah kota`
- Tag `og:image` dengan URL absolut (diawali `https://`, bukan `/img/`)
- `<html lang="id">`

- [ ] **Step 9: Commit**

```bash
git add src/lib/jsonld.js tests/jsonld.test.js src/layouts/Base.astro src/pages/index.astro public/favicon.svg
git commit -m "feat: add full head metadata, Open Graph, and LocalBusiness JSON-LD"
```

---

### Task 7: Section Hero

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `profil` dari Task 5, `linkWAUmum` dari Task 3.
- Produces: Section dengan `id="hero"`. Menyediakan anchor target `#menu` dan `#lokasi` yang diisi Task 9 dan Task 12.

- [ ] **Step 1: Sediakan foto hero sementara**

Aset asli dikerjakan di Task 14. Untuk sekarang buat placeholder berukuran benar agar layout dan CLS bisa diuji sejak awal:

```bash
mkdir -p public/img/menu public/img/suasana
```

```bash
node -e "const s=require('sharp');s({create:{width:1920,height:1080,channels:3,background:'#8C4A2F'}}).webp().toFile('public/img/hero.webp').then(()=>console.log('ok'))"
```

- [ ] **Step 2: Buat `src/components/Hero.astro`**

Judul dipecah per baris dalam `<span>` bersarang: pembungkus luar memotong luapan, pembungkus dalam yang beranimasi `clip-path`. Ini pola standar untuk efek "teks tersingkap dari bawah".

```astro
---
import { profil } from '../lib/data.js';
import { linkWAUmum } from '../lib/wa.js';

const waUmum = linkWAUmum(profil);
const baris = ['Kopi', 'Senja'];
---

<section class="hero" id="hero">
  <img
    class="hero__foto"
    src="/img/hero.webp"
    alt="Suasana bagian dalam kedai Kopi Senja saat sore hari"
    width="1920"
    height="1080"
    fetchpriority="high"
  />

  <div class="wadah hero__isi">
    <p class="label hero__label">Kedai Kopi · Bandung</p>

    <h1 class="hero__judul">
      {
        baris.map((teks, i) => (
          <span class="hero__baris">
            <span style={`--i: ${i}`}>{teks}</span>
          </span>
        ))
      }
    </h1>

    <p class="hero__tagline">{profil.tagline}</p>

    <div class="hero__aksi">
      <a class="tombol tombol--garis" href="#menu">Lihat Menu</a>
      {
        waUmum && (
          <a
            class="tombol tombol--utama"
            href={waUmum}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pesan via WhatsApp
          </a>
        )
      }
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100svh;
    display: grid;
    align-items: end;
    padding-block: clamp(3rem, 8vw, 6rem);
    background: var(--cream);
    overflow: clip;
  }

  /* Foto ditempatkan di kanan dan judul menimpanya — bukan judul
     berdiri sopan di tengah. Ini elemen "berani" dari spec. */
  .hero__foto {
    position: absolute;
    inset: 0 0 0 auto;
    width: min(62%, 900px);
    height: 100%;
    object-fit: cover;
    /* Menyatu ke background cream di sisi kiri supaya judul tetap terbaca */
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      #000 28%,
      #000 100%
    );
  }

  .hero__isi {
    position: relative;
    z-index: 1;
  }

  .hero__label {
    color: var(--terracotta);
    margin-bottom: 1.5rem;
  }

  .hero__judul {
    font-size: var(--fs-hero);
    line-height: 0.85;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
  }

  .hero__baris {
    display: block;
    overflow: hidden;
  }

  .hero__baris > span {
    display: block;
  }

  /* Hanya sembunyikan kalau JS ada — tanpa JS judul langsung terlihat. */
  :global(.js) .hero__baris > span {
    clip-path: inset(100% 0 0 0);
  }

  :global(.js.dimuat) .hero__baris > span {
    animation: singkap 0.9s var(--ease) forwards;
    animation-delay: calc(var(--i) * 90ms);
  }

  @keyframes singkap {
    from {
      clip-path: inset(100% 0 0 0);
    }
    to {
      /* -10% di bawah supaya descender huruf g/y tidak terpotong */
      clip-path: inset(0 0 -10% 0);
    }
  }

  .hero__tagline {
    font-size: clamp(1.125rem, 2vw, 1.5rem);
    max-width: 26ch;
    margin-bottom: 2.5rem;
  }

  .hero__aksi {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  @media (max-width: 48rem) {
    .hero__foto {
      width: 100%;
      mask-image: linear-gradient(to bottom, transparent 0%, #000 45%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.js) .hero__baris > span {
      clip-path: none;
      animation: none;
    }
  }
</style>
```

- [ ] **Step 3: Pasang class `dimuat` setelah halaman siap**

Tambahkan tepat sebelum `</body>` di `src/layouts/Base.astro`:

```astro
    <slot />
    <script is:inline>
      // requestAnimationFrame memastikan class dipasang setelah browser
      // sempat melukis keadaan awal, sehingga animasi benar-benar berjalan
      // alih-alih langsung lompat ke keadaan akhir.
      requestAnimationFrame(() => {
        document.documentElement.classList.add('dimuat');
      });
    </script>
  </body>
```

- [ ] **Step 4: Pakai Hero di `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import { profil } from '../lib/data.js';
---

<Base
  judul={`${profil.nama} — ${profil.tagline}`}
  deskripsi={profil.deskripsi}
>
  <main>
    <Hero />
  </main>
</Base>
```

- [ ] **Step 5: Verifikasi**

```bash
npm run dev
```

Periksa:
- Kata "Kopi" lalu "Senja" tersingkap dari bawah secara bertahap saat halaman dimuat
- Muat ulang beberapa kali — animasi selalu berjalan, tidak pernah lompat langsung
- Kecilkan jendela ke 360px: foto pindah ke belakang teks dengan gradien dari atas, teks tetap terbaca
- DevTools → Rendering → centang "Emulate prefers-reduced-motion": muat ulang, judul langsung terlihat tanpa animasi
- DevTools → Settings → Debugger → centang "Disable JavaScript": muat ulang, judul tetap terlihat

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/layouts/Base.astro src/pages/index.astro public/img/hero.webp
git commit -m "feat: add hero section with clip-path reveal"
```

---

### Task 8: Section Tentang Kami

**Files:**
- Create: `src/components/Tentang.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `profil` dari Task 5.
- Produces: Section `id="tentang"` dengan background `--espresso` — inilah kontras gelap pertama dalam ritme pagi→senja.

- [ ] **Step 1: Buat placeholder foto suasana**

```bash
node -e "const s=require('sharp');const w=[1200,900,900,1400],h=[1600,700,1200,900];Promise.all([1,2,3,4].map((n,i)=>s({create:{width:w[i],height:h[i],channels:3,background:'#8C4A2F'}}).webp().toFile('public/img/suasana/'+n+'.webp'))).then(()=>console.log('ok'))"
```

- [ ] **Step 2: Buat `src/components/Tentang.astro`**

```astro
---
import { profil } from '../lib/data.js';

// Ukuran ditulis eksplisit per foto agar CLS tetap nol.
const foto = [
  { src: '/img/suasana/1.webp', w: 1200, h: 1600, alt: 'Barista menyeduh kopi di balik meja bar' },
  { src: '/img/suasana/2.webp', w: 900, h: 700, alt: 'Meja kayu dengan dua cangkir kopi' },
  { src: '/img/suasana/3.webp', w: 900, h: 1200, alt: 'Sudut baca dengan kursi rotan dan tanaman' },
];
---

<section class="tentang bagian" id="tentang">
  <span class="nomor-bagian">02</span>
  <div class="wadah tentang__grid">
    <div class="tentang__teks reveal" style="--i: 0">
      <p class="label tentang__label">Tentang Kami</p>
      <h2 class="tentang__judul">Tempat yang sengaja dibuat untuk berlama-lama</h2>
      <p class="tentang__paragraf">{profil.deskripsi}</p>
    </div>

    <div class="tentang__kolase">
      {
        foto.map((f, i) => (
          <figure class={`tentang__foto tentang__foto--${i + 1} reveal`} style={`--i: ${i + 1}`}>
            <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" />
          </figure>
        ))
      }
    </div>
  </div>
</section>

<style>
  .tentang {
    background: var(--espresso);
    color: var(--cream);
  }

  .tentang__label {
    color: var(--amber-wash);
    margin-bottom: 1.25rem;
  }

  .tentang__judul {
    font-size: var(--fs-section);
    max-width: 14ch;
    margin-bottom: 1.5rem;
  }

  .tentang__paragraf {
    max-width: 42ch;
    color: var(--cream-muted);
  }

  .tentang__grid {
    display: grid;
    gap: clamp(2.5rem, 6vw, 5rem);
  }

  /* Kolase asimetris: tiga foto dengan tinggi dan offset berbeda,
     bukan grid seragam. */
  .tentang__kolase {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.75rem, 2vw, 1.5rem);
    align-items: start;
  }

  .tentang__foto {
    overflow: hidden;
    border-radius: 4px;
  }

  .tentang__foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tentang__foto--1 {
    grid-row: span 2;
    aspect-ratio: 3 / 4;
  }

  .tentang__foto--2 {
    aspect-ratio: 4 / 3;
  }

  .tentang__foto--3 {
    aspect-ratio: 3 / 4;
    margin-top: clamp(0.75rem, 2vw, 1.5rem);
  }

  @media (min-width: 60rem) {
    .tentang__grid {
      grid-template-columns: 1fr 1.1fr;
      align-items: center;
    }
  }
</style>
```

- [ ] **Step 3: Pakai di `src/pages/index.astro`**

Tambahkan `import Tentang from '../components/Tentang.astro';` dan sisipkan `<Tentang />` tepat setelah `<Hero />`.

- [ ] **Step 4: Verifikasi**

```bash
npm run dev
```

Periksa:
- Background berubah jegur dari cream ke coklat tua saat scroll melewati batas hero
- Teks cream di atas espresso terbaca jelas
- Tiga foto dengan tinggi berbeda, foto pertama memanjang dua baris
- Angka "02" samar di kanan atas
- Di 360px: kolase tetap dua kolom dan tidak menyebabkan scroll horizontal

Elemen `.reveal` masih tak terlihat karena `reveal.js` baru dibuat di Task 11. Untuk sementara, buka DevTools dan jalankan `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('reveal--tampil'))` di console untuk memeriksa layout.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tentang.astro src/pages/index.astro public/img/suasana/
git commit -m "feat: add about section with asymmetric photo collage"
```

---

### Task 9: `MenuCard.astro` dan section Menu

**Files:**
- Create: `src/components/MenuCard.astro`
- Create: `src/components/Menu.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `menu`, `profil`, `KATEGORI` dari Task 5; `linkWAItem` dari Task 3; `formatRupiah` dari Task 2.
- Produces:
  - `MenuCard.astro` menerima props `{ item }` — satu objek dari `menu.json`. Merender `<article class="kartu" data-kategori="...">`.
  - Section `id="menu"` yang berisi `<div class="filter" data-filter>` dengan tombol ber-`data-kategori`, `<div id="menu-grid">` berisi kartu, dan `<p id="menu-status" aria-live="polite">`. Task 10 menyambung ketiga hook ini.

- [ ] **Step 1: Buat placeholder foto menu**

```bash
node -e "const s=require('sharp');const ids=['kopi-susu-senja','espresso','americano','cappuccino','caffe-latte','kopi-tubruk','matcha-latte','cokelat-panas','pisang-goreng-keju','roti-bakar-cokelat'];Promise.all(ids.map(id=>s({create:{width:800,height:800,channels:3,background:'#8C4A2F'}}).webp().toFile('public/img/menu/'+id+'.webp'))).then(()=>console.log('ok'))"
```

- [ ] **Step 2: Buat `src/components/MenuCard.astro`**

```astro
---
import { profil } from '../lib/data.js';
import { linkWAItem } from '../lib/wa.js';
import { formatRupiah } from '../lib/format.js';

const { item } = Astro.props;

// Dibangun saat build, bukan di browser. Hasilnya <a href> biasa:
// nol JavaScript, tetap berfungsi walau JS mati, terbaca crawler.
const linkPesan = linkWAItem(profil, item);
---

<article
  class:list={['kartu', { 'kartu--unggulan': item.unggulan }]}
  data-kategori={item.kategori}
>
  <div class="kartu__media">
    <img
      src={item.foto}
      alt={item.nama}
      width="800"
      height="800"
      loading="lazy"
    />
  </div>

  <div class="kartu__isi">
    <h3 class="kartu__nama">{item.nama}</h3>
    <p class="kartu__deskripsi">{item.deskripsi}</p>
    <p class="kartu__harga">{formatRupiah(item.harga)}</p>

    {
      linkPesan && (
        <a
          class="kartu__pesan"
          href={linkPesan}
          target="_blank"
          rel="noopener noreferrer"
        >
          Pesan
          <span class="visually-hidden">{item.nama} via WhatsApp</span>
          <span aria-hidden="true">→</span>
        </a>
      )
    }
  </div>
</article>

<style>
  .kartu {
    display: flex;
    flex-direction: column;
    background: var(--cream-muted);
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
  }

  .kartu:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px -18px rgb(43 29 21 / 0.45);
  }

  .kartu__media {
    aspect-ratio: 1;
    overflow: hidden;
  }

  .kartu--unggulan .kartu__media {
    aspect-ratio: 16 / 10;
  }

  .kartu__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s var(--ease);
  }

  .kartu:hover .kartu__media img {
    transform: scale(1.06);
  }

  .kartu__isi {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 1.25rem 1.25rem 1.5rem;
  }

  .kartu__nama {
    font-size: var(--fs-card);
    margin-bottom: 0.35rem;
  }

  .kartu__deskripsi {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: color-mix(in srgb, var(--espresso) 72%, transparent);
    margin-bottom: 1rem;
  }

  /* Harga adalah informasi utama di menu, jadi diperlakukan seperti
     judul — Fraunces ukuran besar, bukan teks abu-abu kecil. */
  .kartu__harga {
    font-family: var(--font-display);
    font-size: var(--fs-price);
    font-weight: 700;
    line-height: 1;
    font-variation-settings: 'SOFT' 20, 'WONK' 1;
    margin-top: auto;
    margin-bottom: 1rem;
  }

  .kartu__pesan {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    align-self: flex-start;
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    background: var(--espresso);
    color: var(--cream);
    font-size: 0.9375rem;
    font-weight: 700;
    text-decoration: none;
    transition: background-color 0.3s var(--ease), gap 0.3s var(--ease);
  }

  .kartu__pesan:hover {
    background: var(--terracotta);
    gap: 0.7rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .kartu,
    .kartu__media img,
    .kartu__pesan {
      transition: none;
    }

    .kartu:hover {
      transform: none;
    }

    .kartu:hover .kartu__media img {
      transform: none;
    }
  }
</style>
```

- [ ] **Step 3: Tambahkan `.visually-hidden` dan fallback foto gagal ke `src/styles/global.css`**

Sisipkan setelah blok `.label`:

```css
/* Teks yang hanya dibaca screen reader. Dipakai agar tombol "Pesan"
   punya nama aksesibel yang unik per item, bukan sepuluh tombol
   bernama sama. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

Lalu ubah aturan `img` yang sudah ada di bagian reset menjadi:

```css
img {
  display: block;
  max-width: 100%;
  height: auto;
  /* Kalau foto gagal dimuat, yang tersisa adalah bidang warna palet
     dengan ukuran terjaga — bukan ikon gambar rusak. Berhasil karena
     setiap <img> punya width/height eksplisit, jadi ruangnya sudah
     dipesan sebelum file datang. */
  background: var(--cream-muted);
}
```

Verifikasi fallback-nya berfungsi: di DevTools → Network, blokir pola URL `*/img/menu/*`, lalu muat ulang. Kartu harus menampilkan bidang cream dengan teks alt, bukan ikon rusak, dan tata letak tidak boleh bergeser sama sekali.

- [ ] **Step 4: Buat `src/components/Menu.astro`**

```astro
---
import MenuCard from './MenuCard.astro';
import { menu, KATEGORI } from '../lib/data.js';

const tombolFilter = [{ id: 'semua', label: 'Semua' }, ...KATEGORI];
---

<section class="menu bagian" id="menu">
  <span class="nomor-bagian">03</span>
  <div class="wadah">
    <div class="menu__kepala reveal" style="--i: 0">
      <p class="label menu__label">Menu</p>
      <h2 class="menu__judul">Sepuluh alasan untuk mampir</h2>
    </div>

    <!-- Disembunyikan tanpa JS lewat CSS: filter tanpa JavaScript
         hanya akan jadi tombol mati. -->
    <div class="filter" data-filter role="group" aria-label="Saring menu berdasarkan kategori">
      {
        tombolFilter.map((k) => (
          <button
            type="button"
            class="filter__tombol"
            data-kategori={k.id}
            aria-pressed={k.id === 'semua' ? 'true' : 'false'}
          >
            {k.label}
          </button>
        ))
      }
    </div>

    <p class="visually-hidden" id="menu-status" aria-live="polite"></p>

    <div class="menu__grid" id="menu-grid">
      {menu.map((item, i) => (
        <div class="reveal" style={`--i: ${i % 3}`}>
          <MenuCard item={item} />
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .menu {
    background: var(--cream);
  }

  .menu__label {
    color: var(--terracotta);
    margin-bottom: 1rem;
  }

  .menu__judul {
    font-size: var(--fs-section);
    max-width: 16ch;
    margin-bottom: 2.5rem;
  }

  .filter {
    display: none;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
  }

  :global(.js) .filter {
    display: flex;
  }

  .filter__tombol {
    padding: 0.55rem 1.25rem;
    border: 2px solid color-mix(in srgb, var(--espresso) 25%, transparent);
    border-radius: 999px;
    background: transparent;
    color: var(--espresso);
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.25s var(--ease),
      border-color 0.25s var(--ease), color 0.25s var(--ease);
  }

  .filter__tombol:hover {
    border-color: var(--espresso);
  }

  .filter__tombol[aria-pressed='true'] {
    background: var(--espresso);
    border-color: var(--espresso);
    color: var(--cream);
  }

  .menu__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(1rem, 2.5vw, 1.75rem);
  }

  /* Kartu yang disembunyikan filter. Transisi ada di sini supaya
     kartu memudar, bukan hilang mendadak. */
  .menu__grid > div {
    transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
  }

  .menu__grid > div[hidden] {
    display: none;
  }

  .menu__grid > div.menu__kartu--pudar {
    opacity: 0;
    transform: scale(0.96);
  }

  @media (min-width: 40rem) {
    .menu__grid {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Item unggulan mengambil dua kolom — inilah yang membuat grid
       asimetris, bukan 3x4 seragam. */
    .menu__grid > div:has(.kartu--unggulan) {
      grid-column: span 2;
    }
  }

  @media (min-width: 64rem) {
    .menu__grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu__grid > div,
    .filter__tombol {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 5: Pakai di `src/pages/index.astro`**

Tambahkan `import Menu from '../components/Menu.astro';` dan sisipkan `<Menu />` setelah `<Tentang />`.

- [ ] **Step 6: Verifikasi**

```bash
npm run build && npm run preview
```

Periksa di `dist/index.html` (bukan hanya di browser):
- Setiap kartu punya `<a href="https://wa.me/6281234567890?text=..."` yang **sudah jadi di HTML**. Ini bukti fitur andalan berjalan saat build. Kalau `href`-nya kosong atau berisi `#`, ada yang salah.
- Grid menampilkan 3 kolom di 1440px, 2 kolom di 768px, 1 kolom di 360px
- Kartu "Kopi Susu Senja" dan "Matcha Latte" melebar dua kolom
- Hover pada kartu: kartu naik, foto membesar halus
- Klik "Pesan" pada Kopi Susu Senja → tab WhatsApp terbuka dengan teks `Halo Kopi Senja, saya mau pesan Kopi Susu Senja (Rp 18.000). Apakah tersedia?`

- [ ] **Step 7: Commit**

```bash
git add src/components/MenuCard.astro src/components/Menu.astro src/styles/global.css src/pages/index.astro public/img/menu/
git commit -m "feat: add menu grid with build-time WhatsApp order links"
```

---

### Task 10: `filter.js` — filter kategori

**Files:**
- Create: `src/scripts/filter.js`
- Modify: `src/components/Menu.astro`

**Interfaces:**
- Consumes: hook DOM dari Task 9 — `[data-filter]`, `#menu-grid`, `#menu-status`, atribut `data-kategori` pada tombol dan kartu.
- Produces: —

- [ ] **Step 1: Buat `src/scripts/filter.js`**

```js
/**
 * Filter kategori menu.
 *
 * Memakai satu event listener di container tombol (event delegation),
 * bukan satu listener per tombol. Kalau nanti kategori bertambah lewat
 * menu.json, tidak ada kode di sini yang perlu diubah.
 */
export function pasangFilter() {
  const wadahFilter = document.querySelector('[data-filter]');
  const grid = document.querySelector('#menu-grid');
  const status = document.querySelector('#menu-status');

  if (!wadahFilter || !grid || !status) return;

  const pembungkus = Array.from(grid.children);
  const gerakDimatikan = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function terapkan(kategori) {
    let terlihat = 0;

    pembungkus.forEach((el) => {
      const kartu = el.querySelector('.kartu');
      const cocok = kategori === 'semua' || kartu.dataset.kategori === kategori;

      if (cocok) terlihat += 1;

      if (gerakDimatikan) {
        el.hidden = !cocok;
        return;
      }

      if (cocok) {
        el.hidden = false;
        // Dibaca dulu agar browser menerapkan display:block sebelum
        // class pudar dilepas — tanpa ini transisi tidak berjalan.
        void el.offsetWidth;
        el.classList.remove('menu__kartu--pudar');
      } else {
        el.classList.add('menu__kartu--pudar');
        setTimeout(() => {
          if (el.classList.contains('menu__kartu--pudar')) el.hidden = true;
        }, 300);
      }
    });

    status.textContent = `Menampilkan ${terlihat} item.`;

    wadahFilter.querySelectorAll('[data-kategori]').forEach((tombol) => {
      tombol.setAttribute(
        'aria-pressed',
        String(tombol.dataset.kategori === kategori)
      );
    });
  }

  wadahFilter.addEventListener('click', (e) => {
    const tombol = e.target.closest('[data-kategori]');
    if (!tombol) return;
    terapkan(tombol.dataset.kategori);
  });
}
```

- [ ] **Step 2: Panggil dari `src/components/Menu.astro`**

Tambahkan tepat sebelum blok `<style>`:

```astro
<script>
  import { pasangFilter } from '../scripts/filter.js';
  pasangFilter();
</script>
```

Astro akan mem-bundle dan memuat modul ini otomatis. Tag `<script>` tanpa `is:inline` diproses Astro — tidak perlu `defer`, dan modul ES selalu berjalan setelah DOM selesai di-parse.

- [ ] **Step 3: Verifikasi fungsional**

```bash
npm run dev
```

Periksa:
- Klik "Kopi" → tersisa 6 kartu, kartu lain memudar lalu hilang
- Klik "Non-Kopi" → tersisa 2 kartu
- Klik "Snack" → tersisa 2 kartu
- Klik "Semua" → kembali 10 kartu
- Tombol aktif berlatar coklat tua

- [ ] **Step 4: Verifikasi aksesibilitas**

- Tab ke tombol filter, tekan **Enter** lalu **Space** — keduanya harus memicu filter (`<button>` bawaan sudah menangani ini; kalau tidak jalan berarti elemennya bukan `<button>`)
- DevTools → Elements → pilih tombol aktif, pastikan `aria-pressed="true"` dan tombol lain `"false"`
- DevTools → Accessibility pane → periksa `#menu-status` berisi teks seperti `Menampilkan 6 item.` setelah filter diklik
- Aktifkan reduced-motion, klik filter — kartu berganti seketika tanpa transisi, jumlahnya tetap benar

- [ ] **Step 5: Verifikasi tanpa JavaScript**

DevTools → Settings → Debugger → Disable JavaScript, muat ulang:
- Deretan tombol filter **tidak terlihat sama sekali**
- Kesepuluh kartu tampil
- Tombol "Pesan" tetap berfungsi

- [ ] **Step 6: Commit**

```bash
git add src/scripts/filter.js src/components/Menu.astro
git commit -m "feat: add accessible category filter with event delegation"
```

---

### Task 11: `reveal.js` — fade-in saat scroll

**Files:**
- Create: `src/scripts/reveal.js`
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: class `.reveal` dan custom property `--i` yang sudah dipasang di Task 8 dan 9.
- Produces: —

- [ ] **Step 1: Buat `src/scripts/reveal.js`**

```js
/**
 * Fade-in saat elemen masuk viewport.
 *
 * Dua detail yang membedakannya dari implementasi asal jadi:
 * 1. Elemen di-unobserve setelah muncul — observer tidak terus bekerja
 *    sepanjang halaman di-scroll, dan elemen tidak beranimasi ulang
 *    saat pengguna scroll balik ke atas.
 * 2. Kalau pengguna meminta reduced motion, observer tidak dibuat sama
 *    sekali dan semua elemen langsung ditandai terlihat.
 */
export function pasangReveal() {
  const elemen = document.querySelectorAll('.reveal');
  if (elemen.length === 0) return;

  const gerakDimatikan = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (gerakDimatikan || !('IntersectionObserver' in window)) {
    elemen.forEach((el) => el.classList.add('reveal--tampil'));
    return;
  }

  const pengamat = new IntersectionObserver(
    (entri, obs) => {
      entri.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('reveal--tampil');
        obs.unobserve(e.target);
      });
    },
    {
      threshold: 0.15,
      // Menunda pemicu sedikit supaya elemen sudah agak masuk layar,
      // bukan muncul tepat saat menyentuh tepi bawah.
      rootMargin: '0px 0px -10% 0px',
    }
  );

  elemen.forEach((el) => pengamat.observe(el));
}
```

- [ ] **Step 2: Panggil dari `src/layouts/Base.astro`**

Ganti blok `<script is:inline>` yang memasang class `dimuat` (dari Task 7 Step 3) menjadi:

```astro
    <slot />
    <script>
      import { pasangReveal } from '../scripts/reveal.js';

      pasangReveal();

      requestAnimationFrame(() => {
        document.documentElement.classList.add('dimuat');
      });
    </script>
  </body>
```

- [ ] **Step 3: Verifikasi**

```bash
npm run dev
```

Periksa:
- Scroll perlahan ke Tentang Kami — teks lalu foto muncul bertahap, bukan serentak
- Scroll ke Menu — judul lalu kartu-kartu muncul, kartu dalam satu baris punya jeda 90ms antar kolom
- Scroll balik ke atas lalu turun lagi — elemen **tidak** beranimasi ulang
- DevTools → Performance → rekam sambil scroll: tidak ada long task berulang dari observer
- Aktifkan reduced-motion, muat ulang — semua langsung terlihat, tidak ada gerakan sama sekali
- Matikan JavaScript, muat ulang — semua konten terlihat (CSS `.reveal` hanya aktif di bawah `.js`)

- [ ] **Step 4: Commit**

```bash
git add src/scripts/reveal.js src/layouts/Base.astro
git commit -m "feat: add scroll reveal with unobserve and reduced-motion support"
```

---

### Task 12: Section Lokasi, `StatusBadge`, dan `status.js`

**Files:**
- Create: `src/components/StatusBadge.astro`
- Create: `src/components/Lokasi.astro`
- Create: `src/scripts/status.js`
- Modify: `src/data/profil.json`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `profil` dari Task 5; `hitungStatus` dari Task 4.
- Produces: Section `id="lokasi"`. `StatusBadge.astro` merender `<p class="badge" data-badge>` berisi jadwal statis; `status.js` menggantinya dengan status langsung.

- [ ] **Step 1: Isi `mapsEmbed` dan `mapsLink` di `src/data/profil.json`**

1. Buka [google.com/maps](https://www.google.com/maps), cari `Jl. Cikapundung Barat, Bandung`
2. Klik **Bagikan** → tab **Sematkan peta** → salin **hanya nilai atribut `src`** dari kode iframe → tempel ke `mapsEmbed`
3. Klik **Bagikan** → tab **Kirim tautan** → salin URL → tempel ke `mapsLink`
4. Klik kanan pada titik peta → salin koordinat → sesuaikan `koordinat.lat` dan `koordinat.lng`. Koordinat ini juga dipakai JSON-LD, jadi harus menunjuk titik yang sama.

- [ ] **Step 2: Buat `src/components/StatusBadge.astro`**

Dirender saat build dalam keadaan netral berisi jadwal statis. Tanpa JavaScript pengunjung tetap membaca jadwal yang benar — hanya tidak tahu statusnya sekarang.

```astro
---
import { profil } from '../lib/data.js';

const jadwalRingkas = profil.jam
  .map((b) => `${b.label} ${b.buka}–${b.tutup}`)
  .join(' · ');
---

<p class="badge" data-badge data-keadaan="netral">
  <span class="badge__titik" aria-hidden="true"></span>
  <span data-badge-teks>{jadwalRingkas}</span>
</p>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--espresso) 12%, transparent);
    font-size: 0.9375rem;
    font-weight: 700;
  }

  .badge__titik {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--espresso) 45%, transparent);
    flex-shrink: 0;
  }

  .badge[data-keadaan='buka'] .badge__titik {
    background: #2e7d4f;
  }

  .badge[data-keadaan='segera-tutup'] .badge__titik {
    background: var(--amber);
  }

  .badge[data-keadaan='tutup'] .badge__titik {
    background: color-mix(in srgb, var(--espresso) 45%, transparent);
  }
</style>
```

- [ ] **Step 3: Buat `src/scripts/status.js`**

```js
import { hitungStatus } from '../lib/status.js';
import profil from '../data/profil.json';

/**
 * Mengganti isi badge dengan status langsung.
 *
 * BATASAN: memakai zona waktu perangkat pengunjung, bukan WIB.
 * Lihat komentar di src/lib/status.js.
 */
export function pasangStatus() {
  const badge = document.querySelector('[data-badge]');
  if (!badge) return;

  const teks = badge.querySelector('[data-badge-teks]');
  const { keadaan, label } = hitungStatus(new Date(), profil.jam);

  badge.dataset.keadaan = keadaan;
  teks.textContent = label;
}
```

- [ ] **Step 4: Buat `src/components/Lokasi.astro`**

```astro
---
import StatusBadge from './StatusBadge.astro';
import { profil } from '../lib/data.js';
---

<section class="lokasi bagian" id="lokasi">
  <span class="nomor-bagian">04</span>
  <div class="wadah lokasi__grid">
    <div class="lokasi__info reveal" style="--i: 0">
      <p class="label lokasi__label">Lokasi &amp; Jam Buka</p>
      <h2 class="lokasi__judul">Mampir sore, waktu paling enak</h2>

      <StatusBadge />

      <address class="lokasi__alamat">{profil.alamat}</address>

      <ul class="lokasi__jam">
        {
          profil.jam.map((b) => (
            <li>
              <span>{b.label}</span>
              <span>{b.buka} – {b.tutup}</span>
            </li>
          ))
        }
      </ul>

      <a
        class="tombol tombol--garis"
        href={profil.mapsLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Buka di Google Maps
      </a>
    </div>

    <div class="lokasi__peta reveal" style="--i: 1">
      {
        profil.mapsEmbed && (
          <iframe
            src={profil.mapsEmbed}
            title={`Peta lokasi ${profil.nama}`}
            width="600"
            height="450"
            style="border:0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          />
        )
      }
    </div>
  </div>
</section>

<script>
  import { pasangStatus } from '../scripts/status.js';
  pasangStatus();
</script>

<style>
  .lokasi {
    background: var(--amber-wash);
    color: var(--espresso);
  }

  .lokasi__label {
    color: var(--terracotta);
    margin-bottom: 1rem;
  }

  .lokasi__judul {
    font-size: var(--fs-section);
    max-width: 14ch;
    margin-bottom: 1.75rem;
  }

  .lokasi__alamat {
    font-style: normal;
    margin: 1.5rem 0;
    max-width: 30ch;
  }

  .lokasi__jam {
    margin-bottom: 2rem;
    border-top: 1px solid color-mix(in srgb, var(--espresso) 20%, transparent);
  }

  .lokasi__jam li {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--espresso) 20%, transparent);
  }

  .lokasi__grid {
    display: grid;
    gap: clamp(2.5rem, 5vw, 4rem);
  }

  .lokasi__peta {
    border-radius: 6px;
    overflow: hidden;
    min-height: 22rem;
    background: color-mix(in srgb, var(--espresso) 10%, transparent);
  }

  .lokasi__peta iframe {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 22rem;
  }

  @media (min-width: 60rem) {
    .lokasi__grid {
      grid-template-columns: 1fr 1.2fr;
      align-items: center;
    }
  }
</style>
```

- [ ] **Step 5: Pakai di `src/pages/index.astro`**

Tambahkan `import Lokasi from '../components/Lokasi.astro';` dan sisipkan `<Lokasi />` setelah `<Menu />`.

- [ ] **Step 6: Verifikasi**

```bash
npm run dev
```

Periksa:
- Peta tampil dan menunjukkan lokasi Cikapundung yang benar
- Badge menampilkan status sesuai jam sekarang di mesinmu

Untuk menguji ketiga keadaan tanpa menunggu waktu berjalan, ubah jam sistem, **atau** jalankan di console DevTools:

```js
// Paksa keadaan segera-tutup untuk memeriksa tampilannya
document.querySelector('[data-badge]').dataset.keadaan = 'segera-tutup';
document.querySelector('[data-badge-teks]').textContent = 'Segera tutup · 22:00';
```

Lalu periksa titik indikatornya berubah warna sesuai keadaan (hijau / amber / abu).

- Matikan JavaScript, muat ulang → badge menampilkan `Senin–Jumat 08:00–22:00 · Sabtu–Minggu 09:00–23:00` dengan titik abu netral, alamat dan tautan Maps tetap berfungsi
- Tutup akses jaringan ke `google.com` (DevTools → Network → block request URL `*google.com*`), muat ulang → iframe kosong tapi alamat dan tombol "Buka di Google Maps" tetap ada

- [ ] **Step 7: Commit**

```bash
git add src/components/StatusBadge.astro src/components/Lokasi.astro src/scripts/status.js src/data/profil.json src/pages/index.astro
git commit -m "feat: add location section with live open/closed badge"
```

---

### Task 13: Footer

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `profil` dari Task 5; `linkWAUmum` dari Task 3.
- Produces: `<footer>` dengan background `--espresso-deep` — akhir dari ritme pagi→senja.

- [ ] **Step 1: Buat `src/components/Footer.astro`**

```astro
---
import { profil } from '../lib/data.js';
import { linkWAUmum } from '../lib/wa.js';

const waUmum = linkWAUmum(profil);
const tahun = 2026;
---

<footer class="footer" id="kontak">
  <span class="nomor-bagian">05</span>
  <div class="wadah footer__grid">
    <div class="reveal" style="--i: 0">
      <p class="footer__nama">{profil.nama}</p>
      <p class="footer__tagline">{profil.tagline}</p>
    </div>

    <nav class="footer__tautan reveal" style="--i: 1" aria-label="Kontak">
      {
        waUmum && (
          <a href={waUmum} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )
      }
      <a
        href={`https://instagram.com/${profil.instagram}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram
      </a>
      <a href="#menu">Menu</a>
      <a href="#lokasi">Lokasi</a>
    </nav>

    <address class="footer__alamat reveal" style="--i: 2">
      {profil.alamat}
    </address>
  </div>

  <div class="wadah footer__bawah">
    <p>© {tahun} {profil.nama}. Bisnis fiktif untuk keperluan portofolio.</p>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    background: var(--espresso-deep);
    color: var(--cream);
    padding-block: clamp(4rem, 8vw, 7rem) 2rem;
    overflow: clip;
  }

  .footer__grid {
    display: grid;
    gap: 2.5rem;
    padding-bottom: 3rem;
  }

  .footer__nama {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 700;
    line-height: 1;
    font-variation-settings: 'SOFT' 20, 'WONK' 1;
  }

  .footer__tagline {
    color: var(--amber-wash);
    margin-top: 0.5rem;
  }

  .footer__tautan {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .footer__tautan a {
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.25s var(--ease), color 0.25s var(--ease);
  }

  .footer__tautan a:hover {
    color: var(--amber-wash);
    border-bottom-color: currentColor;
  }

  .footer__alamat {
    font-style: normal;
    color: var(--cream-muted);
    max-width: 24ch;
  }

  .footer__bawah {
    padding-top: 2rem;
    border-top: 1px solid color-mix(in srgb, var(--cream) 18%, transparent);
    font-size: 0.875rem;
    color: color-mix(in srgb, var(--cream) 65%, transparent);
  }

  @media (min-width: 48rem) {
    .footer__grid {
      grid-template-columns: 1.5fr 1fr 1fr;
      align-items: start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer__tautan a {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 2: Pakai di `src/pages/index.astro`**

File akhirnya menjadi:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import Tentang from '../components/Tentang.astro';
import Menu from '../components/Menu.astro';
import Lokasi from '../components/Lokasi.astro';
import Footer from '../components/Footer.astro';
import { profil } from '../lib/data.js';
---

<Base
  judul={`${profil.nama} — ${profil.tagline}`}
  deskripsi={profil.deskripsi}
>
  <main>
    <Hero />
    <Tentang />
    <Menu />
    <Lokasi />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 3: Verifikasi ritme background lengkap**

```bash
npm run dev
```

Scroll dari atas ke bawah dan pastikan urutannya persis: cream → espresso → cream → amber-wash → espresso-deep. Inilah perjalanan pagi ke senja dari spec. Kalau ada dua section bersebelahan dengan warna sama, ritmenya rusak.

Klik tautan "Menu" dan "Lokasi" di footer — halaman harus scroll ke section yang benar.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add footer completing the dawn-to-dusk background rhythm"
```

---

### Task 14: Aset foto asli

Mengganti seluruh placeholder warna solid dengan foto sungguhan. Ini penentu terbesar apakah situs F&B terlihat profesional.

**Files:**
- Create: `scripts/optimasi-foto.mjs`
- Create: `raw/` (tidak di-commit)
- Modify: `.gitignore`
- Replace: seluruh isi `public/img/`
- Create: `public/img/og-image.jpg`

**Interfaces:**
- Consumes: nama file yang sudah dirujuk `menu.json` dan `Tentang.astro`.
- Produces: —

- [ ] **Step 1: Kumpulkan foto mentah**

Unduh dari [Unsplash](https://unsplash.com) atau [Pexels](https://pexels.com). **Kriteria kurasi — ini yang menentukan hasilnya, bukan langkah teknis di bawah:**

- Semua warm-tone. Tolak foto yang cenderung biru atau abu dingin, seberapapun bagusnya.
- Arah cahaya serupa di seluruh set — pilih satu arah (misal dari kiri) dan konsisten.
- Framing seragam untuk foto menu: semua top-down, atau semua 45°. Jangan campur.
- Latar sederhana. Foto minuman dengan meja kayu polos lebih baik daripada foto dengan banyak properti.

Simpan dengan nama persis seperti berikut di folder `raw/`:

```
raw/hero.jpg
raw/menu/kopi-susu-senja.jpg
raw/menu/espresso.jpg
raw/menu/americano.jpg
raw/menu/cappuccino.jpg
raw/menu/caffe-latte.jpg
raw/menu/kopi-tubruk.jpg
raw/menu/matcha-latte.jpg
raw/menu/cokelat-panas.jpg
raw/menu/pisang-goreng-keju.jpg
raw/menu/roti-bakar-cokelat.jpg
raw/suasana/1.jpg
raw/suasana/2.jpg
raw/suasana/3.jpg
raw/suasana/4.jpg
```

Catat nama fotografer dan tautan tiap foto — dipakai di README pada Task 15.

- [ ] **Step 2: Tambahkan `raw/` ke `.gitignore`**

```bash
printf 'raw/\n' >> .gitignore
```

Foto mentah bisa puluhan MB dan tidak perlu masuk repo — hanya hasil optimasinya yang di-commit.

- [ ] **Step 3: Buat `scripts/optimasi-foto.mjs`**

```js
/**
 * Ubah foto mentah di raw/ menjadi WebP teroptimasi di public/img/.
 *
 * Dijadikan skrip, bukan langkah manual, supaya hasilnya bisa diulang
 * persis kalau suatu saat fotonya diganti.
 *
 * Jalankan: node scripts/optimasi-foto.mjs
 */
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const TUGAS = [
  { dari: 'raw', ke: 'public/img', file: 'hero.jpg', w: 1920, h: 1080 },
  { dari: 'raw/menu', ke: 'public/img/menu', semua: true, w: 800, h: 800 },
  { dari: 'raw/suasana', ke: 'public/img/suasana', semua: true, w: 1400 },
];

for (const tugas of TUGAS) {
  await mkdir(tugas.ke, { recursive: true });

  const daftar = tugas.semua
    ? (await readdir(tugas.dari)).filter((f) => /\.(jpe?g|png)$/i.test(f))
    : [tugas.file];

  for (const nama of daftar) {
    const keluaran = join(tugas.ke, nama.replace(/\.\w+$/, '.webp'));

    await sharp(join(tugas.dari, nama))
      .resize(tugas.w, tugas.h, {
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
await sharp('raw/hero.jpg')
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 82 })
  .toFile('public/img/og-image.jpg');

console.log('public/img/og-image.jpg — 1200x630');
```

- [ ] **Step 4: Jalankan skrip**

```bash
node scripts/optimasi-foto.mjs
```

Expected: satu baris per file, semuanya berakhir `.webp` kecuali `og-image.jpg`. Ukuran foto menu harus tercetak `800x800`.

- [ ] **Step 5: Sesuaikan ukuran foto suasana di `Tentang.astro`**

Skrip memakai `fit: 'inside'` untuk foto suasana, jadi tingginya mengikuti rasio asli dan **kemungkinan besar berbeda** dari angka `w`/`h` yang ditulis di Task 8. Ambil angka nyata dari output Step 4 dan perbarui array `foto` di `src/components/Tentang.astro` agar cocok.

Angka yang salah di sini akan langsung terlihat sebagai CLS di Lighthouse — inilah alasan `width`/`height` wajib ditulis eksplisit.

- [ ] **Step 6: Perbarui teks `alt` di `Tentang.astro` dan `Hero.astro`**

Teks `alt` di Task 7 dan 8 ditulis untuk placeholder. Ganti dengan deskripsi foto yang sebenarnya. `alt` yang tidak cocok dengan gambarnya lebih buruk daripada tidak ada `alt`.

- [ ] **Step 7: Verifikasi ukuran total**

```bash
du -sh public/img
```

Expected: di bawah 3 MB total. Kalau lebih, turunkan `quality` ke 75 dan jalankan ulang.

- [ ] **Step 8: Commit**

```bash
git add scripts/optimasi-foto.mjs public/img/ src/components/Tentang.astro src/components/Hero.astro .gitignore
git commit -m "feat: replace placeholders with curated and optimized photos"
```

---

### Task 15: Verifikasi akhir, README, dan deploy

**Files:**
- Create: `README.md`
- Modify: file manapun yang gagal verifikasi

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: situs ter-deploy dan README portofolio.

- [ ] **Step 1: Jalankan seluruh test**

```bash
npm test
```

Expected: PASS — 36 test lulus. Jika ada yang gagal, perbaiki sebelum lanjut.

- [ ] **Step 2: Build produksi dan jalankan preview**

```bash
npm run build && npm run preview
```

Seluruh langkah berikut diuji pada URL preview ini, **bukan** `npm run dev`. Dev server tidak melakukan minifikasi dan skornya akan menyesatkan.

- [ ] **Step 3: Lighthouse — target ≥ 95 di keempat kategori**

DevTools → Lighthouse → mode Navigation, device Mobile lalu Desktop.

Kalau ada yang di bawah 95, penyebab tersering berurutan:
- **Performance rendah** → foto belum WebP, atau `hero.webp` terlalu besar. Cek panel Network, urutkan berdasarkan ukuran.
- **CLS > 0** → ada `<img>` tanpa `width`/`height`, atau angkanya tidak cocok dengan file aslinya (lihat Task 14 Step 5).
- **Accessibility rendah** → kontras warna gagal, atau ada tombol tanpa nama aksesibel.
- **SEO rendah** → `<meta name="description">` kosong, atau `site` di `astro.config.mjs` belum diisi.

Simpan screenshot hasilnya untuk README.

- [ ] **Step 4: Verifikasi kontras warna**

Buka [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) dan periksa setiap pasangan berikut. Ambang: **4.5:1** untuk teks normal, **3:1** untuk teks besar (≥ 24px atau ≥ 19px tebal).

| Latar | Teks | Ambang |
|---|---|---|
| `#F7F0E6` | `#2B1D15` | 4.5:1 |
| `#2B1D15` | `#F7F0E6` | 4.5:1 |
| `#2B1D15` | `#EFE4D4` | 4.5:1 |
| `#E8C99B` | `#2B1D15` | 4.5:1 |
| `#F7F0E6` | `#8C4A2F` | 4.5:1 |
| `#E8C99B` | `#8C4A2F` | 4.5:1 |
| `#1A110C` | `#E8C99B` | 4.5:1 |

Pasangan paling berisiko adalah `--terracotta` di atas `--amber-wash` (label "Lokasi & Jam Buka"). Kalau gagal, gelapkan `--terracotta` sampai lolos — **jangan** turunkan standarnya, dan perbarui nilainya di `tokens.css` sehingga seluruh situs ikut berubah.

- [ ] **Step 5: Verifikasi keyboard**

Muat ulang, lalu tekan Tab dari atas sampai footer tanpa menyentuh mouse:
- Setiap elemen interaktif punya focus ring amber yang jelas terlihat, di background terang maupun gelap
- Urutan fokus mengikuti urutan visual dari atas ke bawah
- Tombol filter bisa dipicu dengan Enter dan Space
- Semua tombol "Pesan" terjangkau, dan screen reader membacanya sebagai nama berbeda (berkat `.visually-hidden`)
- Tidak ada jebakan fokus — Tab selalu bisa lanjut

- [ ] **Step 6: Verifikasi lintas viewport**

DevTools device toolbar, ukur di 360px, 768px, dan 1440px. Di setiap ukuran:
- Tidak ada scroll horizontal (uji: `document.documentElement.scrollWidth <= window.innerWidth` di console harus `true`)
- Judul hero tidak terpotong dan tidak meluber
- Grid menu berturut-turut 1, 2, dan 3 kolom
- Peta tidak melebihi lebar layar

- [ ] **Step 7: Verifikasi reduced motion**

Aktifkan di OS (Windows: Settings → Accessibility → Visual effects → Animation effects → Off), muat ulang:
- Judul hero langsung terlihat, tidak tersingkap
- Tidak ada fade-in saat scroll
- Filter mengganti kartu seketika
- Hover kartu tidak bergerak

- [ ] **Step 8: Verifikasi tanpa JavaScript**

DevTools → Settings → Debugger → Disable JavaScript, muat ulang:
- Seluruh 10 kartu menu tampil
- Deretan tombol filter tidak terlihat
- Setiap tombol "Pesan" berfungsi dan membuka WhatsApp dengan pesan terisi
- Badge menampilkan jadwal statis
- Semua konten terlihat, tidak ada yang tersembunyi

- [ ] **Step 9: Verifikasi link WhatsApp dari perangkat asli**

Buka situs preview dari ponsel (via alamat IP lokal, mis. `http://192.168.1.5:4321`). Klik "Pesan" pada beberapa item berbeda. WhatsApp harus terbuka dengan nama item dan harga yang benar — termasuk pada "Caffè Latte" yang mengandung karakter beraksen.

- [ ] **Step 10: Validasi JSON-LD**

Buka [search.google.com/test/rich-results](https://search.google.com/test/rich-results), tempel isi `dist/index.html`. Expected: terdeteksi sebagai item `LocalBusiness` tanpa error. Peringatan tentang field opsional boleh diabaikan.

- [ ] **Step 11: Deploy**

Push ke GitHub, lalu hubungkan ke Netlify atau Vercel. Build command `npm run build`, publish directory `dist`.

Setelah domain diketahui, perbarui `site` di `astro.config.mjs` dan deploy ulang — `og:image` dan `canonical` bergantung pada nilai itu untuk menghasilkan URL absolut.

- [ ] **Step 12: Tulis `README.md`**

README adalah bagian dari karya portofolio, bukan formalitas — sering dibaca sebelum situsnya dibuka. Gunakan kerangka ini dan isi dengan hasil sebenarnya:

```markdown
# Kopi Senja

Situs company profile untuk kedai kopi fiktif di Bandung. Dibangun sebagai karya portofolio.

**[Lihat situsnya →](URL_DEPLOY)**

![Tampilan desktop](docs/screenshot-desktop.png)
![Tampilan mobile](docs/screenshot-mobile.png)

## Keputusan desain

**Palet diturunkan dari nama brand.** "Senja" berarti golden hour, jadi seluruh warna diambil dari cahaya sore: cream, espresso, amber, terakota. Background halaman bergerak dari terang ke gelap-hangat seiring scroll — perjalanan pagi ke senja.

**Link WhatsApp dibangun saat build, bukan di browser.** Tombol "Pesan" di setiap kartu menu menghasilkan `<a href>` biasa yang sudah berisi nama item dan harga. Konsekuensinya: nol JavaScript untuk fitur utama, tetap berfungsi walau JS mati, dan terbaca crawler. Alasannya UMKM F&B di Indonesia berjualan lewat WhatsApp, bukan lewat keranjang belanja — jadi fitur ini yang paling dekat dengan transaksi.

**Konten dipisah dari tampilan.** Seluruh menu ada di `src/data/menu.json`, seluruh identitas kedai di `profil.json`. Menambah item menu berarti menambah satu objek JSON, bukan menyalin blok HTML.

**Galeri dihapus dari rancangan awal.** Galeri grid adalah section yang paling sering dilewati dan paling boros bandwidth. Foto suasana didistribusikan ke Tentang Kami dan Lokasi.

**Animasi filter sengaja disederhanakan.** Kartu yang tersisa berpindah tanpa animasi geser. Animasi geser (teknik FLIP) jauh lebih rumit dan rawan bug — tidak sepadan untuk keuntungan visual yang kecil.

## Aksesibilitas

- Seluruh animasi mati saat `prefers-reduced-motion: reduce`
- Filter kategori memakai `aria-pressed` dan mengumumkan jumlah hasil lewat region `aria-live`
- Situs berfungsi penuh tanpa JavaScript
- Setiap pasangan warna teks/latar lolos WCAG AA

## Performa

Skor Lighthouse pada build produksi:

![Skor Lighthouse](docs/lighthouse.png)

## Menjalankan secara lokal

​```bash
npm install
npm run dev
​```

Perintah lain: `npm test` (menjalankan test unit), `npm run build`, `npm run preview`.

Untuk mengganti foto: letakkan file mentah di `raw/` dengan nama yang sama, lalu jalankan `node scripts/optimasi-foto.mjs`.

## Batasan yang diketahui

- Badge buka/tutup memakai zona waktu perangkat pengunjung, bukan WIB. Pengunjung dari luar Indonesia akan melihat status yang salah.
- Jam tutup yang melewati tengah malam tidak didukung.

## Kredit foto

(Daftar nama fotografer dan tautan tiap foto dari Unsplash/Pexels.)

## Catatan

Kopi Senja adalah bisnis fiktif. Alamat, nomor telepon, dan harga bukan data asli.
```

- [ ] **Step 13: Commit akhir**

```bash
git add README.md docs/
git commit -m "docs: add portfolio README with design rationale and audit results"
```

---

## Catatan Penyimpangan dari Spec

Dicatat agar terlihat jelas dan bisa ditolak kalau tidak disetujui:

1. **Spec menyatakan "tanpa unit test"; rencana ini memakai Vitest untuk empat modul di `src/lib/`.** Alasannya `wa.js`, `format.js`, `status.js`, dan `data.js` adalah logika murni dengan edge case nyata (encoding URL, batas jam, hari tidak terjadwal, kategori tak dikenal). Komponen visual tetap tidak di-test — diverifikasi manual sesuai checklist spec, yang seluruhnya masuk ke Task 15.

2. **`profil.json` mendapat field `alamatStruktur`** yang tidak ada di spec. JSON-LD `PostalAddress` memerlukan jalan, kota, provinsi, dan kode pos sebagai field terpisah; satu string alamat tidak cukup. Field `alamat` tetap ada untuk ditampilkan di halaman.

3. **Ditambahkan `scripts/optimasi-foto.mjs`.** Spec menyebut optimasi foto sebagai kebutuhan tapi tidak menentukan caranya. Dijadikan skrip agar hasilnya bisa diulang.
