// Compact ephemeris after Paul Schlyter's "How to compute planetary positions".
// Accuracy: roughly 1-2 arcminutes for the Sun and Moon, a few arcminutes for
// the planets between 1900 and 2100. Geocentric, tropical, equinox of date.

const RAD = Math.PI / 180;
export const norm = (x) => ((x % 360) + 360) % 360;
const sin = (d) => Math.sin(d * RAD);
const cos = (d) => Math.cos(d * RAD);
const atan2 = (y, x) => Math.atan2(y, x) / RAD;

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_ABBR = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Node', 'Chiron'];
export const GLYPH = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Node: '☊', Chiron: 'K', Asc: 'AC', MC: 'MC' };

export function jd(date) { return date.getTime() / 86400000 + 2440587.5; }
export function fromJd(j) { return new Date((j - 2440587.5) * 86400000); }
const dayNum = (j) => j - 2451543.5;

function kepler(M, e) {
  let E = M + (e / RAD) * sin(M) * (1 + e * cos(M));
  for (let i = 0; i < 8; i++) {
    const dE = (E - (e / RAD) * sin(E) - M) / (1 - e * cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return E;
}

function elements(name, d) {
  switch (name) {
    case 'Sun': return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.047 + 0.9856002585 * d };
    case 'Moon': return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d };
    case 'Mercury': return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
    case 'Venus': return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
    case 'Mars': return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
    case 'Jupiter': return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
    case 'Saturn': return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
    case 'Uranus': return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d };
    case 'Neptune': return { N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d };
    // Chiron: two-body orbit anchored to its 1996-02-14 perihelion. Approximate (about +/-2 degrees).
    case 'Chiron': {
      const a = 13.69, P = 365.25 * Math.pow(a, 1.5);
      return { N: 209.3 + 3.82e-5 * d, i: 6.93, w: 339.3, a, e: 0.379, M: 360 * (d - (2450128.5 - 2451543.5)) / P };
    }
  }
}

function helio(el) {
  const M = norm(el.M);
  const E = kepler(M, el.e);
  const xv = el.a * (cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * sin(E);
  const v = atan2(yv, xv);
  const r = Math.hypot(xv, yv);
  const vw = v + el.w;
  return {
    x: r * (cos(el.N) * cos(vw) - sin(el.N) * sin(vw) * cos(el.i)),
    y: r * (sin(el.N) * cos(vw) + cos(el.N) * sin(vw) * cos(el.i)),
    z: r * sin(vw) * sin(el.i),
    r,
  };
}

function sunGeo(d) {
  const el = elements('Sun', d);
  const M = norm(el.M);
  const E = kepler(M, el.e);
  const xv = cos(E) - el.e, yv = Math.sqrt(1 - el.e * el.e) * sin(E);
  const v = atan2(yv, xv), r = Math.hypot(xv, yv);
  const lon = norm(v + el.w);
  return { lon, r, x: r * cos(lon), y: r * sin(lon), M, L: norm(M + el.w) };
}

function moonLon(d) {
  const el = elements('Moon', d);
  const h = helio(el);
  let lon = atan2(h.y, h.x);
  const s = sunGeo(d);
  const Ms = s.M, Mm = norm(el.M), Ls = s.L, Lm = norm(el.M + el.w + el.N);
  const D = Lm - Ls, F = Lm - el.N;
  lon += -1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D)
    - 0.057 * sin(Mm - 2 * D + Ms) + 0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms)
    - 0.035 * sin(D) - 0.031 * sin(Mm + Ms) - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D);
  return norm(lon);
}

