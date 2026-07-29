import { describe, it, expect } from 'vitest';
import { buatJsonLd } from '../src/lib/jsonld.js';

const profil = {
  nama: 'Kopi Senja',
  deskripsi: 'Kedai kopi kecil di sudut Cikapundung.',
  alamatStruktur: {
    jalan: 'Jl. Cikapundung Barat No. 12',
    kota: 'Bandung',
    provinsi: 'Jawa Barat',
    kodePos: '40117',
    negara: 'ID',
  },
  koordinat: { lat: -6.9218, lng: 107.6083 },
  jam: [
    { hari: [1, 2, 3, 4, 5], label: 'Senin–Jumat', buka: '08:00', tutup: '22:00' },
    { hari: [6, 0], label: 'Sabtu–Minggu', buka: '09:00', tutup: '23:00' },
  ],
};

const menu = [{ harga: 12000 }, { harga: 27000 }, { harga: 18000 }];

describe('buatJsonLd', () => {
  const hasil = buatJsonLd(profil, menu, 'https://contoh.test');

  it('memakai tipe CafeOrCoffeeShop', () => {
    expect(hasil['@type']).toBe('CafeOrCoffeeShop');
    expect(hasil['@context']).toBe('https://schema.org');
  });

  it('memecah alamat menjadi komponen PostalAddress', () => {
    expect(hasil.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Cikapundung Barat No. 12',
      addressLocality: 'Bandung',
      addressRegion: 'Jawa Barat',
      postalCode: '40117',
      addressCountry: 'ID',
    });
  });

  it('menerjemahkan indeks hari menjadi nama hari schema.org', () => {
    expect(hasil.openingHoursSpecification[0].dayOfWeek).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]);
    expect(hasil.openingHoursSpecification[1].dayOfWeek).toEqual([
      'Saturday',
      'Sunday',
    ]);
  });

  it('menyalin jam buka dan tutup apa adanya', () => {
    expect(hasil.openingHoursSpecification[0].opens).toBe('08:00');
    expect(hasil.openingHoursSpecification[0].closes).toBe('22:00');
  });

  it('menghitung priceRange dari harga termurah dan termahal di menu', () => {
    expect(hasil.priceRange).toBe('Rp 12.000 - Rp 27.000');
  });

  it('menyertakan koordinat sebagai GeoCoordinates', () => {
    expect(hasil.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: -6.9218,
      longitude: 107.6083,
    });
  });
});
