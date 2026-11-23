// Utilidades de horario compartidas por la configuración de Eleventy y los ficheros de datos.

// Días de la semana empezando en lunes. «num» es el número de JavaScript (0 = domingo); «ical» el de los calendarios.
export const DIAS = {
  lunes: { nombre: "Lunes", orden: 1, num: 1, ical: "MO" },
  martes: { nombre: "Martes", orden: 2, num: 2, ical: "TU" },
  miercoles: { nombre: "Miércoles", orden: 3, num: 3, ical: "WE" },
  jueves: { nombre: "Jueves", orden: 4, num: 4, ical: "TH" },
  viernes: { nombre: "Viernes", orden: 5, num: 5, ical: "FR" },
  sabado: { nombre: "Sábado", orden: 6, num: 6, ical: "SA" },
  domingo: { nombre: "Domingo", orden: 7, num: 0, ical: "SU" },
};
export const LABORABLES = ["lunes", "martes", "miercoles", "jueves", "viernes"];

export const porDiaYHora = (a, b) =>
  DIAS[a.dia].orden - DIAS[b.dia].orden || a.hora.localeCompare(b.hora);

// «De lunes a viernes», «Sábado», «Lunes y miércoles», «Lunes, miércoles y viernes».
export function textoDias(dias) {
  const orden = dias.map((d) => DIAS[d].orden).sort((a, b) => a - b);
  const nombres = orden.map((o) => Object.values(DIAS).find((d) => d.orden === o).nombre);
  const seguidos = orden.every((o, i) => i === 0 || o === orden[i - 1] + 1);
  if (nombres.length === 1) return nombres[0];
  if (seguidos && nombres.length >= 3)
    return `De ${nombres[0].toLowerCase()} a ${nombres.at(-1).toLowerCase()}`;
  return nombres.slice(0, -1).join(", ") + " y " + nombres.at(-1).toLowerCase();
}

// Texto sencillo apto para nombres de fichero: «Capilla de la Obra Pía» → «capilla-de-la-obra-pia».
const simplificar = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// La misma misa repetida varios días, en una sola línea:
// [{ id, dias, diasTexto, hora, parroquia, lugar }]
export function resumenDias(misas) {
  const grupos = new Map();
  for (const m of [...misas].sort(porDiaYHora)) {
    const clave = [m.hora, m.parroquia, m.lugar ?? ""].join("|");
    if (!grupos.has(clave)) grupos.set(clave, { ...m, dias: [] });
    grupos.get(clave).dias.push(m.dia);
  }
  return [...grupos.values()]
    .sort((a, b) => DIAS[a.dias[0]].orden - DIAS[b.dias[0]].orden || a.hora.localeCompare(b.hora))
    .map((g) => ({
      ...g,
      diasTexto: textoDias(g.dias),
      id: [g.parroquia, g.hora.replace(":", ""), ...g.dias.map((d) => DIAS[d].ical.toLowerCase()), g.lugar ? simplificar(g.lugar) : ""]
        .filter(Boolean).join("-"),
    }));
}
