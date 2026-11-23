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

// ---------------------------------------------------------------------------
// Animaciones al hacer scroll. Solo si base.njk ha puesto la clase «anima»
// (es decir, si el visitante no ha pedido «reducir movimiento»).
// ---------------------------------------------------------------------------
(function animaciones() {
  const raiz = document.documentElement;
  window.animacionesListas = true;

  // Barra de progreso de lectura y sombra de las pestañas al bajar.
  const pestanas = document.querySelector(".pestanas");
  const capas = [...document.querySelectorAll(".portada [data-velocidad]")];
  const portada = document.querySelector(".portada");
  let pendiente = false;

  function alDesplazar() {
    pendiente = false;
    const y = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    raiz.style.setProperty("--progreso", total > 0 ? Math.min(1, y / total).toFixed(4) : 0);
    if (pestanas) pestanas.classList.toggle("con-sombra", pestanas.getBoundingClientRect().top <= 0 && y > 10);

    // Montes de la portada: cada capa baja a su velocidad mientras la portada está a la vista.
    if (raiz.classList.contains("anima") && portada && y < portada.offsetHeight + 200) {
      capas.forEach((capa) => {
        capa.style.transform = `translateY(${(y * Number(capa.dataset.velocidad)).toFixed(1)}px)`;
      });
    }
  }
  window.addEventListener("scroll", () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
  }, { passive: true });
  alDesplazar();

  // Bloques que aparecen suavemente al entrar en pantalla.
  if (!raiz.classList.contains("anima") || !("IntersectionObserver" in window)) {
    raiz.classList.remove("anima");
    return;
  }
  const SELECTOR = [
    ".contenido h2", ".seccion__cabeza", ".caja", ".tarjeta", ".acceso", ".tarjeta-parroquia",
    ".whatsapp", ".aviso-horario", ".pendiente", ".foto-ficha", ".datos", ".lista-simple",
    ".texto-legal p", ".nota", ".botones-mapa",
  ].join(",");
  const elementos = [...document.querySelectorAll(SELECTOR)]
    // No animar algo que ya está dentro de otro bloque animado (se mueve con su contenedor).
    .filter((el, _, todos) => !todos.some((otro) => otro !== el && otro.contains(el)));

  // Los elementos que están juntos aparecen uno detrás de otro (efecto cascada).
  const porPadre = new Map();
  elementos.forEach((el) => {
    const n = porPadre.get(el.parentElement) ?? 0;
    porPadre.set(el.parentElement, n + 1);
    el.style.setProperty("--retraso", `${Math.min(n, 6) * 80}ms`);
    el.classList.add("revelar");
    if (el.matches(".contenido h2, .seccion__cabeza")) el.classList.add("revelar--lado");
  });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  elementos.forEach((el) => observador.observe(el));
})();
