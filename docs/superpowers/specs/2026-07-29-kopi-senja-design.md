# Kopi Senja — Design Spec

**Tanggal:** 2026-07-29
**Status:** Disetujui, siap masuk tahap perencanaan implementasi

---

## 1. Konteks & Tujuan

Situs company profile untuk bisnis fiktif **"Kopi Senja"** — kedai kopi lokal di Bandung.

**Tujuan sebenarnya:** ini karya portofolio. Audiensnya recruiter dan calon klien, yang akan menilai dua hal sekaligus — tampilan situs di browser, dan kualitas kode di GitHub. Keduanya deliverable.

**Kriteria sukses:**

1. Skor Lighthouse ≥ 95 di keempat kategori (Performance, Accessibility, Best Practices, SEO), diukur pada build produksi
2. Setiap keputusan teknis punya alasan yang bisa dijelaskan pemiliknya saat wawancara
3. Konten (menu, harga, jam buka, kontak) bisa diubah tanpa menyentuh file komponen
4. Situs berfungsi penuh di 360px, 768px, dan 1440px

**Bukan tujuan:** e-commerce, keranjang belanja, sistem pemesanan, CMS, autentikasi, multi-bahasa.

---

## 2. Stack

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Framework | Astro (statis, `output: 'static'`) | Menghilangkan duplikasi HTML kartu menu; output tetap HTML murni |
| Styling | CSS murni + custom properties | Pemilik masih pemula — CSS fundamental lebih berharga daripada utility class |
| JavaScript | Vanilla, tanpa library | Dua fitur JS saja; library apapun akan lebih besar dari kode yang dibutuhkan |
| Font | Google Fonts, self-hosted | Menghindari request pihak ketiga yang menghambat render |
| Hosting | Netlify atau Vercel (gratis) | Deploy dari repo Git |

**Catatan konteks:** pemilik project adalah pemula yang memilih Astro secara sadar sebagai tantangan belajar, setelah diberi tahu bahwa HTML/CSS/JS murni sudah cukup untuk kebutuhan ini. Konsekuensinya untuk implementasi: **struktur harus tetap sederhana dan setiap konsep Astro yang dipakai harus dijelaskan di kode atau README.** Tidak boleh ada abstraksi pintar yang tidak bisa dipertanggungjawabkan pemiliknya.

Fitur Astro yang **tidak** dipakai: content collections, SSR, middleware, integrasi UI framework, view transitions. Cukup komponen `.astro` + import JSON.

---

## 3. Konsep Visual: Perjalanan Pagi ke Senja

Nama brand adalah sumber seluruh keputusan desain. Senja = golden hour. Background halaman bergerak dari terang ke gelap-hangat seiring scroll.

### Ritme background

| Section | Background | Teks |
|---|---|---|
| Hero | `--cream` `#F7F0E6` | `--espresso` |
| Tentang | `--espresso` `#2B1D15` | `--cream` |
| Menu | `--cream` `#F7F0E6` | `--espresso` |
| Lokasi | `--amber-wash` `#E8C99B` | `--espresso` |
| Footer | `--espresso-deep` `#1A110C` | `--cream` |

Pergantian terang–gelap–terang memberi struktur pada scroll dan mendukung narasi brand.

### Token warna (`src/styles/tokens.css`)

```css
--cream:         #F7F0E6;
--cream-muted:   #EFE4D4;
--espresso:      #2B1D15;
--espresso-deep: #1A110C;
--amber:         #C97B3C;
--amber-wash:    #E8C99B;
--terracotta:    #8C4A2F;
```

**Wajib diverifikasi saat implementasi:** setiap pasangan teks/background harus lolos kontras WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar). Pasangan berisiko yang harus dicek lebih dulu: `--amber` di atas `--cream`, dan `--espresso` di atas `--amber-wash`. Jika gagal, gelapkan `--amber` sampai lolos — jangan turunkan standarnya.

### Tipografi