function plutoHelio(d) {
  const S = 50.03 + 0.033459652 * d, P = 238.95 + 0.003968789 * d;
  const lon = 238.9508 + 0.00400703 * d - 19.799 * sin(P) + 19.848 * cos(P) + 0.897 * sin(2 * P) - 4.956 * cos(2 * P)
    + 0.61 * sin(3 * P) + 1.211 * cos(3 * P) - 0.341 * sin(4 * P) - 0.19 * cos(4 * P) + 0.128 * sin(5 * P) - 0.034 * cos(5 * P)
    - 0.038 * sin(6 * P) + 0.031 * cos(6 * P) + 0.02 * sin(S - P) - 0.01 * cos(S - P) + 3.82394e-5 * d;
  const lat = -3.9082 - 5.453 * sin(P) - 14.975 * cos(P) + 3.527 * sin(2 * P) + 1.673 * cos(2 * P) - 1.051 * sin(3 * P)
    + 0.328 * cos(3 * P) + 0.179 * sin(4 * P) - 0.292 * cos(4 * P) + 0.019 * sin(5 * P) + 0.1 * cos(5 * P)
    - 0.031 * sin(6 * P) - 0.026 * cos(6 * P) + 0.011 * cos(S - P);
  const r = 40.72 + 6.68 * sin(P) + 6.9 * cos(P) - 1.18 * sin(2 * P) - 0.03 * cos(2 * P) + 0.15 * sin(3 * P) - 0.14 * cos(3 * P);
  return { x: r * cos(lat) * cos(lon), y: r * cos(lat) * sin(lon), z: r * sin(lat) };
}

function planetLonRaw(name, d) {
  if (name === 'Sun') return sunGeo(d).lon;
  if (name === 'Moon') return moonLon(d);
  if (name === 'Node') return norm(125.1228 - 0.0529538083 * d);
  let h;
  if (name === 'Pluto') h = plutoHelio(d);
  else {
    h = helio(elements(name, d));
    if (name === 'Jupiter' || name === 'Saturn' || name === 'Uranus') {
      const Mj = norm(19.895 + 0.0830853001 * d), Ms = norm(316.967 + 0.0334442282 * d), Mu = norm(142.5905 + 0.011725806 * d);
      let lon = atan2(h.y, h.x), dl = 0;
      if (name === 'Jupiter') dl = 0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21)
        - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
      if (name === 'Saturn') dl = 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3)
        + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
      if (name === 'Uranus') dl = 0.04 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
      lon += dl;
      const rxy = Math.hypot(h.x, h.y);
      h = { x: rxy * cos(lon), y: rxy * sin(lon), z: h.z };
    }
  }
  const s = sunGeo(d);
  return norm(atan2(h.y + s.y, h.x + s.x));
}

// Longitude and daily speed of one body at a given Julian Day (UT).
export function body(name, j) {
  const d = dayNum(j);
  const lon = planetLonRaw(name, d);
  const lon2 = planetLonRaw(name, d + 0.5);
  let speed = (lon2 - lon) * 2;
  if (speed > 180) speed -= 720; if (speed < -180) speed += 720;
  return { name, lon, speed, retro: speed < 0 && name !== 'Node' };
}

export function positions(j, names = PLANETS) {
  const out = {};
  for (const n of names) out[n] = body(n, j);
  return out;
}

export const obliquity = (j) => 23.4393 - 3.563e-7 * dayNum(j);
export function gmst(j) {
  const T = (j - 2451545) / 36525;
  return norm(280.46061837 + 360.98564736629 * (j - 2451545) + 0.000387933 * T * T);
}

// Angles and houses. lat/lon in degrees (east positive).
export function angles(j, lat, lon) {
  const eps = obliquity(j);
  const ramc = norm(gmst(j) + lon);
  const mc = norm(atan2(sin(ramc), cos(ramc) * cos(eps)));
  const asc = norm(atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(lat * RAD) * sin(eps))));
  const vertex = norm(atan2(cos(ramc + 180), -(sin(ramc + 180) * cos(eps) + Math.tan((-90 + Math.abs(lat)) * RAD * Math.sign(lat || 1)) * sin(eps))));
  return { asc, mc, ramc, eps, vertex };
}

function eclFromRA(ra, eps) { return norm(atan2(sin(ra), cos(ra) * cos(eps))); }

