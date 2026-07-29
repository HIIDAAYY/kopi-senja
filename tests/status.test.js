import { describe, it, expect } from 'vitest';
import { keMenit, hitungStatus } from '../src/lib/status.js';

const jadwal = [
  { hari: [1, 2, 3, 4, 5], label: 'Senin–Jumat', buka: '08:00', tutup: '22:00' },
  { hari: [6, 0], label: 'Sabtu–Minggu', buka: '09:00', tutup: '23:00' },
];

// Bulan di konstruktor Date dimulai dari 0. 2026-07-27 adalah hari Senin,
// 2026-08-01 adalah hari Sabtu.
const senin = (jam, menit) => new Date(2026, 6, 27, jam, menit);
const sabtu = (jam, menit) => new Date(2026, 7, 1, jam, menit);

describe('keMenit', () => {
  it('mengubah jam:menit menjadi total menit sejak tengah malam', () => {
    expect(keMenit('08:00')).toBe(480);
    expect(keMenit('08:30')).toBe(510);
    expect(keMenit('00:00')).toBe(0);
    expect(keMenit('23:59')).toBe(1439);
  });
});

describe('hitungStatus', () => {
  it('mengembalikan buka di tengah jam operasional', () => {
    expect(hitungStatus(senin(10, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup sebelum jam buka', () => {
    expect(hitungStatus(senin(7, 0), jadwal).keadaan).toBe('tutup');
  });

  it('mengembalikan buka tepat pada menit buka', () => {
    expect(hitungStatus(senin(8, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup tepat pada menit tutup', () => {
    expect(hitungStatus(senin(22, 0), jadwal).keadaan).toBe('tutup');
  });

  it('mengembalikan segera-tutup dalam 60 menit terakhir', () => {
    expect(hitungStatus(senin(21, 30), jadwal).keadaan).toBe('segera-tutup');
  });

  it('mengembalikan segera-tutup tepat pada ambang 60 menit', () => {
    expect(hitungStatus(senin(21, 0), jadwal).keadaan).toBe('segera-tutup');
  });

  it('masih buka satu menit sebelum ambang segera-tutup', () => {
    expect(hitungStatus(senin(20, 59), jadwal).keadaan).toBe('buka');
  });

  it('memakai blok jadwal akhir pekan pada hari Sabtu', () => {
    // 22:30 masih di dalam jam Sabtu (tutup 23:00) tapi sudah lewat
    // jam Senin–Jumat. Membuktikan blok yang dipilih benar.
    expect(hitungStatus(sabtu(22, 30), jadwal).keadaan).toBe('segera-tutup');
    expect(hitungStatus(sabtu(20, 0), jadwal).keadaan).toBe('buka');
  });

  it('mengembalikan tutup jika hari tidak ada di jadwal manapun', () => {
    const jadwalSebagian = [
      { hari: [1], label: 'Senin', buka: '08:00', tutup: '22:00' },
    ];
    const hasil = hitungStatus(sabtu(12, 0), jadwalSebagian);
    expect(hasil.keadaan).toBe('tutup');
    expect(hasil.label).toBe('Tutup hari ini');
  });

  it('menyertakan jam tutup pada label saat sedang buka', () => {
    expect(hitungStatus(senin(10, 0), jadwal).label).toContain('22:00');
  });

  it('menghormati ambang kustom', () => {
    expect(hitungStatus(senin(21, 30), jadwal, 15).keadaan).toBe('buka');
  });
});
