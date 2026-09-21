export default async function run(page, ui) {
  const shots = 'C:/Users/PC1/Desktop/Colegio-Medico/Colegio-Medico/docs/img_manual';
  const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('input', { timeout: 20000 });
  await page.waitForTimeout(1000);

  await page.locator('input').first().fill('admin1');
  await page.locator('input[type=password]').first().fill('ManualAdmin2026');
  await page.locator('button[type=submit], button:has-text("Entrar")').first().click();
  await page.waitForTimeout(4000);
  await shot('06_dashboard_jornadas');

  // Inscripciones (menú lateral)
  try { await page.getByText('Mis Inscripciones').first().click({ timeout: 3000 }); } catch {
    try { await page.getByText('Inscripciones', { exact: false }).first().click({ timeout: 3000 }); } catch { }
  }
  await page.waitForTimeout(1500);
  await shot('07_inscripciones');

  // Pagos
  try { await page.getByText(/^Pagos$|Mis Pagos|Todos los Pagos/).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1500);
  await shot('08_pagos');

  // Gestión de jornadas
  try { await page.getByText(/Control de Jornadas|Gestionar Jornadas/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1500);
  await shot('09_gestion_jornadas');

  // Modal nueva jornada
  try { await page.getByText('+ Nueva Jornada').first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1000);
  await shot('10_nueva_jornada');
  try { await page.locator('.btn-close-modal').first().click({ timeout: 2000 }); } catch { }
  await page.waitForTimeout(600);

  // Gestión de usuarios
  try { await page.getByText(/Control de Usuarios|Gestionar Usuarios/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1500);
  await shot('11_gestion_usuarios');

  return { done: true };
}
