import { describe, it, expect } from 'vitest';
import { linkWAItem, linkWAUmum } from '../src/lib/wa.js';

const profil = {
  nama: 'Kopi Senja',
  wa: '6281234567890',
  waTemplateItem:
    'Halo {nama}, saya mau pesan {item} ({harga}). Apakah tersedia?',
  waTemplateUmum: 'Halo {nama}, saya mau tanya-tanya dulu boleh?',
};

const item = { nama: 'Kopi Susu Senja', harga: 18000 };

describe('linkWAItem', () => {
  it('mengarah ke nomor WA yang benar', () => {
    const url = new URL(linkWAItem(profil, item));
    expect(url.origin + url.pathname).toBe('https://wa.me/6281234567890');
  });

  it('mengisi nama kedai, nama item, dan harga terformat', () => {
    const url = new URL(linkWAItem(profil, item));
    expect(url.searchParams.get('text')).toBe(
      'Halo Kopi Senja, saya mau pesan Kopi Susu Senja (Rp 18.000). Apakah tersedia?'
    );
  });

  it('meng-encode pesan sehingga URL tidak mengandung spasi mentah', () => {
    expect(linkWAItem(profil, item)).not.toContain(' ');
  });

  it('mengembalikan null jika nomor WA kosong', () => {
    expect(linkWAItem({ ...profil, wa: '' }, item)).toBeNull();
  });

  it('menangani nama item yang mengandung karakter khusus', () => {
    const url = new URL(
      linkWAItem(profil, { nama: 'Caffè Latte & Co', harga: 25000 })
    );
    expect(url.searchParams.get('text')).toContain('Caffè Latte & Co');
  });
});

describe('linkWAUmum', () => {
  it('mengisi nama kedai tanpa memerlukan item', () => {
    const url = new URL(linkWAUmum(profil));
    expect(url.searchParams.get('text')).toBe(
      'Halo Kopi Senja, saya mau tanya-tanya dulu boleh?'
    );
  });

  it('mengembalikan null jika nomor WA kosong', () => {
    expect(linkWAUmum({ ...profil, wa: '' })).toBeNull();
  });
});
