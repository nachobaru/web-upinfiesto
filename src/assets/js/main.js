// Pequeñas mejoras que solo funcionan con JavaScript. Sin él, la web se ve igual de completa.

(function proximaMisa() {
  const caja = document.getElementById("proxima");
  const datos = document.getElementById("datos-misas");
  if (!caja || !datos) return;

  const misas = JSON.parse(datos.textContent);
  if (!misas.length) return;

  // Hora actual en Asturias, aunque el visitante esté en otro huso horario.
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const diaJS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const SEMANA = 7 * 1440;
  const ahora = diaJS[valor("weekday")] * 1440 + Number(valor("hour")) * 60 + Number(valor("minute"));
  const MARGEN = 15; // una misa empezada hace menos de 15 minutos sigue contando

  const conFalta = misas.map((m) => {
    const [h, min] = m.h.split(":").map(Number);
    const minuto = m.d * 1440 + h * 60 + min;
    const falta = (((minuto - ahora + MARGEN) % SEMANA) + SEMANA) % SEMANA - MARGEN;
    return { ...m, falta };
  });
  const menor = Math.min(...conFalta.map((m) => m.falta));
  const siguientes = conFalta.filter((m) => m.falta === menor); // las que coinciden a esa hora

  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diasHasta = Math.floor(((ahora % 1440) + menor) / 1440);
  const primera = siguientes[0];
  caja.querySelector(".proxima__dia").textContent =
    diasHasta <= 0 ? "Hoy" : diasHasta === 1 ? "Mañana" : nombres[primera.d];
  caja.querySelector(".proxima__hora").textContent = primera.h;

  const lugares = caja.querySelector(".proxima__lugares");
  siguientes.forEach((m) => {
    const span = document.createElement("span");
    span.className = "lugar";
    span.textContent = m.n;
    if (m.l) {
      const small = document.createElement("small");
      small.textContent = m.l;
      span.appendChild(small);
    }
    lugares.appendChild(span);
  });
  caja.hidden = false;
})();

(function botonTema() {
  const boton = document.getElementById("boton-tema");
  if (!boton) return;
  const raiz = document.documentElement;
  const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
  const esOscuro = () => raiz.dataset.tema ? raiz.dataset.tema === "oscuro" : sistemaOscuro.matches;
  const actualizar = () => {
    const oscuro = esOscuro();
    boton.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    boton.setAttribute("aria-pressed", String(oscuro));
  };
  boton.addEventListener("click", () => {
    const nuevo = esOscuro() ? "claro" : "oscuro";
    raiz.dataset.tema = nuevo;
    try { localStorage.setItem("tema", nuevo); } catch (e) {}
    actualizar();
  });
  sistemaOscuro.addEventListener("change", actualizar);
  actualizar();
})();