- **Display — Fraunces** (variable serif). Sumbu `WONK` diaktifkan (`font-variation-settings: 'WONK' 1`), `SOFT` sedang. Ini yang memberi karakter dan menjauhkan dari kesan template.
- **Body — Plus Jakarta Sans** (Tokotype, foundry Indonesia).
- Keduanya self-hosted, subset latin, `font-display: swap`.

Skala:

```css
--fs-hero:    clamp(3.5rem, 13vw, 11rem);   /* line-height .85, tracking -.03em */
--fs-section: clamp(2.25rem, 6vw, 4.5rem);  /* line-height .95 */
--fs-card:    clamp(1.25rem, 2vw, 1.6rem);
--fs-price:   clamp(1.5rem, 2.5vw, 2rem);   /* Fraunces, bukan teks kecil abu-abu */
--fs-body:    1.125rem;                     /* line-height 1.7 */
--fs-label:   0.8125rem;                    /* uppercase, tracking .12em */
```

### Elemen "berani"

1. Judul hero berukuran ekstrem, `line-height: 0.85`, dan **overlap ke atas foto** — bukan berdiri di tengah dengan sopan
2. Nomor section raksasa (`01`–`05`) sebagai elemen grafis di margin, `opacity: 0.08`
3. Grid menu asimetris — item `unggulan` span 2 kolom
4. Harga memakai Fraunces ukuran besar; harga adalah informasi utama di menu dan diperlakukan begitu
5. Kolase foto asimetris di Tentang Kami (3 foto, ukuran dan offset berbeda)

---

## 4. Struktur File

```
kopi-senja/
├── public/
│   └── img/
│       ├── hero.webp
│       ├── og-image.jpg              (1200×630, untuk preview share)
│       ├── menu/                     (10 file .webp, 800×800)
│       └── suasana/                  (4 file .webp)
├── src/
│   ├── data/
│   │   ├── menu.json                 ← satu sumber kebenaran untuk seluruh menu
│   │   └── profil.json               ← identitas, kontak, alamat, jam buka
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Tentang.astro
│   │   ├── Menu.astro                (grid + tombol filter)
│   │   ├── MenuCard.astro            (satu kartu; dipakai 10×)
│   │   ├── Lokasi.astro              (maps + jam + badge status)
│   │   ├── StatusBadge.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro                (<head>, meta, JSON-LD, import global.css)
│   ├── lib/
│   │   ├── wa.js                     (bangun URL wa.me — dipakai saat build)
│   │   └── format.js                 (format rupiah, format jam)
│   ├── scripts/
│   │   ├── reveal.js                 (IntersectionObserver)
│   │   ├── filter.js                 (filter kategori)
│   │   └── status.js                 (badge buka/tutup)
│   ├── styles/
│   │   ├── tokens.css                (warna, font, skala, spacing)
│   │   └── global.css                (reset, base, utilitas)
│   └── pages/
│       └── index.astro               (merangkai keenam komponen)
├── astro.config.mjs
├── package.json
└── README.md
```

**Prinsip batasan:** setiap komponen memiliki satu section, menerima data lewat props, dan tidak tahu apa-apa tentang komponen lain. `MenuCard.astro` menerima satu objek item dan tidak tahu ada filter atau grid di atasnya. Fungsi di `lib/` murni — masuk data, keluar string, tanpa efek samping.

---

## 5. Bentuk Data

