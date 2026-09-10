/* ==========================================================================
   CONFIGURACIÓN Y ESTADO GLOBAL
   ========================================================================== */
const API_URL = "http://127.0.0.1:5000/api/comentarios";

let simulacionActiva = false;
let intervaloSimulacion = null;
let graficoChart = null;

let totalMenciones = 0;
let totalPositivas = 0;
let totalNegativas = 0;

// Contador exclusivo para limitar la simulación a 10 nuevos comentarios
let contadorSimulacionActual = 0;
const LIMITE_SIMULACION = 10;

const plataformas = ["X (Twitter)", "Facebook", "Instagram", "LinkedIn"];

const comentariosSimulados = [
  {
    texto:
      "¡Excelente servicio al cliente! Me resolvieron el problema de inmediato.",
    sentimiento: "positivo",
  },
  {
    texto:
      "Pésima experiencia, la plataforma se cae a cada rato y no hay soporte.",
    sentimiento: "negativo",
  },
  {
    texto:
      "Me encanta la nueva actualización del producto, funciona increíble.",
    sentimiento: "positivo",
  },
  {
    texto: "El tiempo de espera en la atención telefónica es inaceptable.",
    sentimiento: "negativo",
  },
  {
    texto: "Muy buena relación calidad-precio. Lo recomiendo totalmente.",
    sentimiento: "positivo",
  },
  {
    texto: "Hubo un error en mi cobro y nadie me da respuesta. Muy molesto.",
    sentimiento: "negativo",
  },
  {
    texto: "Súper fácil de usar y la interfaz se ve moderna y limpia.",
    sentimiento: "positivo",
  },
];

/* ==========================================================================
   MANEJO Y FORMATEO DE FECHAS
   ========================================================================== */

function normalizarSentimiento(sentimiento) {
  if (!sentimiento) return "bueno";
  const s = sentimiento.toString().toLowerCase().trim();
  if (s === "positivo" || s === "bueno" || s === "pos") return "bueno";
  if (s === "negativo" || s === "malo" || s === "neg") return "malo";
  return "bueno";
}

function parsearFechaBD(fechaInput) {
  if (!fechaInput) return new Date();
  if (fechaInput instanceof Date) return fechaInput;

  let str = fechaInput.toString().trim();
  str = str.replace(" ", "T");

  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  const partes = str.split(/[- :T]/);
  if (partes.length >= 3) {
    return new Date(
      parseInt(partes[0], 10),
      parseInt(partes[1], 10) - 1,
      parseInt(partes[2], 10),
      partes[3] ? parseInt(partes[3], 10) : 0,
      partes[4] ? parseInt(partes[4], 10) : 0,
      partes[5] ? parseInt(partes[5], 10) : 0,
    );
  }

  return new Date();
}

function calcularTiempoTranscurrido(fechaOrigen) {
  const ahora = new Date();
  const fechaObjeto = parsearFechaBD(fechaOrigen);

  const segundos = Math.floor((ahora.getTime() - fechaObjeto.getTime()) / 1000);

  if (isNaN(segundos) || segundos < 10) return "Hace un momento";
  if (segundos < 60) return `Hace ${segundos} seg`;

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

function iniciarActualizadorTiempo() {
  setInterval(() => {
    const tarjetas = document.querySelectorAll(".comment-item[data-timestamp]");
    tarjetas.forEach((tarjeta) => {
      const timestamp = tarjeta.getAttribute("data-timestamp");
      const elementoRelativo = tarjeta.querySelector(".time-relative");
      if (timestamp && elementoRelativo) {
        elementoRelativo.textContent = calcularTiempoTranscurrido(timestamp);
      }
    });
  }, 5000);
}

/* ==========================================================================
   RENDERIZADO DE INTERFAZ Y MÉTRICAS
   ========================================================================== */

function crearTarjetaComentario(comentario, sentimientoNormalizado) {
  const fechaOrigen =
    comentario.fecha || comentario.fecha_creacion || comentario.timestamp;
  const fechaObjeto = parsearFechaBD(fechaOrigen);
  const timestampRaw = fechaOrigen;

  const horaExacta = fechaObjeto.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tiempoRelativo = calcularTiempoTranscurrido(fechaOrigen);
  const etiquetaSentimiento =
    sentimientoNormalizado === "bueno" ? "Positivo" : "Negativo";

  return `
    <div class="comment-item ${sentimientoNormalizado}" data-timestamp="${timestampRaw}">
      <div class="comment-header">
        <span class="platform-badge">${comentario.red_social || "General"} • ${etiquetaSentimiento}</span>
        <span class="time">
          <i class="far fa-clock"></i> ${horaExacta} • <span class="time-relative">${tiempoRelativo}</span>
        </span>
      </div>
      <p class="comment-text">${comentario.texto}</p>
    </div>
  `;
}

function agregarComentarioAlDOM(comentario) {
  const lista = document.getElementById("lista-comentarios");
  if (!lista) return;

  const sentimientoNormalizado = normalizarSentimiento(comentario.sentimiento);
  const htmlTarjeta = crearTarjetaComentario(
    comentario,
    sentimientoNormalizado,
  );

  lista.insertAdjacentHTML("afterbegin", htmlTarjeta);

  totalMenciones++;
  if (sentimientoNormalizado === "bueno") totalPositivas++;
  if (sentimientoNormalizado === "malo") totalNegativas++;

  actualizarMetricas();
}

function actualizarMetricas() {
  const txtTotal = document.getElementById("txt-total");
  const txtPositivos = document.getElementById("txt-positivos");
  const txtNegativos = document.getElementById("txt-negativos");

  if (txtTotal) txtTotal.textContent = totalMenciones;

  const pctPos =
    totalMenciones > 0
      ? Math.round((totalPositivas / totalMenciones) * 100)
      : 0;
  const pctNeg =
    totalMenciones > 0
      ? Math.round((totalNegativas / totalMenciones) * 100)
      : 0;

  if (txtPositivos) txtPositivos.textContent = `${pctPos}%`;
  if (txtNegativos) txtNegativos.textContent = `${pctNeg}%`;

  actualizarGrafico(totalPositivas, totalNegativas);
  verificarAlarma();
}

function verificarAlarma() {
  const inputUmbral = document.getElementById("umbral-alerta");
  const statusBox = document.getElementById("status-box");
  const statusText = document.getElementById("status-text");

  const umbralConfigurado = inputUmbral
    ? parseInt(inputUmbral.value) || 80
    : 80;
  const pctNegativas =
    totalMenciones > 0 ? (totalNegativas / totalMenciones) * 100 : 0;

  if (totalMenciones >= 3 && pctNegativas >= umbralConfigurado) {
    if (statusBox) statusBox.classList.add("critico");
    if (statusText) statusText.textContent = "Crítico";
  } else {
    if (statusBox) statusBox.classList.remove("critico");
    if (statusText) statusText.textContent = "Estable";
  }
}

function inicializarGrafico() {
  const ctx = document.getElementById("graficoSentimiento");
  if (!ctx) return;

  graficoChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Positivos", "Negativos"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#2ea043", "#f85149"],
          borderColor: "#161b22",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#8b949e", font: { size: 12 } },
        },
      },
    },
  });
}