export function houses(j, lat, lon, system = 'placidus') {
  const { asc, mc, ramc, eps } = angles(j, lat, lon);
  const cusps = new Array(12);
  if (system === 'whole') {
    const s = Math.floor(asc / 30) * 30;
    for (let i = 0; i < 12; i++) cusps[i] = norm(s + 30 * i);
    return { cusps, asc, mc, system };
  }
  if (system === 'equal' || Math.abs(lat) > 66) {
    for (let i = 0; i < 12; i++) cusps[i] = norm(asc + 30 * i);
    return { cusps, asc, mc, system: Math.abs(lat) > 66 && system !== 'equal' ? 'equal (Placidus undefined at this latitude)' : 'equal' };
  }
  const tanPhi = Math.tan(lat * RAD);
  const cusp = (f, below) => {
    let lam = norm(mc + (below ? 180 : 0) + 30 * 3 * f);
    for (let k = 0; k < 20; k++) {
      const dec = Math.asin(sin(eps) * sin(lam)) / RAD;
      let x = tanPhi * Math.tan(dec * RAD);
      x = Math.max(-1, Math.min(1, x));
      const sda = 90 + Math.asin(x) / RAD;
      const ra = below ? ramc + sda + f * (180 - sda) : ramc + f * sda;
      const next = eclFromRA(ra, eps);
      if (Math.abs(next - lam) < 1e-6) { lam = next; break; }
      lam = next;
    }
    return lam;
  };
  cusps[9] = mc; cusps[0] = asc;
  cusps[10] = cusp(1 / 3, false); cusps[11] = cusp(2 / 3, false);
  cusps[1] = cusp(1 / 3, true); cusps[2] = cusp(2 / 3, true);
  cusps[3] = norm(mc + 180); cusps[4] = norm(cusps[10] + 180); cusps[5] = norm(cusps[11] + 180);
  cusps[6] = norm(asc + 180); cusps[7] = norm(cusps[1] + 180); cusps[8] = norm(cusps[2] + 180);
  return { cusps, asc, mc, system: 'placidus' };
}

export function houseOf(lon, cusps) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i], b = cusps[(i + 1) % 12];
    const span = norm(b - a), off = norm(lon - a);
    if (off < span) return i + 1;
  }
  return 1;
}

export const signOf = (lon) => Math.floor(norm(lon) / 30);
export function fmtDeg(lon, withSign = true) {
  const l = norm(lon), s = Math.floor(l / 30), deg = l - s * 30;
  let dd = Math.floor(deg), mm = Math.round((deg - dd) * 60);
  if (mm === 60) { dd += 1; mm = 0; }
  return `${dd}°${String(mm).padStart(2, '0')}'` + (withSign ? ` ${SIGNS[s]}` : '');
}
export const angDist = (a, b) => { const x = Math.abs(norm(a - b)); return x > 180 ? 360 - x : x; };

// Lahiri ayanamsa, linear approximation.
export const ayanamsa = (j) => 23.8531 + 1.39697 * ((j - 2451545) / 36525);

// Moon phase: elongation of Moon from Sun (0 = new, 180 = full).
export function moonPhase(j) {
  const e = norm(body('Moon', j).lon - body('Sun', j).lon);
  const illum = (1 - cos(e)) / 2;
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const idx = Math.floor(norm(e + 22.5) / 45) % 8;
  return { elong: e, illum, name: names[idx], index: idx, waxing: e < 180 };
}

// Find the instant (JD) after j0 when f(j) crosses target. f returns degrees.
export function findCrossing(f, target, j0, step, maxSteps = 4000) {
  const g = (j) => { let x = norm(f(j) - target); return x > 180 ? x - 360 : x; };
  let a = j0, ga = g(a);
  for (let i = 0; i < maxSteps; i++) {
    const b = a + step, gb = g(b);
    if (ga < 0 && gb >= 0 && gb - ga < 180) {
      let lo = a, hi = b;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; }
      return (lo + hi) / 2;
    }
    a = b; ga = gb;
  }
  return null;
}

export function nextLunation(j0, phaseDeg) {
  return findCrossing((j) => body('Moon', j).lon - body('Sun', j).lon, phaseDeg, j0, 1);
}

