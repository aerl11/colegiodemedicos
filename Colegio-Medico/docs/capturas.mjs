export default async function run(page, ui) {
  const shots = 'C:/Users/PC1/Desktop/Colegio-Medico/Colegio-Medico/docs/img_manual';
  const fs = await import('node:fs');
  fs.mkdirSync(shots, { recursive: true });
  const shot = (name) => page.screenshot({ path: `${shots}/${name}.png`, fullPage: false });

  // 1. Login
  await page.waitForSelector('input', { timeout: 20000 });
  await page.waitForTimeout(1500);
  await shot('01_login');

  // 2. Registro - paso 1
  const snap = await ui.snapshot();
  const reg = snap.match(/@(e\d+) button[^"]*"Registrarme|@(e\d+) button[^"]*Registro/i)?.[1]
    || snap.match(/@(e\d+) button[^"]*Crear|@(e\d+) link/i)?.[1];
  // Try clicking any button containing "Registr"
  const regRef = (snap.match(/@(e\d+)/g) || []).find(() => false);
  // fallback: click by text
  try {
    await page.getByText(/registr/i).first().click({ timeout: 3000 });
  } catch {
    // maybe a link
    await page.locator('a, button', { hasText: /registr/i }).first().click({ timeout: 3000 }).catch(() => { });
  }
  await page.waitForTimeout(1200);
  await shot('02_registro_paso1');

  // paso 2: click Siguiente
  try { await page.getByText(/siguiente|continuar/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(800);
  await shot('03_registro_paso2');

  // paso 3
  try { await page.getByText(/siguiente|continuar/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(800);
  await shot('04_registro_paso3');

  // back to login
  try { await page.getByText(/volver|iniciar|regresar|atr/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1000);

  // 5. Forgot password
  try { await page.getByText(/olvid/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1000);
  await shot('05_recuperar_contrasena');
  try { await page.getByText(/volver|regresar|atr/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(800);

  // 6. Login as admin
  await page.locator('input').first().fill('admin1');
  await page.locator('input[type=password]').first().fill('ManualAdmin2026');
  await page.waitForTimeout(300);
  const loginBtn = await ui.snapshot();
  const btnRef = (loginBtn.match(/@(e\d+) button/g) || []).join('\n');
  // click the submit button (last button on form usually)
  try {
    await page.locator('button[type=submit]').first().click({ timeout: 3000 });
  } catch {
    const refs = loginBtn.match(/@(e\d+) button/g) || [];
    const last = refs[refs.length - 1]?.match(/e\d+/)?.[0];
    if (last) await ui.click('@' + last);
  }
  await page.waitForTimeout(3500);
  await shot('06_dashboard_jornadas');

  // 7. Inscripciones tab
  try { await page.getByText('Mis Inscripciones', { exact: false }).first().click({ timeout: 3000 }); } catch {
    try { await page.getByText('Inscripciones').first().click({ timeout: 3000 }); } catch { }
  }
  await page.waitForTimeout(1200);
  await shot('07_inscripciones');

  // 8. Pagos tab
  try { await page.getByText('Pagos', { exact: false }).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1200);
  await shot('08_pagos');

  // 9. Gestion jornadas
  try { await page.getByText(/Panel de Control de Jornadas|Gestionar Jornadas|Jornadas \(Admin\)/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1200);
  await shot('09_gestion_jornadas');

  // 10. Nueva jornada modal
  try { await page.getByText('+ Nueva Jornada').first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1000);
  await shot('10_nueva_jornada');
  try { await page.locator('.btn-close-modal, button:has-text("×")').first().click({ timeout: 2000 }); } catch { }
  await page.waitForTimeout(600);

  // 11. Gestion usuarios
  try { await page.getByText(/Panel de Control de Usuarios|Gestionar Usuarios/i).first().click({ timeout: 3000 }); } catch { }
  await page.waitForTimeout(1200);
  await shot('11_gestion_usuarios');

  return { done: true, files: fs.readdirSync(shots) };
}
