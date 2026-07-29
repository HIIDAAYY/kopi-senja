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
