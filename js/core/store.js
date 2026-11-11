// Local-only persistence. Small JSON in localStorage, photos in IndexedDB.
const P = 'sc.';

export function get(key, fallback = null) {
  try { const v = localStorage.getItem(P + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}
export function set(key, value) {
  try { localStorage.setItem(P + key, JSON.stringify(value)); return true; } catch { return false; }
}
export function del(key) { try { localStorage.removeItem(P + key); } catch {} }

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const profile = () => get('profile', {});
export const setProfile = (p) => set('profile', p);

const DEFAULT_SETTINGS = { deck: 'rws', reversals: true, houses: 'placidus', zodiac: 'tropical', numerology: 'pythagorean', theme: 'auto' };
export const settings = () => ({ ...DEFAULT_SETTINGS, ...get('settings', {}) });
export const setSettings = (s) => set('settings', { ...settings(), ...s });

// Collections: readings, dreams, sync, notes
export function list(kind) { return get('c.' + kind, []); }
export function add(kind, item) {
  const items = list(kind);
  const rec = { id: uid(), at: new Date().toISOString(), ...item };
  items.unshift(rec);
  set('c.' + kind, items);
  return rec;
}
export function update(kind, id, patch) {
  const items = list(kind).map((x) => (x.id === id ? { ...x, ...patch } : x));
  set('c.' + kind, items);
}
export function remove(kind, id) { set('c.' + kind, list(kind).filter((x) => x.id !== id)); }

// Saved results of quizzes/profiles, keyed by tool id. Used by the Compass synthesis.
export const results = () => get('results', {});
export function saveResult(key, value) { const r = results(); r[key] = { ...value, at: new Date().toISOString() }; set('results', r); }

// ---- IndexedDB for photos ----
let dbp;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('soul-compass', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction('photos', mode);
    const req = fn(t.objectStore('photos'));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
  });
}
export const putPhoto = (id, dataUrl) => tx('readwrite', (s) => s.put(dataUrl, id));
export const getPhoto = (id) => tx('readonly', (s) => s.get(id));
export const delPhoto = (id) => tx('readwrite', (s) => s.delete(id));
export const allPhotoKeys = () => tx('readonly', (s) => s.getAllKeys());

export async function exportAll() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(P)) data[k] = localStorage.getItem(k);
  }
  const photos = {};
  try { for (const k of await allPhotoKeys()) photos[k] = await getPhoto(k); } catch {}
  return { app: 'soul-compass', version: 1, exported: new Date().toISOString(), data, photos };
}
export async function importAll(obj) {
  if (!obj || obj.app !== 'soul-compass') throw new Error('Not a Soul Compass backup file');
  for (const [k, v] of Object.entries(obj.data || {})) if (k.startsWith(P)) localStorage.setItem(k, v);
  for (const [k, v] of Object.entries(obj.photos || {})) await putPhoto(k, v);
}
export async function wipe() {
  Object.keys(localStorage).filter((k) => k.startsWith(P)).forEach((k) => localStorage.removeItem(k));
  try { const d = await db(); d.close(); } catch {}
  dbp = null;
  await new Promise((r) => { const q = indexedDB.deleteDatabase('soul-compass'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
}
