#!/usr/bin/env node
// Laster ned ALLE bilder og videoer fra galleriet til en lokal mappe (./nedlastet/).
// Blobene er offentlige, så du trenger ingen token — bare kjør:
//     node last-ned-alt.mjs
// (valgfritt) egen URL:  SITE=https://din-url.vercel.app node last-ned-alt.mjs

import fs from 'node:fs';
import path from 'node:path';

const SITE = (process.env.SITE || 'https://endre-malene-bryllup.vercel.app').replace(/\/$/, '');
const OUT = process.env.OUT || 'nedlastet';

fs.mkdirSync(OUT, { recursive: true });

console.log(`Henter fil-liste fra ${SITE} ...`);
const res = await fetch(`${SITE}/api/list`, { cache: 'no-store' });
if (!res.ok) { console.error('Klarte ikke hente lista:', res.status); process.exit(1); }
const { items } = await res.json();
console.log(`Fant ${items.length} filer. Laster ned til ./${OUT}/\n`);

let ok = 0, skip = 0, fail = 0, bytes = 0;
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const dest = path.join(OUT, it.pathname);
  if (fs.existsSync(dest) && fs.statSync(dest).size === it.size) { skip++; continue; }
  try {
    const r = await fetch(it.url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest, buf);
    ok++; bytes += buf.length;
    console.log(`[${i + 1}/${items.length}] ${it.pathname}  (${(buf.length / 1e6).toFixed(1)} MB)`);
  } catch (e) {
    fail++;
    console.warn(`  ⚠ feilet: ${it.pathname} — ${e.message}`);
  }
}

console.log(`\nFerdig! ${ok} lastet ned, ${skip} hoppet over (fantes fra før), ${fail} feilet.`);
console.log(`Totalt ${(bytes / 1e9).toFixed(2)} GB i ./${OUT}/`);
