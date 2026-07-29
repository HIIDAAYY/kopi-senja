# Kopi Senja

Situs company profile untuk kedai kopi fiktif di Bandung. Dibangun sebagai karya portofolio.

![Tampilan desktop](docs/tampilan-desktop.jpeg)

**[Lihat situsnya →](https://kopi-senja-brown.vercel.app)**

> **Status:** live. Lighthouse 100 di Accessibility, Best Practices, dan SEO. Terverifikasi di 1440px, 768px, dan 375px.

## Keputusan desain

**Palet diturunkan dari nama brand.** "Senja" berarti golden hour, jadi seluruh warna diambil dari cahaya sore: cream, espresso, amber, terakota. Background halaman bergerak dari terang ke gelap-hangat seiring scroll — perjalanan pagi ke senja.

| Section | Background |
|---|---|
| Hero | cream `#F7F0E6` |
| Tentang | espresso `#2B1D15` |
| Menu | cream `#F7F0E6` |
| Lokasi | amber wash `#E8C99B` |
| Footer | espresso pekat `#1A110C` |

**Link WhatsApp dibangun saat build, bukan di browser.** Tombol "Pesan" di setiap kartu menu menghasilkan `<a href>` biasa yang sudah berisi nama item dan harga:

```
https://wa.me/6281234567890?text=Halo Kopi Senja, saya mau pesan
Kopi Susu Senja (Rp 18.000). Apakah tersedia?
```

Konsekuensinya: nol JavaScript untuk fitur utama, tetap berfungsi walau JS mati, dan terbaca crawler. Alasannya UMKM F&B di Indonesia berjualan lewat WhatsApp, bukan lewat keranjang belanja — jadi fitur ini yang paling dekat dengan transaksi.

**Konten dipisah dari tampilan.** Seluruh menu ada di `src/data/menu.json`, seluruh identitas kedai di `profil.json`. Menambah item menu berarti menambah satu objek JSON, bukan menyalin blok HTML. `src/lib/data.js` memvalidasi data itu saat build dan **menggagalkan build** kalau ada kategori tak dikenal, id duplikat, harga tidak sah, atau field yang hilang.

**Animasi hero berjalan murni dari CSS.** Pola umum "sembunyikan lewat CSS, munculkan lewat class dari JavaScript" punya mode kegagalan buruk: kalau JS pemicunya tidak pernah jalan, judulnya tersembunyi permanen. Di sini `animation-fill-mode: both` memberi hasil visual yang sama tanpa bergantung pada JavaScript apa pun.

**Galeri dihapus dari rancangan awal.** Galeri grid adalah section yang paling sering dilewati dan paling boros bandwidth. Foto suasana didistribusikan ke Tentang Kami (kolase 3 foto) dan Lokasi.

**Animasi filter sengaja disederhanakan.** Kartu yang tersisa berpindah tanpa animasi geser. Animasi geser (teknik FLIP) jauh lebih rumit dan rawan bug — tidak sepadan untuk keuntungan visual yang kecil.

**Kurasi foto diukur, bukan dikira-kira.** Kriteria "semua foto harus warm-tone" gampang diucapkan tapi susah dinilai konsisten dengan mata. `scripts/kandidat-foto.mjs` mengunduh kandidat, menghitung kehangatan tiap foto (rata-rata kanal merah dikurangi biru), dan menyusun contact sheet berurut. Beberapa foto yang terlihat bagus ternyata bernilai negatif — misalnya cangkir espresso di atas serbet biru (−15.7) — dan akan bentrok dengan palet meski secara komposisi menarik. Semua foto yang dipakai bernilai positif.

## Responsif

Diverifikasi di tiga lebar, bukan diasumsikan:

| Lebar | Grid menu | Hero |
|---|---|---|
| 1440px | 3 kolom, item unggulan span 2 | Foto di kanan, judul menimpanya |
| 768px | 2 kolom, tanpa span | Foto di paruh atas, teks di bawah |
| 375px | 1 kolom | Foto di paruh atas, teks di bawah |

![Tampilan HP](docs/tampilan-hp.jpeg)

Dua hal yang tertangkap saat verifikasi dan sudah diperbaiki: judul hero sempat tidak terbaca di tablet dan HP karena arah gradasi mask terbalik terhadap posisi teks, dan kartu unggulan yang span 2 kolom meninggalkan sel kosong di layout 2 kolom.

## Aksesibilitas

- **Kontras diverifikasi otomatis**, bukan dikira-kira. `node scripts/cek-kontras.mjs` menghitung rasio WCAG untuk 22 pasangan warna yang benar-benar dipakai, dan keluar dengan kode 1 kalau ada yang gagal. Skrip ini menemukan tiga kegagalan yang lolos dari mata:
  - terakota di atas amber wash hanya 4.23:1 → digelapkan ke `#85462d` (4.55:1)
  - focus ring amber gagal di latar terang, dan tidak ada satu warna pun yang lolos 3:1 terhadap cream sekaligus espresso pekat → warna focus ring kini diambil dari `--warna-fokus` yang di-override section gelap
  - kedua titik status gagal di atas lapisan transparan badge → badge diubah jadi chip gelap
- Seluruh animasi mati saat `prefers-reduced-motion: reduce`, di CSS maupun di JavaScript — diverifikasi dengan media feature benar-benar diaktifkan: animasi hero `none`, seluruh 20 elemen reveal ditandai tampil saat load tanpa menunggu scroll, transisi kartu efektif nol
- Filter kategori memakai `aria-pressed` dan mengumumkan jumlah hasil lewat region `aria-live`
- Tiap tombol "Pesan" punya nama aksesibel unik, bukan sepuluh tombol bernama sama
- Situs berfungsi penuh tanpa JavaScript: kartu tampil semua, tombol filter disembunyikan, badge menampilkan jadwal statis, tombol WhatsApp tetap jalan

## Hasil audit

Lighthouse pada situs live, device mobile:

| Kategori | Skor |
|---|---|
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |
| 51 audit dijalankan | 0 gagal |

Metrik performa dari trace Chrome DevTools di situs live:

| Metrik | Nilai |
|---|---|
| LCP | 150 ms |
| CLS | **0.00** |
| TTFB | 24 ms |

CLS nol itu hasil dari `width`/`height` eksplisit di setiap `<img>` — ruangnya sudah dipesan sebelum filenya datang. Diukur tanpa throttling jaringan; angka pada koneksi lambat akan lebih tinggi.

Audit pertama memberi Accessibility 96 dengan satu kegagalan kontras: nomor section raksasa (01–05) pada opacity 0.08. Secara WCAG itu bisa dibantah sebagai teks dekoratif, tapi audit tersebut menunjuk masalah nyata dari arah lain — angka itu tidak membawa informasi apa pun, tapi ditulis sebagai teks di HTML, sehingga screen reader membacakan "02, 03, 04, 05" sebagai noise. Sekarang angkanya dibangkitkan lewat `content: attr(data-nomor)` di CSS. Dekorasi ditaruh di tempatnya, dan skornya jadi 100.

## SEO

- JSON-LD `CafeOrCoffeeShop` dengan alamat terstruktur, koordinat, dan `openingHoursSpecification` — semuanya **diturunkan dari `profil.json`**, bukan ditulis manual, sehingga tidak pernah bisa berbeda dengan jam buka yang tampil di halaman
- Open Graph + Twitter Card lengkap dengan URL absolut
- `lang="id"`, canonical, meta description

## Stack

Astro (statis) · CSS murni dengan custom properties · vanilla JavaScript · Vitest · Fontsource (Fraunces Variable + Plus Jakarta Sans Variable) · sharp

Tanpa framework UI, tanpa framework CSS, tanpa library animasi.

## Menjalankan secara lokal

```bash
npm install
```

```bash
npm run dev
```

Perintah lain:

| Perintah | Kegunaan |
|---|---|
| `npm test` | 36 unit test untuk logika murni di `src/lib/` |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Jalankan hasil build (pakai ini untuk Lighthouse, bukan `dev`) |
| `node scripts/cek-kontras.mjs` | Audit kontras WCAG |
| `node scripts/optimasi-foto.mjs` | Ubah foto di `raw/` jadi WebP teroptimasi |

## Mengganti foto

1. Buat folder `raw/`, `raw/menu/`, `raw/suasana/` (folder ini di-gitignore)
2. Isi dengan foto mentah — nama file di `raw/menu/` harus cocok dengan field `foto` di `menu.json`
3. Jalankan `node scripts/optimasi-foto.mjs`
4. Salin ukuran foto suasana yang tercetak ke array `foto` di `src/components/Tentang.astro`, dan perbarui teks `alt`-nya

## Yang belum selesai

- **Link WhatsApp belum diuji dari ponsel sungguhan.** Isi pesannya sudah diverifikasi dari HTML hasil build, termasuk item beraksen seperti "Caffè Latte", tapi membuka aplikasi WhatsApp dari perangkat asli belum dicoba.

## Batasan yang diketahui

- Badge buka/tutup memakai zona waktu perangkat pengunjung, bukan WIB. Pengunjung dari luar Indonesia akan melihat status yang salah.
- Jam tutup yang melewati tengah malam tidak didukung. Jadwal saat ini tutup paling malam pukul 23:00.
- Filter kategori tidak menganimasikan perpindahan posisi kartu.

## Kredit foto

Semua foto dari [Unsplash](https://unsplash.com) di bawah [Unsplash License](https://unsplash.com/license), yang mengizinkan pemakaian gratis termasuk komersial tanpa kewajiban atribusi.

Sumber tiap foto tercatat sebagai ID gambar di `scripts/kandidat-foto.mjs`. Untuk melihat aslinya, buka `https://images.unsplash.com/<id>`.

| Slot | ID Unsplash |
|---|---|
| Hero | `photo-1651783976258-3072215aac82` |
| Suasana 1 | `photo-1522126039546-182129aa0b93` |
| Suasana 2 | `photo-1588253137728-1e4dd0fe9a93` |
| Suasana 3 | `photo-1690271965447-f873ea9b3448` |
| Kopi Susu Senja | `photo-1569727456174-f7ac263febe6` |
| Espresso | `photo-1510591509098-f4fdc6d0ff04` |
| Americano | `photo-1685384338018-1774719d5b69` |
| Cappuccino | `photo-1626041042756-57215f98ca54` |
| Caffè Latte | `photo-1611564494260-6f21b80af7ea` |
| Kopi Tubruk | `photo-1667388363683-a07bbf0c84b1` |
| Matcha Latte | `photo-1582785513054-8d1bf9d69c1a` |
| Cokelat Panas | `photo-1700488629510-bf60790ff9fc` |
| Pisang Goreng Keju | `photo-1540714605746-4f474eefc6d4` |
| Roti Bakar Cokelat | `photo-1693858326799-3299d7317f69` |

Atribusi tidak diwajibkan lisensinya, tapi mencantumkan nama fotografer adalah praktik yang baik. Nama-namanya belum dikumpulkan — kalau situs ini dipublikasikan, sebaiknya dilengkapi.

## Catatan

Kopi Senja adalah bisnis fiktif. Alamat, nomor telepon, jam buka, dan harga bukan data asli.