### `src/data/menu.json`

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
  }
]
```

Field: `id` (slug unik), `nama`, `kategori` (`"kopi"` | `"non-kopi"` | `"snack"`), `harga` (integer rupiah, tanpa pemisah), `deskripsi` (maks ±60 karakter), `foto` (path absolut dari `public/`), `unggulan` (boolean, span 2 kolom).

**Isi menu (10 item):**

| id | nama | kategori | harga | unggulan |
|---|---|---|---|---|
| `kopi-susu-senja` | Kopi Susu Senja | kopi | 18000 | ✅ |
| `espresso` | Espresso | kopi | 15000 | |
| `americano` | Americano | kopi | 18000 | |
| `cappuccino` | Cappuccino | kopi | 25000 | |
| `caffe-latte` | Caffè Latte | kopi | 25000 | |
| `kopi-tubruk` | Kopi Tubruk | kopi | 12000 | |
| `matcha-latte` | Matcha Latte | non-kopi | 27000 | ✅ |
| `cokelat-panas` | Cokelat Panas | non-kopi | 22000 | |
| `pisang-goreng-keju` | Pisang Goreng Keju | snack | 20000 | |
| `roti-bakar-cokelat` | Roti Bakar Cokelat | snack | 18000 | |

10 item dengan 2 di antaranya span 2 kolom = 12 sel dalam grid 3 kolom = tepat 4 baris penuh di desktop.

### `src/data/profil.json`

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
  "mapsEmbed": "https://www.google.com/maps/embed?pb=...",
  "mapsLink": "https://maps.google.com/?q=...",
  "koordinat": { "lat": -6.9218, "lng": 107.6083 },
  "jam": [
    { "hari": [1, 2, 3, 4, 5], "label": "Senin–Jumat", "buka": "08:00", "tutup": "22:00" },
    { "hari": [6, 0],          "label": "Sabtu–Minggu", "buka": "09:00", "tutup": "23:00" }
  ]
}
```

`hari` memakai indeks `Date.getDay()` (0 = Minggu). `wa` adalah nomor format internasional tanpa `+`.

`mapsEmbed` dan `mapsLink` diisi saat implementasi: buka Google Maps di alamat tersebut, ambil URL dari tombol Bagikan → Sematkan peta untuk `mapsEmbed`, dan URL berbagi biasa untuk `mapsLink`. Nilai `koordinat` harus cocok dengan lokasi yang sama, karena dipakai juga di JSON-LD.

**Catatan:** semua data ini fiktif. Nomor WA `6281234567890` sengaja jelas-jelas placeholder. Alamat Cikapundung dipilih sebagai lokasi Bandung yang masuk akal; peta akan menunjuk ke titik nyata di jalan tersebut agar embed berfungsi.

---

## 6. Fitur

### 6.1 Tombol WhatsApp auto-isi

Setiap kartu menu punya tombol "Pesan". Diklik → WhatsApp terbuka dengan pesan sudah terisi:

> Halo Kopi Senja, saya mau pesan Kopi Susu Senja (Rp 18.000). Apakah tersedia?

**Keputusan kunci: URL dibangun saat build, bukan di browser.** `MenuCard.astro` memanggil `lib/wa.js` selama build Astro dan me-render `<a href="https://wa.me/...?text=...">` yang sudah jadi.

Konsekuensi — dan ini alasan keputusannya:
- Nol JavaScript untuk fitur utama situs
- Tetap berfungsi walau JavaScript dimatikan
- Link terbaca crawler

`lib/wa.js` mengekspor dua fungsi:

- `linkWAItem(profil, item)` — mengisi `waTemplateItem` dengan `{nama}` (nama kedai), `{item}`, dan `{harga}` terformat
- `linkWAUmum(profil)` — mengisi `waTemplateUmum`, dipakai tombol WA di hero dan footer

Keduanya membungkus teks hasil dengan `encodeURIComponent` sebelum menempelkannya sebagai parameter `text`.

### 6.2 Filter kategori menu

Empat tombol: **Semua / Kopi / Non-Kopi / Snack**.

- Satu event listener di container tombol (event delegation), bukan empat listener terpisah
- Kartu yang tidak cocok mendapat atribut `hidden`; transisi `opacity` + `scale` lewat CSS
- Tombol aktif menyandang `aria-pressed="true"`
- Region `aria-live="polite"` mengumumkan "Menampilkan 4 item" setiap filter berubah
- Tanpa JavaScript: seluruh 10 kartu tampil, deretan tombol filter disembunyikan (`hidden` dari HTML, dilepas oleh `filter.js` saat inisialisasi)

