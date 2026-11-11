import * as A from '../js/core/astro.js';
const j = A.jd(new Date(Date.UTC(2000,0,1,12)));
const p = A.positions(j);
for (const k in p) console.log(k.padEnd(8), A.fmtDeg(p[k].lon), p[k].retro?'R':'');
// Chiron checks
for (const y of [1980,1985,1990,1995,2000,2005,2012,2020,2026]) console.log('Chiron',y, A.fmtDeg(A.body('Chiron',A.jd(new Date(Date.UTC(y,6,1)))).lon));
const h = A.houses(j, 51.5, 0); console.log('London asc', A.fmtDeg(h.asc), 'mc', A.fmtDeg(h.mc), h.cusps.map(c=>A.fmtDeg(c)).join(' | '));
const now = A.jd(new Date(Date.UTC(2026,10,11)));
console.log(A.lunations(now, 365*2).filter(x=>x.eclipse).map(x=>A.fromJd(x.jd).toISOString().slice(0,10)+' '+x.eclipse));
console.log(A.stations('Mercury', now, 200).map(x=>A.fromJd(x.jd).toISOString().slice(0,10)+' '+x.type));
const nowP = A.positions(now); for (const k in nowP) console.log('now',k, A.fmtDeg(nowP[k].lon), nowP[k].retro?'R':'');
