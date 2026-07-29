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