function actualizarGrafico(positivos, negativos) {
  if (graficoChart) {
    graficoChart.data.datasets[0].data = [positivos, negativos];
    graficoChart.update();
  }
}

/* ==========================================================================
   FUNCIÓN DE REINICIO DEL DASHBOARD
   ========================================================================== */

window.reiniciarDashboard = function () {
  totalMenciones = 0;
  totalPositivas = 0;
  totalNegativas = 0;
  contadorSimulacionActual = 0;

  // Vaciar lista en el DOM
  const lista = document.getElementById("lista-comentarios");
  if (lista) lista.innerHTML = "";

  // Resetear contadores visuales y gráfico
  actualizarMetricas();

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "info",
      title: "Reiniciado",
      text: "Se han restablecido los contadores y el historial de comentarios.",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};

/* ==========================================================================
   CARGA DE BASE DE DATOS Y SIMULACIÓN CON CONTROL Y LÍMITE (10)
   ========================================================================== */

async function cargarComentariosBD() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

    const comentarios = await respuesta.json();
    const lista = document.getElementById("lista-comentarios");
    if (lista) lista.innerHTML = "";

    totalMenciones = 0;
    totalPositivas = 0;
    totalNegativas = 0;

    if (Array.isArray(comentarios) && comentarios.length > 0) {
      comentarios.reverse().forEach((comentario) => {
        agregarComentarioAlDOM(comentario);
      });
    }
  } catch (error) {
    console.error("❌ Error al cargar datos desde Flask:", error);
  }
}

async function procesarNuevoComentario(nuevoComentario) {
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoComentario),
    });

    if (respuesta.ok) {
      const resultado = await respuesta.json();
      const comentarioGuardado = resultado.comentario || resultado;
      agregarComentarioAlDOM(comentarioGuardado);
    }
  } catch (error) {
    console.error("❌ Error enviando comentario:", error);
  }
}

function generarComentarioAleatorio() {
  if (contadorSimulacionActual >= LIMITE_SIMULACION) {
    console.log(
      "🛑 Límite de 10 comentarios simulados alcanzado. Deteniendo simulación.",
    );
    detenerSimulacion();
    return;
  }

  const plantilla =
    comentariosSimulados[
      Math.floor(Math.random() * comentariosSimulados.length)
    ];
  const redSocial = plataformas[Math.floor(Math.random() * plataformas.length)];

  const nuevoComentario = {
    texto: plantilla.texto,
    sentimiento: plantilla.sentimiento,
    red_social: redSocial,
    fecha: new Date().toISOString(),
  };

  contadorSimulacionActual++;
  procesarNuevoComentario(nuevoComentario);
}

function iniciarSimulacion() {
  if (contadorSimulacionActual >= LIMITE_SIMULACION) {
    contadorSimulacionActual = 0; // Reinicia la cuenta si pulsa reanudar tras llegar a 10
  }

  if (!intervaloSimulacion) {
    intervaloSimulacion = setInterval(generarComentarioAleatorio, 3500);
  }
  simulacionActiva = true;

  const btn = document.getElementById("btn-simulacion");
  if (btn) btn.textContent = "Pausar";
}

function detenerSimulacion() {
  if (intervaloSimulacion) {
    clearInterval(intervaloSimulacion);
    intervaloSimulacion = null;
  }
  simulacionActiva = false;

  const btn = document.getElementById("btn-simulacion");
  if (btn) btn.textContent = "Reanudar";
}

// Expuesta globalmente para que funcione vía onclick
window.controlarSimulacion = function () {
  if (simulacionActiva) {
    detenerSimulacion();
  } else {
    iniciarSimulacion();
  }
};

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  inicializarGrafico();
  iniciarActualizadorTiempo();

  // 1. Cargar comentarios guardados en MySQL
  await cargarComentariosBD();

  // 2. Iniciar simulación de 10 comentarios
  iniciarSimulacion();
});
