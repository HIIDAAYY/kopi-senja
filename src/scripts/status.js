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
