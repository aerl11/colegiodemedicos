export default async function run(page, ui) {
  const responses = [];
  page.on('response', r => { if (r.url().includes('/media/')) responses.push({ url: r.url(), status: r.status() }); });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('input', { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.locator('input').first().fill('admin1');
  await page.locator('input[type=password]').first().fill('ManualAdmin2026');
  await page.locator('button[type=submit], button:has-text("Entrar")').first().click();
  await page.waitForTimeout(6000);
  await page.waitForFunction(() => [...document.querySelectorAll('img')].every(i => i.complete), { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'C:/Users/PC1/Desktop/Colegio-Medico/Colegio-Medico/docs/img_manual/verificacion_dashboard.png' });
  const imgInfo = await page.evaluate(() =>
    [...document.querySelectorAll('.jornada-card img, .jornada-card-image')].map(i => ({
      src: i.src.slice(0, 130), complete: i.complete, naturalW: i.naturalWidth, visible: i.offsetParent !== null
    }))
  );
  return { imgInfo, mediaResponses: responses };
}
