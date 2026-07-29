/**
 * Alat kurasi foto. Bukan bagian dari situs — dipakai sekali untuk
 * memilih foto, lalu boleh dihapus.
 *
 * 1. Unduh kandidat dari Unsplash dalam ukuran kecil
 * 2. Ukur "kehangatan" tiap foto (rata-rata kanal merah dikurangi biru).
 *    Nilai positif = hangat, negatif = dingin. Kriteria kurasi di spec
 *    menuntut semua foto warm-tone, dan ini membuatnya terukur, bukan
 *    soal selera.
 * 3. Susun contact sheet berlabel, diurutkan dari paling hangat
 *
 * Jalankan: node scripts/kandidat-foto.mjs <subjek>
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const KANDIDAT = {
  interior: [
    'photo-1664970900025-1e3099ca757a', 'photo-1598959652545-c0230cdbb01f',
    'photo-1663932464735-e0946d833749', 'photo-1522126039546-182129aa0b93',
    'photo-1690271965447-f873ea9b3448', 'photo-1453614512568-c4024d13c247',
    'photo-1521017432531-fbd92d768814', 'photo-1588253137728-1e4dd0fe9a93',
    'photo-1464979681340-bdd28a61699e', 'photo-1663932464937-e677ddfc1d55',
    'photo-1565650839149-2c48a094196c', 'photo-1651783976258-3072215aac82',
    'photo-1664191866501-5e7ad9f07a1a', 'photo-1572231086568-6984943e6629',
    'photo-1572982270699-473dfa34d7e7', 'photo-1566939937483-6eabe6f79e15',
  ],
  espresso: [
    'photo-1675435644687-562e8042b9db', 'photo-1570784332176-fdd73da66f03',
    'photo-1610889556528-9a770e32642f', 'photo-1510591509098-f4fdc6d0ff04',
    'photo-1508088405209-fbd63b6a4f50', 'photo-1610219170948-60d096443dc1',
    'photo-1685384338018-1774719d5b69', 'photo-1579992357154-faf4bde95b3d',
    'photo-1572286258217-40142c1c6a70', 'photo-1612183515105-8c737ba7585d',
    'photo-1570784331625-907b0c979f63', 'photo-1615174111727-b165bfe654a3',
    'photo-1669687924558-386bff1a0469', 'photo-1612509590595-785e974ed690',
  ],
  latte: [
    'photo-1674327105074-46dd8319164b', 'photo-1650097364104-eef0e54af0da',
    'photo-1626041042756-57215f98ca54', 'photo-1691723247105-57e32577dc72',
    'photo-1667388363683-a07bbf0c84b1', 'photo-1611564494260-6f21b80af7ea',
    'photo-1673545518947-ddf3240090b1', 'photo-1674327105076-36c4419864cf',
    'photo-1581068106017-b29553281b51', 'photo-1569727456174-f7ac263febe6',
    'photo-1599163479506-2758dab1dd5e', 'photo-1632171962729-ae5999222681',
    'photo-1575994056384-b50716b434ee', 'photo-1670445287762-372300cdcb77',
  ],
  matcha: [
    'photo-1694825173868-ed003c071068', 'photo-1717603545758-88cc454db69b',
    'photo-1631308491952-040f80133535', 'photo-1717398804998-ad2d48822518',
    'photo-1671379526961-1aebb82b317b', 'photo-1727850005779-1e24cac382d4',
    'photo-1536256263959-770b48d82b0a', 'photo-1575487426366-079595af2247',
    'photo-1582785513054-8d1bf9d69c1a', 'photo-1624893578106-a98840591afc',
    'photo-1631679263367-9095fca628de', 'photo-1663853489900-3f24ea776dea',
  ],
  cokelat: [
    'photo-1697648334184-8b8cfb3ccfd0', 'photo-1698434828491-b0e097f0a784',
    'photo-1700488629510-bf60790ff9fc', 'photo-1702648906616-b030f193edb9',
    'photo-1608735540849-dab94904ba24', 'photo-1637572815755-c4b80092dce1',
    'photo-1608651057580-4a50b2fc2281', 'photo-1497048297103-b34f2fc1df34',
    'photo-1608735484559-50aa06c9478c', 'photo-1512339255930-2dee27e6a581',
    'photo-1622484212110-0c65f49e6ec6', 'photo-1481391032119-d89fee407e44',
  ],
  pisang: [
    'photo-1663854478810-26b620ade38a', 'photo-1663854478267-5b077194daf0',
    'photo-1676700310614-600f2aa255ef', 'photo-1566361892779-6afb6bca7052',
    'photo-1564469563873-7af1e021e76b', 'photo-1566361892797-361c0f20bd62',
    'photo-1584178203605-b6ee483d84d2', 'photo-1658373072934-d96e583a44f4',
    'photo-1664993090321-b2caff794431', 'photo-1540714605746-4f474eefc6d4',
    'photo-1573620339932-26cf198195e3', 'photo-1569409611632-b87901f4c74a',
  ],
  roti: [
    'photo-1737980393854-4038ab18586a', 'photo-1695123523156-bbef6588b10b',
    'photo-1591705951906-21001a283e58', 'photo-1694111154362-dd55943be353',
    'photo-1588619181138-008cf0d61d16', 'photo-1693858326799-3299d7317f69',
    'photo-1726001349471-9b9ed48f4504', 'photo-1575380061461-c6e540f65e24',
    'photo-1584366628072-8bbc0fb07e72', 'photo-1729033143644-125574b23abd',
    'photo-1565991138357-351176c3471a', 'photo-1719384837784-5691b0b3f493',
  ],
};

const subjek = process.argv[2];
if (!KANDIDAT[subjek]) {
  console.error(`Subjek tidak dikenal. Pilihan: ${Object.keys(KANDIDAT).join(', ')}`);
  process.exit(1);
}

const KELUARAN = 'tmp-kandidat';
await mkdir(KELUARAN, { recursive: true });

const UBIN = 260;
const KOLOM = 4;

const hasil = [];

for (const [i, id] of KANDIDAT[subjek].entries()) {
  const url = `https://images.unsplash.com/${id}?w=400&q=70&fm=jpg`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  lewati ${id} — HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());

    // Ukur kehangatan dari rata-rata kanal
    const { channels } = await sharp(buf).stats();
    const [r, g, b] = channels.map((c) => c.mean);
    const hangat = r - b;

    hasil.push({ i, id, buf, hangat, r, g, b });
  } catch (e) {
    console.warn(`  gagal ${id}: ${e.message}`);
  }
}

hasil.sort((a, b) => b.hangat - a.hangat);

console.log(`\n${subjek} — ${hasil.length} kandidat, urut dari paling hangat:\n`);
console.log('POS  KEHANGATAN  ID');
hasil.forEach((h, pos) => {
  console.log(
    `${String(pos).padStart(3)}  ${h.hangat.toFixed(1).padStart(10)}  ${h.id}`
  );
});

// Susun contact sheet berlabel nomor posisi
const baris = Math.ceil(hasil.length / KOLOM);
const lembar = sharp({
  create: {
    width: KOLOM * UBIN,
    height: baris * UBIN,
    channels: 3,
    background: '#1a110c',
  },
});

const komposit = [];
for (const [pos, h] of hasil.entries()) {
  const x = (pos % KOLOM) * UBIN;
  const y = Math.floor(pos / KOLOM) * UBIN;

  komposit.push({
    input: await sharp(h.buf).resize(UBIN, UBIN, { fit: 'cover' }).toBuffer(),
    left: x,
    top: y,
  });

  const label = Buffer.from(
    `<svg width="${UBIN}" height="46">
       <rect x="0" y="0" width="52" height="34" fill="#000" opacity="0.75"/>
       <text x="10" y="25" font-family="monospace" font-size="22"
             fill="#fff" font-weight="bold">${pos}</text>
     </svg>`
  );
  komposit.push({ input: label, left: x, top: y });
}

const jalur = `${KELUARAN}/lembar-${subjek}.jpg`;
await lembar.composite(komposit).jpeg({ quality: 88 }).toFile(jalur);
console.log(`\nContact sheet: ${jalur}`);
