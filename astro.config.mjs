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