**Batasan yang diterima secara sadar:** kartu tersisa berpindah posisi tanpa animasi geser. Animasi geser (teknik FLIP) jauh lebih rumit dan rawan bug; tidak sepadan untuk versi ini.

### 6.3 Fade-in saat scroll

`scripts/reveal.js` — `IntersectionObserver` dengan `threshold: 0.15`, `rootMargin: "0px 0px -10% 0px"`. Elemen ber-class `.reveal` mendapat `.reveal--visible` lalu **langsung di-`unobserve`** (tidak boros, dan tidak beranimasi ulang saat scroll balik).

Anak-anak di dalam satu section muncul bertahap lewat `transition-delay` bertingkat via CSS custom property `--i`.

**Reduced motion:** jika `matchMedia('(prefers-reduced-motion: reduce)').matches` bernilai true, observer tidak dibuat sama sekali dan semua elemen langsung terlihat. CSS juga menonaktifkan seluruh transisi dalam blok media query yang sama — supaya benar walau JS gagal muat.

### 6.4 Hero reveal saat load

Judul hero terbagi per baris; tiap baris beranimasi dari `clip-path: inset(100% 0 0 0)` ke `inset(0)` dengan jeda bertingkat 90ms. Murni CSS, dipicu class `.loaded` pada `<body>`. Dinonaktifkan saat reduced-motion.

### 6.5 Badge status buka/tutup

Di section Lokasi. `scripts/status.js` membaca jam lokal pengunjung, mencocokkan `Date.getDay()` dengan array `hari` di `profil.json`, dan membandingkan waktu sekarang dengan rentang buka–tutup.

Tiga keadaan: **Buka sekarang** (titik hijau) / **Tutup** (titik abu) / **Segera tutup** (titik amber, jika < 60 menit menuju tutup).

Dirender oleh `StatusBadge.astro` dalam keadaan netral saat build — berisi teks jadwal statis ("Buka 08:00–22:00"). JavaScript kemudian menggantinya dengan status langsung. Tanpa JS, pengunjung tetap melihat jadwal yang benar.

**Batasan yang dinyatakan eksplisit:** perhitungan memakai zona waktu perangkat pengunjung, bukan WIB. Pengunjung dari luar Indonesia akan melihat status yang salah. Untuk situs portofolio ini hal tersebut diterima; kompleksitas konversi zona waktu tidak sepadan. Catat batasan ini sebagai komentar di `status.js`.

---

## 7. Section

| # | Section | Isi |
|---|---|---|
| 01 | Hero | Nama brand ukuran raksasa, tagline, tombol "Lihat Menu" + "Pesan via WhatsApp", foto latar |
| 02 | Tentang Kami | 2–3 kalimat cerita + kolase 3 foto suasana asimetris |
| 03 | Menu | Tombol filter + grid 10 kartu (2 di antaranya span 2 kolom) |
| 04 | Lokasi & Jam | Google Maps iframe, alamat, tabel jam buka, badge status |
| 05 | Footer | WhatsApp, Instagram, alamat, kredit |

**Section Galeri dihapus** dari brief awal. Alasan: galeri grid adalah section yang paling sering dilewati pengunjung dan paling boros bandwidth. Empat foto suasana didistribusikan ke Tentang Kami (3, sebagai kolase) dan Lokasi (1, eksterior).

---

## 8. Aset Foto

Sumber: Unsplash / Pexels, dikurasi manual agar konsisten — semua warm-tone, arah cahaya serupa, framing seragam. Ini penentu terbesar apakah situs F&B terlihat profesional atau amatir.

Aturan:
- Di-**download ke `public/img/`**, tidak di-hotlink. Hotlink merusak skor performa dan bisa mati sewaktu-waktu.
- Format WebP, kualitas 80
- Menu: 800×800 (rasio 1:1). Hero: 1920×1080. Suasana: bervariasi, sisi terpanjang maks 1600px
- Setiap `<img>` memiliki atribut `width` dan `height` eksplisit → mencegah CLS
- Semua `loading="lazy"` **kecuali** foto hero, yang justru di-`preload`
- Atribusi fotografer dicatat di `README.md`

