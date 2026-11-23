// Recordatorios de misa: enlace para Google Calendar y fichero .ics (iPhone, Outlook y otros).
// Cada misa se añade como un evento que se repite cada semana, con un aviso 30 minutos antes.

import { DIAS } from "./horario.js";

const ZONA = "Europe/Madrid";
const DURACION_MIN = 45;
const AVISO_MIN = 30;
const NOTA =
  "Horario provisional. Los cambios de última hora se publican en el grupo de WhatsApp de la Unidad Pastoral de Infiesto.";

const dosCifras = (n) => String(n).padStart(2, "0");

// Fecha de hoy en Asturias, aunque la web se genere en un servidor de otro país.
function hoyEnAsturias() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(new Date());
  const v = (t) => partes.find((p) => p.type === t).value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { fecha: Date.UTC(+v("year"), +v("month") - 1, +v("day")), num: dias[v("weekday")] };
}

// Primera vez que se celebra la misa a partir de hoy, y su hora de fin: { inicio, fin } en formato 20261129T130000.
function primeraFecha(misa) {
  const hoy = hoyEnAsturias();
  const salto = Math.min(...misa.dias.map((d) => (DIAS[d].num - hoy.num + 7) % 7));
  const [h, m] = misa.hora.split(":").map(Number);
  const inicio = new Date(hoy.fecha + salto * 86400000 + (h * 60 + m) * 60000);
  const fin = new Date(inicio.getTime() + DURACION_MIN * 60000);
  const formato = (d) =>
    `${d.getUTCFullYear()}${dosCifras(d.getUTCMonth() + 1)}${dosCifras(d.getUTCDate())}T${dosCifras(d.getUTCHours())}${dosCifras(d.getUTCMinutes())}00`;
  return { inicio: formato(inicio), fin: formato(fin) };
}

const regla = (misa) => `RRULE:FREQ=WEEKLY;BYDAY=${misa.dias.map((d) => DIAS[d].ical).join(",")}`;
const titulo = (misa, parroquia) => `Misa en ${parroquia.nombre}` + (misa.lugar ? ` (${misa.lugar})` : "");
const lugar = (misa, parroquia) =>
  [misa.lugar || parroquia.templo, parroquia.nombre, "Piloña, Asturias"].filter(Boolean).join(", ");

export function enlaceGoogle(misa, parroquia) {
  const { inicio, fin } = primeraFecha(misa);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo(misa, parroquia),
    dates: `${inicio}/${fin}`,
    ctz: ZONA,
    recur: regla(misa),
    location: lugar(misa, parroquia),
    details: NOTA,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// --- Fichero .ics (formato iCalendar, RFC 5545) ---

const escapar = (texto) =>
  texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// Las líneas de un .ics no deben pasar de 75 bytes: las largas se parten y se continúan con un espacio.
function plegar(linea) {
  const trozos = [];
  let actual = "";
  for (const caracter of linea) {
    const limite = trozos.length === 0 ? 75 : 74;
    if (Buffer.byteLength(actual + caracter) > limite) {
      trozos.push(actual);
      actual = "";
    }
    actual += caracter;
  }
  trozos.push(actual);
  return trozos.join("\r\n ");
}

export function ics(misa, parroquia) {
  const { inicio } = primeraFecha(misa);
  const ahora = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unidad Pastoral de Infiesto//Horarios de misa//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Definición de la hora de España peninsular (cambio de hora el último domingo de marzo y de octubre).
    "BEGIN:VTIMEZONE",
    `TZID:${ZONA}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${misa.id}@upinfiesto`,
    `DTSTAMP:${ahora}`,
    `DTSTART;TZID=${ZONA}:${inicio}`,
    `DURATION:PT${DURACION_MIN}M`,
    regla(misa),
    `SUMMARY:${escapar(titulo(misa, parroquia))}`,
    `LOCATION:${escapar(lugar(misa, parroquia))}`,
    `DESCRIPTION:${escapar(NOTA)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar(titulo(misa, parroquia))}`,
    `TRIGGER:-PT${AVISO_MIN}M`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegar).join("\r\n") + "\r\n";
}
