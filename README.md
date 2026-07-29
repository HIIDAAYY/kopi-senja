# Kopi Senja

Situs company profile untuk kedai kopi fiktif di Bandung. Dibangun sebagai karya portofolio.

> **Status:** kode selesai, memakai foto placeholder. Foto asli dan pengukuran Lighthouse belum dikerjakan — lihat [Yang belum selesai](#yang-belum-selesai).

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

## Aksesibilitas

- **Kontras diverifikasi otomatis**, bukan dikira-kira. `node scripts/cek-kontras.mjs` menghitung rasio WCAG untuk 22 pasangan warna yang benar-benar dipakai, dan keluar dengan kode 1 kalau ada yang gagal. Skrip ini menemukan tiga kegagalan yang lolos dari mata:
  - terakota di atas amber wash hanya 4.23:1 → digelapkan ke `#85462d` (4.55:1)
  - focus ring amber gagal di latar terang, dan tidak ada satu warna pun yang lolos 3:1 terhadap cream sekaligus espresso pekat → warna focus ring kini diambil dari `--warna-fokus` yang di-override section gelap
  - kedua titik status gagal di atas lapisan transparan badge → badge diubah jadi chip gelap
- Seluruh animasi mati saat `prefers-reduced-motion: reduce`, di CSS maupun di JavaScript
- Filter kategori memakai `aria-pressed` dan mengumumkan jumlah hasil lewat region `aria-live`
- Tiap tombol "Pesan" punya nama aksesibel unik, bukan sepuluh tombol bernama sama
- Situs berfungsi penuh tanpa JavaScript: kartu tampil semua, tombol filter disembunyikan, badge menampilkan jadwal statis, tombol WhatsApp tetap jalan

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

- **Foto masih placeholder** berupa bidang warna solid dengan rasio yang benar. Kurasi foto asli (semua warm-tone, arah cahaya seragam, framing konsisten) belum dikerjakan.
- **Lighthouse belum diukur.** Target ≥ 95 di keempat kategori.
- **Belum di-deploy.** Setelah domain diketahui, perbarui `site` di `astro.config.mjs` — `og:image` dan `canonical` bergantung pada nilai itu untuk menghasilkan URL absolut.
- **Verifikasi visual belum dilakukan**: layout responsif di 360/768/1440px, navigasi keyboard, dan perilaku `prefers-reduced-motion` di browser sungguhan.

## Batasan yang diketahui

- Badge buka/tutup memakai zona waktu perangkat pengunjung, bukan WIB. Pengunjung dari luar Indonesia akan melihat status yang salah.
- Jam tutup yang melewati tengah malam tidak didukung. Jadwal saat ini tutup paling malam pukul 23:00.
- Filter kategori tidak menganimasikan perpindahan posisi kartu.

## Kredit foto

Belum ada — masih memakai placeholder. Isi bagian ini dengan nama fotografer dan tautan sumber saat foto asli dipasang.

## Catatan

Kopi Senja adalah bisnis fiktif. Alamat, nomor telepon, jam buka, dan harga bukan data asli.
