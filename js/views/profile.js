import { h, clear, section, note, btn, seg, field, input, select, toast, kv } from '../core/ui.js';
import * as store from '../core/store.js';
import * as A from '../core/astro.js';

function zones() {
  try { return Intl.supportedValuesOf('timeZone'); } catch { return null; }
}

export function render(root, ctx) {
  const p = { ...store.profile() };
  const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const name = input({ value: p.name || '', placeholder: 'What should we call you?', autocomplete: 'given-name' });
  const birthName = input({ value: p.birthName || '', placeholder: 'Full name as on your birth certificate', autocomplete: 'name' });
  const date = input({ type: 'date', value: p.date || '' });
  const time = input({ type: 'time', value: p.time || '' });
  const tzList = zones();
  const tz = tzList ? select(tzList, p.tz || (p.place && p.place.tz) || deviceTz) : input({ value: p.tz || deviceTz });
  const placeName = input({ value: (p.place && p.place.name) || '', placeholder: 'City of birth' });
  const lat = input({ type: 'number', step: 'any', inputmode: 'decimal', value: p.place ? p.place.lat : '', placeholder: 'Latitude' });
  const lon = input({ type: 'number', step: 'any', inputmode: 'decimal', value: p.place ? p.place.lon : '', placeholder: 'Longitude (east +)' });
  const results = h('div');
  let sex = p.sex || '';

  async function search() {
    const qv = placeName.value.trim();
    if (!qv) return;
    clear(results);
    results.append(h('p', { class: 'hint' }, 'Searching...'));
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(qv)}&count=6&language=en&format=json`);
      const j = await r.json();
      clear(results);
      if (!j.results || !j.results.length) { results.append(h('p', { class: 'hint' }, 'No matches. Enter coordinates manually.')); return; }
      j.results.forEach((c) => results.append(h('button', { type: 'button', class: 'btn small', style: { margin: '4px 6px 0 0' }, onclick: () => {
        placeName.value = [c.name, c.admin1, c.country].filter(Boolean).join(', ');
        lat.value = c.latitude.toFixed(4); lon.value = c.longitude.toFixed(4);
        if (c.timezone && tzList && tzList.includes(c.timezone)) tz.value = c.timezone; else if (c.timezone) tz.value = c.timezone;
        clear(results); toast('Place set');
      } }, [c.name, c.admin1, c.country].filter(Boolean).join(', '))));
    } catch { clear(results); results.append(h('p', { class: 'hint' }, 'Search needs a connection. You can enter latitude and longitude manually.')); }
  }

  function save() {
    const np = { ...store.profile(), name: name.value.trim(), birthName: birthName.value.trim(), date: date.value, time: time.value, tz: tz.value, sex };
    if (lat.value !== '' && lon.value !== '') np.place = { name: placeName.value.trim(), lat: +lat.value, lon: +lon.value, tz: tz.value };
    else delete np.place;
    store.setProfile(np);
    toast('Profile saved');
    summary();
  }
  const sum = h('div');
  function summary() {
    clear(sum);
    const pp = store.profile();
    if (!pp.date) return;
    try {
      const [y, m, d] = pp.date.split('-').map(Number);
      const [hh, mm] = (pp.time || '12:00').split(':').map(Number);
      const utc = A.zonedToUtc(y, m, d, hh, mm, pp.tz || deviceTz);
      sum.append(note(`Birth moment in UTC: ${utc.toISOString().replace('T', ' ').slice(0, 16)}${pp.time ? '' : ' (noon assumed, time unknown)'}. Sun in ${A.SIGNS[A.signOf(A.body('Sun', A.jd(utc)).lon)]}.`));
    } catch {}
  }

  const s = ctx.settings;
  const set = (k) => (v) => { store.setSettings({ [k]: v === 'true' ? true : v === 'false' ? false : v }); if (k === 'theme') window.dispatchEvent(new Event('sc-settings')); };
  const fileIn = h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden' });
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0]; if (!f) return;
    try { await store.importAll(JSON.parse(await f.text())); toast('Backup restored'); setTimeout(() => location.reload(), 600); } catch (e) { toast(e.message || 'Could not read backup'); }
  });

  root.append(
    section('You', field('Name', name), field('Birth name', birthName, 'Used for name numerology.'),
      h('div', { class: 'row' }, field('Birth date', date), field('Birth time', time, 'Leave blank if unknown.')),
      field('Birth place', h('div', { style: { display: 'flex', gap: '8px' } }, placeName, btn('Search', search, 'small'))), results,
      h('div', { class: 'row' }, field('Latitude', lat), field('Longitude', lon)),
      field('Time zone at birth', tz, 'Daylight saving at the birth date is handled automatically.'),
      field('Sex (optional)', seg([['', 'Not set'], ['female', 'Female'], ['male', 'Male']], sex, (v) => (sex = v)), 'Only used by BaZi luck pillars and the Feng Shui Kua number, which traditionally depend on it.'),
      h('div', { class: 'actions' }, btn('Save profile', save, 'primary')), sum),
    section('Settings',
      field('Appearance', seg([['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], s.theme, set('theme'))),
      field('Tarot deck naming', seg([['rws', 'Rider-Waite'], ['thoth', 'Thoth'], ['mar', 'Marseille']], s.deck, set('deck'))),
      field('Tarot reversals', seg([['true', 'On'], ['false', 'Off']], String(s.reversals), set('reversals'))),
      field('Zodiac', seg([['tropical', 'Tropical'], ['sidereal', 'Sidereal']], s.zodiac, set('zodiac'))),
      field('House system', seg([['placidus', 'Placidus'], ['whole', 'Whole sign'], ['equal', 'Equal']], s.houses, set('houses'))),
      field('Numerology', seg([['pythagorean', 'Pythagorean'], ['chaldean', 'Chaldean']], s.numerology, set('numerology')))),
    section('Your data',
      h('p', { class: 'muted' }, 'There are no accounts. Everything you enter, including photos, is stored only on this device. The only network request is the optional birthplace search, which sends the city name you type to the Open-Meteo geocoding service.'),
      h('div', { class: 'actions' },
        btn('Export backup', async () => { const data = await store.exportAll(); const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })), download: `soul-compass-${new Date().toISOString().slice(0, 10)}.json` }); document.body.append(a); a.click(); a.remove(); }),
        btn('Import backup', () => fileIn.click(), 'ghost'),
        btn('Erase everything', async () => { if (confirm('Erase your profile, journal, results and photos from this device? This cannot be undone.')) { await store.wipe(); toast('Erased'); setTimeout(() => location.reload(), 500); } }, 'ghost')), fileIn),
    section('About', h('p', { class: 'muted' }, 'Soul Compass presents divination, astrology and related traditions as tools for reflection and as cultural heritage. Nothing here is a scientific prediction or medical, legal or financial advice.'),
      h('p', { class: 'muted' }, 'Install on iPhone: in Safari tap Share, then Add to Home Screen. It works offline once opened.'),
      kv([['Ephemeris', 'After Paul Schlyter; about one arcminute for the Sun and Moon'], ['Version', '0.1']])));
  summary();
}
