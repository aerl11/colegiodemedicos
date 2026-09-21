import { createRequire } from 'node:module';
const require = createRequire('C:/Users/PC1/.vscode/extensions/danielsanmedium.dscodegpt-3.24.72/standalone/node_modules/');
const { chromium } = require('patchright');
import fs from 'node:fs';
import path from 'node:path';

const IMG = 'C:/Users/PC1/Desktop/Colegio-Medico/Colegio-Medico/docs/img_manual';
const OUT = 'C:/Users/PC1/Desktop/Colegio-Medico/Colegio-Medico/docs/Manual_de_Usuario_COMEZU.pdf';

const img = (name, caption) => {
  const p = path.join(IMG, name);
  if (!fs.existsSync(p)) return '';
  const b64 = fs.readFileSync(p).toString('base64');
  return `<figure><img src="data:image/png;base64,${b64}"/><figcaption>${caption}</figcaption></figure>`;
};

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.55; margin: 0; }
  .page { padding: 36px 48px; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { color: #0f3b66; font-size: 30px; border-bottom: 3px solid #c5a059; padding-bottom: 10px; }
  h2 { color: #0f3b66; font-size: 21px; margin-top: 28px; border-left: 5px solid #c5a059; padding-left: 10px; }
  h3 { color: #134e7f; font-size: 17px; margin-top: 20px; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px; text-align: left; }
  th { background: #0f3b66; color: #fff; }
  blockquote { background: #f0f7ff; border-left: 4px solid #3b82f6; margin: 12px 0; padding: 8px 14px; font-size: 13px; }
  figure { margin: 14px 0; text-align: center; page-break-inside: avoid; }
  figure img { max-width: 100%; max-height: 420px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
  figcaption { font-size: 12px; color: #64748b; margin-top: 6px; font-style: italic; }
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90vh; text-align: center; background: linear-gradient(160deg,#0f3b66,#134e7f); color: #fff; }
  .cover h1 { color: #fff; border: none; font-size: 40px; }
  .cover .sub { color: #c5a059; font-size: 20px; margin-top: 8px; }
  .cover .meta { margin-top: 40px; font-size: 14px; opacity: .85; }
  li { margin: 4px 0; }
</style></head><body>

<div class="cover page">
 <h1>📘 Manual de Usuario</h1>
 <div class="sub">Plataforma de Jornadas Científicas — COMEZU</div>
 <div>Colegio de Médicos del Estado Zulia</div>
 <div class="meta">Versión 1.0 — Sistema web de jornadas, inscripciones, pagos y certificados</div>
</div>

<div class="page">
<h1>1. Introducción</h1>
<p>Esta aplicación web permite a los médicos colegiados del estado Zulia:</p>
<ul>
 <li>Registrarse en la plataforma (médicos titulares o estudiantes).</li>
 <li>Consultar las jornadas científicas disponibles (afiche, fechas, costo y créditos UC).</li>
 <li>Inscribirse en una jornada reportando su pago (pago móvil, transferencia o efectivo).</li>
 <li>Consultar sus inscripciones y pagos reportados.</li>
 <li><b>Descargar su certificado</b> de participación en PDF una vez culminada la jornada.</li>
</ul>
<p>Los administradores (staff / superadmin) pueden además gestionar jornadas y usuarios, ver todos los pagos y descargar reportes en PDF.</p>

<h2>2. Requisitos de uso</h2>
<ul>
 <li>Navegador web moderno (Chrome, Edge, Firefox, Safari) con conexión a internet.</li>
 <li>Correo electrónico válido para registrarse y recuperar la contraseña.</li>
 <li>Para inscribirse: los datos del comprobante de pago.</li>
</ul>

<h2>3. Acceso al sistema</h2>
<h3>3.1 Iniciar sesión</h3>
<ol>
 <li>Abra la aplicación en su navegador.</li>
 <li>Escriba su <b>nombre de usuario</b> y <b>contraseña</b>.</li>
 <li>Presione el botón <b>Entrar</b>.</li>
</ol>
<blockquote>💡 Si ya había iniciado sesión con una sesión válida, el sistema lo lleva directo al panel principal.<br>⏱️ Por seguridad, la sesión <b>expira tras 5 minutos de inactividad</b>; si ocurre, vuelva a iniciar sesión.</blockquote>
${img('01_login.png', 'Figura 1. Pantalla de inicio de sesión del portal COMEZU.')}

<h3>3.2 Recuperar / restablecer contraseña</h3>
<ol>
 <li>Desde la pantalla de acceso, pulse <b>“¿Olvidaste tu contraseña?”</b>.</li>
 <li>Ingrese el correo asociado a su cuenta.</li>
 <li>Recibirá un <b>código de 6 dígitos</b> por correo electrónico.</li>
 <li>Ingrese el código junto con su nueva contraseña (mínimo 8 caracteres) y confírmela.</li>
</ol>
${img('05_recuperar_contrasena.png', 'Figura 2. Recuperación de contraseña con código de 6 dígitos enviado por correo.')}
</div>

<div class="page">
<h2>3.3 Registrarse (crear cuenta nueva)</h2>
<p>El registro se realiza en <b>3 pasos</b>. Desde la pantalla de acceso, pulse <b>“REGISTRARTE”</b>.</p>
<p><b>Paso 1 — Información Personal:</b> tipo de identificación (médico tipo <b>D</b> u otra categoría), cédula, nacionalidad, número COMEZU y especialidad (solo médicos), sociedad científica, nombres, apellidos y género.</p>
${img('02_registro_paso1.png', 'Figura 3. Registro — Paso 1: Información personal.')}
<p><b>Paso 2 — Datos de Contacto:</b> correo electrónico válido y número de teléfono.</p>
${img('03_registro_paso2.png', 'Figura 4. Registro — Paso 2: Datos de contacto.')}
<p><b>Paso 3 — Crear Cuenta:</b> nombre de usuario, contraseña (mínimo 8 caracteres; el sistema rechaza contraseñas muy comunes o solo numéricas) y su confirmación.</p>
${img('04_registro_paso3.png', 'Figura 5. Registro — Paso 3: Crear cuenta.')}
</div>

<div class="page">
<h1>4. Uso de la aplicación (usuarios médicos)</h1>
<h3>4.1 Jornadas (Inicio)</h3>
<p>Pantalla principal con tarjetas de cada jornada científica: afiche ampliable (clic en la imagen 🔍), nombre, estado (Activa/Inactiva), fechas, costo en Bs. y créditos (UC). Pulse <b>“Inscribirse”</b> en la jornada deseada; si ya está inscrito, el botón mostrará <b>“Ya Inscrito”</b>.</p>
${img('06_dashboard_jornadas.png', 'Figura 6. Panel principal con las jornadas científicas disponibles.')}

<h3>4.2 Inscribirse y reportar el pago</h3>
<ol>
 <li><b>Forma de pago:</b> Pago Móvil (BNC, tel. 0412-7629170, RIF J-07012462-8), Transferencia Bancaria (cuenta corriente BNC 0191-0565-22-2100659008) o Efectivo/Divisas en taquilla.</li>
 <li><b>Número de referencia:</b> copie la referencia del comprobante (obligatorio).</li>
 <li><b>Monto:</b> se precarga con el costo de la jornada.</li>
 <li><b>Fecha de pago:</b> por defecto el día de hoy.</li>
 <li>Pulse el botón de <b>registrar</b>. Su inscripción queda con el pago reportado.</li>
</ol>

<h3>4.3 Mis Inscripciones</h3>
${img('07_inscripciones.png', 'Figura 7. Sección de inscripciones con estado y descarga de certificado.')}
<p>🔒 El certificado se habilita <b>al culminar la jornada</b> (fecha final). Los administradores pueden descargarlo en cualquier momento.</p>

<h3>4.4 Mis Pagos</h3>
${img('08_pagos.png', 'Figura 8. Listado de pagos reportados con opción de descarga del reporte en PDF.')}
</div>

<div class="page">
<h1>5. Secciones de administración (staff / superadmin)</h1>
<h3>5.1 Panel de Control de Jornadas</h3>
<p>Permite crear jornadas con <b>+ Nueva Jornada</b> (nombre, fechas, costo, créditos UC, estado y afiche), editarlas o eliminarlas. Clic en la miniatura amplía el afiche.</p>
${img('09_gestion_jornadas.png', 'Figura 9. Panel de control de jornadas.')}
${img('10_nueva_jornada.png', 'Figura 10. Formulario de creación de una nueva jornada científica.')}
<h3>5.2 Panel de Control de Usuarios</h3>
<p>Lista los usuarios con nombre, cédula, correo y rol; incluye buscador y acciones para crear (<b>+ Nuevo Usuario</b>), editar o eliminar cuentas.</p>
${img('11_gestion_usuarios.png', 'Figura 11. Panel de control de usuarios.')}
<h3>5.3 Inscripciones y pagos globales</h3>
<p>Los administradores ven la información de todos los participantes (columnas de participante, correo y cédula) y pueden descargar certificados individuales y el reporte general de pagos en PDF.</p>
</div>

<div class="page">
<h1>6. Preguntas frecuentes</h1>
<p><b>❓ No puedo inscribirme en una jornada.</b><br>Verifique que la jornada esté <b>Activa</b>. Las inactivas no permiten inscripción.</p>
<p><b>❓ Ya pagué pero dice “Ya Inscrito” sin confirmación de pago verificado.</b><br>El sistema registra el pago como “reportado”. Para verificarlo, contacte a la administración.</p>
<p><b>❓ No aparece el botón del certificado.</b><br>Se habilita a partir de la <b>fecha final de la jornada</b>.</p>
<p><b>❓ Mi sesión se cerró sola.</b><br>Expira tras <b>5 minutos de inactividad</b>. Vuelva a iniciar sesión.</p>
<p><b>❓ Olvidé mi contraseña.</b><br>Use la recuperación: recibirá un código de 6 dígitos por correo.</p>
<p><b>❓ El registro rechaza mi contraseña.</b><br>Mínimo 8 caracteres, no muy común y no solo números.</p>

<h1>7. Recomendaciones de seguridad</h1>
<ul>
 <li>No comparta su contraseña ni su sesión.</li>
 <li>Use una contraseña única con letras, números y símbolos.</li>
 <li>Cierre sesión al terminar, especialmente en equipos compartidos.</li>
 <li>Verifique los datos bancarios mostrados antes de transferir.</li>
</ul>
<p style="margin-top:40px; color:#64748b; font-size:12px;"><i>Manual de la plataforma COMEZU — frontend React + backend Django REST.</i></p>
</div>

</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' } });
await browser.close();
console.log('PDF generado:', OUT);
