// Pequeñas mejoras que solo funcionan con JavaScript. Sin él, la web se ve igual de completa.

(function proximasMisas() {
  const lista = document.getElementById("lista-proximas");
  if (!lista) return;

  // Hora actual en Asturias, aunque el visitante esté en otro huso horario.
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const SEMANA = 7 * 24 * 60;
  const ahora = dias[valor("weekday")] * 1440 + Number(valor("hour")) * 60 + Number(valor("minute"));

  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const MOSTRAR = 4;

  const misas = [...lista.children].map((li) => {
    const [h, m] = li.dataset.hora.split(":").map(Number);
    const minuto = Number(li.dataset.dia) * 1440 + h * 60 + m;
    // Una misa empezada hace menos de 15 minutos sigue contando como «próxima».
    const falta = ((minuto - ahora + 15) % SEMANA + SEMANA) % SEMANA - 15;
    return { li, falta };
  });

  misas.sort((a, b) => a.falta - b.falta);
  misas.forEach(({ li, falta }, i) => {
    lista.appendChild(li);
    if (i >= MOSTRAR) { li.hidden = true; return; }
    const diasHasta = Math.floor(((ahora % 1440) + falta) / 1440);
    const cuando = li.querySelector(".proxima__cuando");
    if (diasHasta <= 0) cuando.textContent = "Hoy";
    else if (diasHasta === 1) cuando.textContent = "Mañana";
    else cuando.textContent = nombres[Number(li.dataset.dia)];
  });
})();

(function filtroParroquias() {
  const select = document.getElementById("filtro-parroquia");
  if (!select) return;
  const bloques = document.querySelectorAll(".bloque-parroquia");
  select.addEventListener("change", () => {
    bloques.forEach((b) => { b.hidden = select.value !== "" && b.dataset.slug !== select.value; });
  });
})();
