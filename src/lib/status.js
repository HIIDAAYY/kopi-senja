/**
 * BATASAN YANG DISENGAJA
 *
 * 1. Perhitungan memakai zona waktu perangkat pengunjung, bukan WIB.
 *    Pengunjung dari luar Indonesia akan melihat status yang salah.
 *    Untuk situs portofolio ini hal tersebut diterima; konversi zona
 *    waktu menambah kompleksitas yang tidak sepadan.
 *
 * 2. Jam tutup yang melewati tengah malam (mis. buka 20:00 tutup 02:00)
 *    tidak didukung. profil.json saat ini tutup paling malam pukul 23:00.
 *    Jika suatu saat jadwalnya berubah, fungsi ini harus direvisi.
 */

/** "08:30" -> 510 (menit sejak tengah malam) */
export function keMenit(jam) {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + m;
}

/**
 * @param {Date}   sekarang    Waktu yang dievaluasi (disuntikkan agar bisa diuji)
 * @param {Array}  jadwal      profil.jam
 * @param {number} ambangMenit Berapa menit sebelum tutup dianggap "segera tutup"
 * @returns {{ keadaan: 'buka'|'segera-tutup'|'tutup', label: string }}
 */
export function hitungStatus(sekarang, jadwal, ambangMenit = 60) {
  const hariIni = sekarang.getDay();
  const blok = jadwal.find((j) => j.hari.includes(hariIni));

  if (!blok) {
    return { keadaan: 'tutup', label: 'Tutup hari ini' };
  }

  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
  const buka = keMenit(blok.buka);
  const tutup = keMenit(blok.tutup);

  if (menitSekarang < buka || menitSekarang >= tutup) {
    return { keadaan: 'tutup', label: `Tutup · Buka pukul ${blok.buka}` };
  }

  if (tutup - menitSekarang <= ambangMenit) {
    return { keadaan: 'segera-tutup', label: `Segera tutup · ${blok.tutup}` };
  }

  return { keadaan: 'buka', label: `Buka sekarang · sampai ${blok.tutup}` };
}
