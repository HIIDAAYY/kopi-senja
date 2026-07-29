import { formatRupiah } from './format.js';

// Indeks mengikuti Date.getDay(): 0 = Minggu
const NAMA_HARI = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Bangun structured data LocalBusiness dari profil.json.
 *
 * Sengaja diturunkan dari data yang sama dengan yang tampil di halaman,
 * bukan ditulis manual — supaya jam buka di JSON-LD tidak pernah bisa
 * berbeda dengan jam buka yang dibaca pengunjung.
 */
export function buatJsonLd(profil, menu, urlSitus) {
  const harga = menu.map((i) => i.harga);
  const a = profil.alamatStruktur;

  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: profil.nama,
    description: profil.deskripsi,
    url: urlSitus,
    image: `${urlSitus}/img/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.jalan,
      addressLocality: a.kota,
      addressRegion: a.provinsi,
      postalCode: a.kodePos,
      addressCountry: a.negara,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: profil.koordinat.lat,
      longitude: profil.koordinat.lng,
    },
    openingHoursSpecification: profil.jam.map((blok) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: blok.hari.map((h) => NAMA_HARI[h]),
      opens: blok.buka,
      closes: blok.tutup,
    })),
    priceRange: `${formatRupiah(Math.min(...harga))} - ${formatRupiah(
      Math.max(...harga)
    )}`,
    servesCuisine: 'Coffee',
  };
}