---

## 9. SEO & Metadata

Di `Base.astro`:
- `<title>`, `<meta name="description">`
- Open Graph + Twitter Card lengkap, dengan `og-image.jpg` 1200×630 — agar tampil bagus saat link di-share ke WhatsApp
- `<link rel="canonical">`
- **JSON-LD `LocalBusiness`** (subtipe `CafeOrCoffeeShop`): `name`, `address` (`PostalAddress`), `geo`, `openingHoursSpecification` yang di-generate dari array `jam` di `profil.json`, `telephone`, `priceRange`
- `lang="id"` pada `<html>`

JSON-LD dibangkitkan dari `profil.json`, bukan ditulis manual — supaya tidak pernah bisa tidak sinkron dengan jam buka yang tampil di halaman.

---

## 10. Penanganan Kegagalan

Tidak ada backend, jadi ruang lingkupnya sempit:

| Kondisi | Perilaku |
|---|---|
| Foto gagal dimuat | Kontainer berlatar `--cream-muted` dengan rasio terjaga — bukan ikon gambar rusak |
| `wa` kosong di `profil.json` | Seluruh tombol Pesan tidak dirender sama sekali saat build |
| Iframe Maps diblokir/gagal | Alamat teks dan tautan "Buka di Google Maps" tetap tampil di luar iframe |
| JavaScript mati atau gagal | Semua 10 kartu tampil, tombol filter tersembunyi, badge menampilkan jadwal statis, tombol WA tetap berfungsi |
| `menu.json` berisi kategori tak dikenal | Build gagal dengan pesan jelas, bukan diam-diam merender kartu yang tak terjangkau filter |

---

## 11. Verifikasi

Tanpa unit test. Untuk situs statis tanpa logika bisnis, test suite formal adalah upacara kosong — tidak ada yang layak di-assert selain hal yang sudah dijamin compiler Astro.

Sebagai gantinya, checklist yang benar-benar dijalankan pada build produksi (`npm run build && npm run preview`):

1. **Lighthouse** — keempat kategori ≥ 95, dicatat di README
2. **Kontras** — setiap pasangan teks/background diverifikasi lolos WCAG AA
3. **Keyboard** — Tab dari atas sampai footer; setiap elemen interaktif punya focus ring yang terlihat; urutan fokus logis; tombol filter bisa dioperasikan dengan Enter/Space
4. **Viewport** — 360px, 768px, 1440px; tidak ada scroll horizontal di manapun
5. **Reduced motion** — aktifkan di OS, muat ulang; tidak ada animasi apapun, semua konten langsung terlihat
6. **Tanpa JavaScript** — matikan JS di DevTools; 10 kartu tampil, tombol WA berfungsi, jadwal terbaca
7. **Link WA** — klik dari desktop dan mobile, pastikan teks pesan terisi benar dan harga terformat
8. **Validator JSON-LD** — lolos Google Rich Results Test

---

## 12. README

README adalah bagian dari deliverable portofolio, bukan formalitas. Recruiter sering membacanya sebelum membuka situsnya. Isi wajib:

- Screenshot desktop + mobile
- Demo langsung
- **Keputusan desain dan alasannya** — kenapa palet diturunkan dari nama brand, kenapa link WA dibangun saat build, kenapa galeri dibuang, kenapa animasi filter sengaja disederhanakan
- Cara menjalankan secara lokal
- Skor Lighthouse (screenshot)
- Atribusi foto
- Batasan yang diketahui (zona waktu badge, tidak ada animasi geser pada filter)

---

## 13. Di Luar Lingkup

Dinyatakan eksplisit agar tidak merembes saat implementasi: dark mode toggle, multi-bahasa, keranjang belanja, form kontak, integrasi CMS, blog, animasi scroll-linked berbasis `animation-timeline`, animasi FLIP pada filter, konversi zona waktu WIB, dan halaman tambahan apapun di luar `index.astro`.
