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
