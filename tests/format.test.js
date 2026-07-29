import { describe, it, expect } from 'vitest';
import { formatRupiah } from '../src/lib/format.js';

describe('formatRupiah', () => {
  it('menyisipkan titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(18000)).toBe('Rp 18.000');
  });

  it('menangani angka di bawah seribu tanpa pemisah', () => {
    expect(formatRupiah(500)).toBe('Rp 500');
  });

  it('menangani angka jutaan', () => {
    expect(formatRupiah(1250000)).toBe('Rp 1.250.000');
  });

  it('menangani nol', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('menangani batas tepat empat digit', () => {
    expect(formatRupiah(1000)).toBe('Rp 1.000');
  });
});
