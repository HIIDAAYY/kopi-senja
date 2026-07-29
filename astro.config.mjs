import { defineConfig } from 'astro/config';

export default defineConfig({
  // Diperlukan agar tag <link rel="canonical"> dan Open Graph
  // menghasilkan URL absolut. Ini alias produksi Vercel yang stabil —
  // sengaja bukan URL per-deploy yang mengandung hash, karena URL itu
  // berubah tiap kali deploy dan akan membuat canonical menunjuk ke
  // versi lama.
  site: 'https://kopi-senja-brown.vercel.app',
  output: 'static',
  build: {
    // CSS kecil di-inline ke <head> supaya tidak ada request
    // tambahan yang menghambat render pertama.
    inlineStylesheets: 'auto',
  },
});