// Upcoming lunar phases, with approximate eclipse detection (node distance).
export function lunations(j0, days) {
  const out = [];
  const end = j0 + days;
  for (const [deg, name] of [[0, 'New Moon'], [90, 'First Quarter'], [180, 'Full Moon'], [270, 'Last Quarter']]) {
    let j = j0;
    while (true) {
      const t = nextLunation(j, deg);
      if (!t || t > end) break;
      const sun = body('Sun', t).lon, node = body('Node', t).lon;
      const nd = Math.min(angDist(sun, node), angDist(sun, node + 180));
      let eclipse = null;
      if (deg === 0 && nd < 17) eclipse = 'Solar eclipse';
      if (deg === 180 && nd < 17) eclipse = 'Lunar eclipse';
      out.push({ jd: t, name, moonLon: body('Moon', t).lon, eclipse });
      j = t + 20;
    }
  }
  return out.sort((a, b) => a.jd - b.jd);
}

// Retrograde stations within a window.
export function stations(name, j0, days) {
  const out = [];
  let prev = body(name, j0).speed;
  for (let j = j0 + 1; j <= j0 + days; j += 1) {
    const s = body(name, j).speed;
    if ((prev < 0) !== (s < 0)) {
      let lo = j - 1, hi = j;
      for (let k = 0; k < 25; k++) { const m = (lo + hi) / 2; if ((body(name, m).speed < 0) === (prev < 0)) lo = m; else hi = m; }
      out.push({ jd: hi, name, type: s < 0 ? 'stations retrograde' : 'stations direct', lon: body(name, hi).lon });
    }
    prev = s;
  }
  return out;
}

// Time when the Sun reaches a given longitude, searching forward from j0.
export const sunAt = (lon, j0) => findCrossing((j) => body('Sun', j).lon, lon, j0, 1, 400);

// Every time a body reaches a longitude within a window (handles retrograde passes).
export function passes(name, lon, j0, days, step = 2) {
  const out = [];
  const g = (j) => { let x = norm(body(name, j).lon - lon); return x > 180 ? x - 360 : x; };
  let a = j0, ga = g(a);
  for (let b = j0 + step; b <= j0 + days; b += step) {
    const gb = g(b);
    if (Math.sign(ga) !== Math.sign(gb) && Math.abs(gb - ga) < 90) {
      let lo = a, hi = b, glo = ga;
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2, gm = g(m); if (Math.sign(gm) === Math.sign(glo)) { lo = m; glo = gm; } else hi = m; }
      out.push((lo + hi) / 2);
    }
    a = b; ga = gb;
  }
  return out;
}

// Approximate sunrise/sunset (JD) for a date at lat/lon. Returns null at polar day/night.
export function sunTimes(j0Midnight, lat, lon) {
  const jn = j0Midnight + 0.5 - lon / 360;
  const sl = body('Sun', jn).lon, eps = obliquity(jn);
  const dec = Math.asin(sin(eps) * sin(sl)) / RAD;
  const ra = norm(atan2(cos(eps) * sin(sl), cos(sl)));
  const cosH = (sin(-0.833) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
  if (cosH < -1 || cosH > 1) return null;
  const H = Math.acos(cosH) / RAD;
  const transit = jn + (norm(ra - gmst(jn) - lon + 180) - 180) / 360.9856;
  return { rise: transit - H / 360.9856, set: transit + H / 360.9856, transit };
}

// Wall-clock time in an IANA zone -> UTC Date.
export function zonedToUtc(y, mo, d, h, mi, tz) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const off = tzOffsetMinutes(new Date(guess), tz);
  let t = guess - off * 60000;
  const off2 = tzOffsetMinutes(new Date(t), tz);
  if (off2 !== off) t = guess - off2 * 60000;
  return new Date(t);
}
export function tzOffsetMinutes(date, tz) {
  try {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return Math.round((asUtc - date.getTime()) / 60000);
  } catch { return -date.getTimezoneOffset(); }
}
