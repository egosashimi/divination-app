import * as C from '../js/core/chinese.js';
import * as K from '../js/core/calendars.js';
import * as N from '../js/core/numerology.js';
import * as A from '../js/core/astro.js';
for (const y of [1966,1985,2023,2024,2025,2026,2033]) console.log('CNY',y, C.chineseNewYear(y));
console.log('day 2000-01-01', C.pillarName(C.dayPillar(2000,1,1)), 'expect Wu Wu');
// Known BaZi: 1990-05-15 10:00 Shanghai -> Geng Wu year, Xin Si month, (day?), 
const b = C.bazi(A.zonedToUtc(1990,5,15,10,0,'Asia/Shanghai'),'Asia/Shanghai','male');
console.log(['year','month','day','hour'].map(k=>C.pillarName(b[k])+' '+C.pillarHz(b[k])).join(' | '), b.luck.forward, b.luck.startAge.toFixed(1), b.luck.pillars.map(C.pillarName).join(','));
console.log('maya 2012-12-21', K.maya(2012,12,21));
console.log('kua 1984 m/f', C.kua(1984,'male'), C.kua(1984,'female'), '2005', C.kua(2005,'male'), C.kua(2005,'female'));
console.log(N.lifePath('1990-05-15'), N.nameNumbers('John Smith'), N.pinnacles('1990-05-15'), N.personalYear('1990-05-15', 2026));
console.log(A.zonedToUtc(1990,5,15,10,0,'America/New_York').toISOString());
const ph = K.planetaryHours(new Date(2026,10,11), 40.7, -74); console.log(ph.ruler, ph.hours.slice(0,3).map(h=>h.planet+' '+A.fromJd(h.start).toISOString()));
console.log(K.wheel(A.jd(new Date()), false).map(f=>f.name+' '+A.fromJd(f.jd).toISOString().slice(0,10)));
