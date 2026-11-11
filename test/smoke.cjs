// Browser smoke test: every route renders without errors on a phone-sized viewport.
// Run: python3 -m http.server 8765 & node test/smoke.cjs
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
(async () => {
  const src = require('fs').readFileSync(__dirname + '/../js/registry.js', 'utf8');
  const ids = [...src.matchAll(/T\('([a-z0-9-]+)'/g)].map((m) => m[1]);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'America/New_York' });
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('sc.profile')) localStorage.setItem('sc.profile', JSON.stringify({ name: 'Alex', birthName: 'Alex Jordan Rivera', date: '1990-05-15', time: '10:30', tz: 'America/New_York', sex: 'female', place: { name: 'New York', lat: 40.71, lon: -74.01, tz: 'America/New_York' } }));
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${page.url()} console: ${m.text()}`); });
  const routes = ['#/today', '#/explore', '#/explore/astro', '#/compass', '#/journal', '#/profile', ...ids.map((i) => '#/t/' + i)];
  let bad = 0;
  for (const r of routes) {
    await page.goto(BASE + r);
    await page.waitForTimeout(r.includes('natal') || r.includes('cycles') || r.includes('year') ? 1500 : 350);
    const txt = await page.locator('#view').innerText();
    if (txt.includes('Something went wrong') || txt.trim().length < 20) { bad++; console.log('FAIL', r, txt.slice(0, 200)); }
    const primary = page.locator('#view .btn.primary').first();
    if (await primary.count()) { await primary.click().catch(() => {}); await page.waitForTimeout(400); }
    const after = await page.locator('#view').innerText();
    const junk = after.match(/(^|[\s(])(null|undefined|NaN|\[object Object\])([\s.,)]|$)/);
    if (junk) { bad++; console.log('JUNK TEXT', r, JSON.stringify(after.slice(Math.max(0, junk.index - 60), junk.index + 60))); }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (sw) console.log('HORIZONTAL SCROLL', r);
  }
  // Compass end-to-end
  await page.goto(BASE + '#/compass'); await page.locator('#view .btn.primary').first().click(); await page.waitForTimeout(2500);
  console.log('compass sections:', await page.locator('#view .sec h2').allInnerTexts());
  console.log(`${routes.length} routes, ${bad} failed, ${errors.length} errors`);
  errors.slice(0, 30).forEach((e) => console.log('ERR', e));
  await browser.close();
  process.exit(bad || errors.length ? 1 : 0);
})();
