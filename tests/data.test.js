import { describe, it, expect } from 'vitest';
import { validasiMenu, KATEGORI } from '../src/lib/data.js';

const itemValid = {
  id: 'espresso',
  nama: 'Espresso',
  kategori: 'kopi',
  harga: 15000,
  deskripsi: 'Satu shot pekat.',
  foto: '/img/menu/espresso.webp',
  unggulan: false,
};

describe('KATEGORI', () => {
  it('mendefinisikan tiga kategori dengan id dan label', () => {
    expect(KATEGORI.map((k) => k.id)).toEqual(['kopi', 'non-kopi', 'snack']);
    KATEGORI.forEach((k) => expect(typeof k.label).toBe('string'));
  });
});

describe('validasiMenu', () => {
  it('meloloskan menu yang valid dan mengembalikannya', () => {
    expect(validasiMenu([itemValid])).toEqual([itemValid]);
  });

  it('melempar error yang menyebut kategori tak dikenal beserta id item', () => {
    const rusak = [{ ...itemValid, kategori: 'jus' }];
    expect(() => validasiMenu(rusak)).toThrow(/espresso.*jus/);
  });

  it('melempar error jika ada id yang duplikat', () => {
    expect(() => validasiMenu([itemValid, itemValid])).toThrow(/espresso/);
  });

  it('melempar error jika harga bukan bilangan bulat positif', () => {
    expect(() => validasiMenu([{ ...itemValid, harga: -1 }])).toThrow(/harga/);
    expect(() => validasiMenu([{ ...itemValid, harga: '15000' }])).toThrow(
      /harga/
    );
  });

  it('melempar error jika ada field wajib yang hilang', () => {
    const { foto, ...tanpaFoto } = itemValid;
    expect(() => validasiMenu([tanpaFoto])).toThrow(/foto/);
  });
});
