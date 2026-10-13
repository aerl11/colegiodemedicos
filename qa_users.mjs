export default async function run(page, ui) {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.waitForTimeout(4000);
  const hasLogin = await page.locator('input').count();
  if (hasLogin) {
    await page.locator('input').first().fill('admin');
    await page.locator('input[type=password]').first().fill('ManualAdmin2026');
    await page.locator('button:has-text("Entrar")').first().click();
    await page.waitForTimeout(5000);
  }
  // abrir gestion usuarios
  await page.locator('button:has-text("Gestionar Usuarios")').first().evaluate(el => el.click());
  await page.waitForTimeout(2000);
  // abrir modal nuevo usuario
  await page.locator('button:has-text("+ Nuevo Usuario")').first().evaluate(el => el.click()).catch(e => { });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const sel = document.querySelector("select[name='codigoPais']");
    const inp = document.querySelector("input[name='telefono']");
    const card = document.querySelector('.modal-card');
    const r = el => el ? { w: el.getBoundingClientRect().width, right: el.getBoundingClientRect().right } : null;
    return {
      codPais: r(sel),
      telefono: r(inp),
      card: card ? { w: card.getBoundingClientRect().width } : null,
      bodyScrollW: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    };
  });
  await page.screenshot({ path: 'C:/Users/PC1/Desktop/Colegio-Medico/qa_users_modal.png' });
  return info;
}
