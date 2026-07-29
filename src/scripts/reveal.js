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
