/**
 * Filter kategori menu.
 *
 * Memakai satu event listener di container tombol (event delegation),
 * bukan satu listener per tombol. Kalau nanti kategori bertambah lewat
 * menu.json, tidak ada kode di sini yang perlu diubah.
 */
export function pasangFilter() {
  const wadahFilter = document.querySelector('[data-filter]');
  const grid = document.querySelector('#menu-grid');
  const status = document.querySelector('#menu-status');

  if (!wadahFilter || !grid || !status) return;

  const pembungkus = Array.from(grid.children);
  const gerakDimatikan = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function terapkan(kategori) {
    let terlihat = 0;

    pembungkus.forEach((el) => {
      const kartu = el.querySelector('.kartu');
      const cocok = kategori === 'semua' || kartu.dataset.kategori === kategori;

      if (cocok) terlihat += 1;

      if (gerakDimatikan) {
        el.hidden = !cocok;
        return;
      }

      if (cocok) {
        el.hidden = false;
        // Dibaca dulu agar browser menerapkan display:block sebelum
        // class pudar dilepas — tanpa ini transisi tidak berjalan.
        void el.offsetWidth;
        el.classList.remove('menu__kartu--pudar');
      } else {
        el.classList.add('menu__kartu--pudar');
        setTimeout(() => {
          if (el.classList.contains('menu__kartu--pudar')) el.hidden = true;
        }, 300);
      }
    });

    status.textContent = `Menampilkan ${terlihat} item.`;

    wadahFilter.querySelectorAll('[data-kategori]').forEach((tombol) => {
      tombol.setAttribute(
        'aria-pressed',
        String(tombol.dataset.kategori === kategori)
      );
    });
  }

  wadahFilter.addEventListener('click', (e) => {
    const tombol = e.target.closest('[data-kategori]');
    if (!tombol) return;
    terapkan(tombol.dataset.kategori);
  });
}
