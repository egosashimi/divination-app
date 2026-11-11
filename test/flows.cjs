// Interaction flows: questionnaires, inputs, saving to the journal.
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], timezoneId: 'America/New_York' });
  await ctx.addInitScript(() => { if (!localStorage.getItem('sc.profile')) localStorage.setItem('sc.profile', JSON.stringify({ name: 'Alex', birthName: 'Alex Jordan Rivera', date: '1990-05-15', time: '10:30', tz: 'America/New_York', sex: 'female', place: { name: 'New York', lat: 40.71, lon: -74.01, tz: 'America/New_York' } })); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`));
  page.on('dialog', (d) => d.accept());
  const go = async (r) => { await page.goto(BASE + r); await page.waitForTimeout(400); };
  const text = () => page.locator('#view').innerText();
  const fails = [];
  const expect = async (label, re) => { const t = await text(); if (!re.test(t)) fails.push(`${label}: ${re} not found`); };

  for (const id of ['chakras', 'yinyang', 'enneagram', 'temperaments', 'archetypes', 'bigfive', 'jungian', 'disc', 'wuxing']) {
    await go('#/t/' + id);
    const rows = page.locator('.likert');
    const n = await rows.count();
    for (let i = 0; i < n; i++) await rows.nth(i).locator('button').nth((i * 3) % 5).click();
    await page.locator('.quiz > .btn').click(); await page.waitForTimeout(300);
    await expect(id, /Save to journal/);
  }
  for (const id of ['palm', 'face', 'iris', 'tongue', 'fingerprint', 'ear', 'foot', 'aura', 'ayurveda']) {
    await go('#/t/' + id);
    const rows = page.locator('.quiz .opts');
    const n = await rows.count();
    for (let i = 0; i < n; i++) await rows.nth(i).locator('button').first().click();
    await page.locator('.quiz > .btn').click(); await page.waitForTimeout(300);
    await expect(id, /Save to journal/);
  }
  await go('#/t/synastry'); await page.locator('input[type=date]').nth(1).fill('1988-11-02'); await page.getByText('Compare', { exact: true }).click(); await page.waitForTimeout(300); await expect('synastry', /Overall harmony/);
  await go('#/t/horary'); await page.locator('textarea').fill('Will I get the job?'); await page.getByRole('button', { name: 'Cast the chart now', exact: true }).click(); await page.waitForTimeout(500); await expect('horary', /Judgment|Indication/);
  await go('#/t/electional'); await page.getByRole('button', { name: 'Find good days', exact: true }).click(); await page.waitForTimeout(1500); await expect('electional', /score/);
  await go('#/t/gematria'); await page.locator('#view input').fill('שלום love'); await page.getByRole('button', { name: 'Calculate', exact: true }).click(); await expect('gematria', /Hebrew/);
  await go('#/t/angel'); await page.locator('#view input').fill('1111'); await page.getByRole('button', { name: 'Read', exact: true }).click(); await expect('angel', /gateway/);
  await go('#/t/address'); await page.locator('#view input').fill('12B'); await page.getByRole('button', { name: 'Calculate', exact: true }).click(); await expect('address', /House number/);
  await go('#/t/values'); for (const v of ['Love', 'Freedom', 'Wisdom']) await page.getByRole('button', { name: v, exact: true }).click(); await page.getByRole('button', { name: 'Save my values', exact: true }).click(); await expect('values', /Value 1/i);
  await go('#/t/purpose'); await page.locator('textarea').first().fill('writing, music'); await page.locator('textarea').nth(1).fill('writing'); await page.getByRole('button', { name: 'Map it', exact: true }).click(); await expect('purpose', /writing/);
  await go('#/t/biblio'); await page.getByRole('button', { name: 'Open at random', exact: true }).click(); await expect('biblio', /Save to journal/);
  await go('#/t/pendulum'); await page.getByRole('button', { name: 'Ask the pendulum', exact: true }).click(); await page.waitForTimeout(5000); await expect('pendulum', /Save to journal/);
  await go('#/t/kaucim'); await page.getByRole('button', { name: 'Shake the sticks', exact: true }).click(); for (let i = 0; i < 8; i++) { const b = page.getByRole('button', { name: 'Throw the moon blocks' }); if (await b.count()) await b.click(); await page.waitForTimeout(100); }
  await go('#/t/obs-tea'); await page.getByRole('button', { name: 'Anchor', exact: true }).click(); await page.getByRole('button', { name: 'Interpret', exact: true }).click(); await expect('tea', /Stability/);
  await go('#/t/cledon'); await page.locator('textarea').nth(1).fill('the bridge is open'); await page.getByRole('button', { name: 'Reflect', exact: true }).click(); await expect('cledon', /Bridge/);
  // Save readings and check journal
  await go('#/t/tarot'); await page.getByRole('button', { name: 'Shuffle and draw', exact: true }).click(); await page.getByRole('button', { name: 'Reveal all', exact: true }).click(); await page.waitForTimeout(900); await page.getByRole('button', { name: 'Save to journal', exact: true }).click();
  await go('#/t/dreams'); await page.locator('textarea').fill('I was flying over the ocean and a snake turned into a door.'); await page.getByRole('button', { name: 'Save dream', exact: true }).click(); await page.waitForTimeout(200);
  await page.locator('textarea').fill('Again I was flying above water, then found a key.'); await page.getByRole('button', { name: 'Save dream', exact: true }).click(); await page.waitForTimeout(200);
  await expect('dreams recurring', /Flying x2/);
  await go('#/t/sync'); await page.locator('textarea').fill('Saw 444 three times'); await page.locator('#view input').first().fill('444'); await page.getByRole('button', { name: 'Log it', exact: true }).click();
  await go('#/t/shadow'); await page.locator('textarea').fill('Envy of my sister'); await page.getByRole('button', { name: 'Save entry', exact: true }).click();
  await go('#/journal/readings'); await expect('journal readings', /Tarot/);
  await go('#/journal/dreams'); await expect('journal dreams', /Untitled dream/);
  await go('#/journal/notes'); await expect('journal notes', /shadow/);
  await go('#/compass'); await page.getByRole('button', { name: 'Read the Compass', exact: true }).click(); await page.waitForTimeout(3000); await expect('compass', /Dreams/); await expect('compass', /Self-assessments/);
  const compassText = await text();
  // Profile save round trip
  await go('#/profile'); await page.locator('#view input').first().fill('Sam'); await page.getByRole('button', { name: 'Save profile', exact: true }).click(); await page.waitForTimeout(200);
  await go('#/today'); await expect('today greeting', /Sam/i);
  console.log(compassText.split('Each voice')[0].slice(0, 1500));
  console.log(`flows done: ${fails.length} failures, ${errors.length} errors`);
  fails.forEach((f) => console.log('FAIL', f)); errors.forEach((e) => console.log('ERR', e));
  await browser.close();
  process.exit(fails.length || errors.length ? 1 : 0);
})();
