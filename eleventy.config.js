import { HtmlBasePlugin } from "@11ty/eleventy";

// Días de la semana empezando en lunes. «num» es el número de JavaScript (0 = domingo).
const DIAS = {
  lunes: { nombre: "Lunes", orden: 1, num: 1 },
  martes: { nombre: "Martes", orden: 2, num: 2 },
  miercoles: { nombre: "Miércoles", orden: 3, num: 3 },
  jueves: { nombre: "Jueves", orden: 4, num: 4 },
  viernes: { nombre: "Viernes", orden: 5, num: 5 },
  sabado: { nombre: "Sábado", orden: 6, num: 6 },
  domingo: { nombre: "Domingo", orden: 7, num: 0 },
};
const LABORABLES = ["lunes", "martes", "miercoles", "jueves", "viernes"];

const porDiaYHora = (a, b) =>
  DIAS[a.dia].orden - DIAS[b.dia].orden || a.hora.localeCompare(b.hora);

// «De lunes a viernes», «Sábado», «Lunes y miércoles», «Lunes, miércoles y viernes».
function textoDias(dias) {
  const orden = dias.map((d) => DIAS[d].orden).sort((a, b) => a - b);
  const nombres = orden.map((o) => Object.values(DIAS).find((d) => d.orden === o).nombre);
  const seguidos = orden.every((o, i) => i === 0 || o === orden[i - 1] + 1);
  if (nombres.length === 1) return nombres[0];
  if (seguidos && nombres.length >= 3)
    return `De ${nombres[0].toLowerCase()} a ${nombres.at(-1).toLowerCase()}`;
  return nombres.slice(0, -1).join(", ") + " y " + nombres.at(-1).toLowerCase();
}

export default function (eleventyConfig) {
  // Añade el prefijo de GitHub Pages (/web-upinfiesto/) a todos los enlaces.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addWatchTarget("contenido/");

  eleventyConfig.addFilter("diaNombre", (dia) => DIAS[dia]?.nombre ?? dia);
  eleventyConfig.addFilter("diaNum", (dia) => DIAS[dia]?.num);
  eleventyConfig.addFilter("misasDia", (misas, dia) =>
    misas.filter((m) => m.dia === dia).sort(porDiaYHora)
  );
  eleventyConfig.addFilter("misasDe", (misas, slug) =>
    misas.filter((m) => m.parroquia === slug).sort(porDiaYHora)
  );
  eleventyConfig.addFilter("laborables", (misas) => misas.filter((m) => LABORABLES.includes(m.dia)));
  eleventyConfig.addFilter("porSlug", (lista, slug) => lista.find((p) => p.slug === slug));

  // Misas a la misma hora, juntas: [{ hora, misas: [...] }]
  eleventyConfig.addFilter("agruparHora", (misas) => {
    const grupos = new Map();
    for (const m of [...misas].sort(porDiaYHora)) {
      if (!grupos.has(m.hora)) grupos.set(m.hora, []);
      grupos.get(m.hora).push(m);
    }
    return [...grupos].map(([hora, misas]) => ({ hora, misas }));
  });

  // La misma misa repetida varios días, en una sola línea: [{ diasTexto, hora, parroquia, lugar }]
  eleventyConfig.addFilter("resumenDias", (misas) => {
    const grupos = new Map();
    for (const m of [...misas].sort(porDiaYHora)) {
      const clave = [m.hora, m.parroquia, m.lugar ?? ""].join("|");
      if (!grupos.has(clave)) grupos.set(clave, { ...m, dias: [] });
      grupos.get(clave).dias.push(m.dia);
    }
    return [...grupos.values()]
      .sort((a, b) => DIAS[a.dias[0]].orden - DIAS[b.dias[0]].orden || a.hora.localeCompare(b.hora))
      .map((g) => ({ ...g, diasTexto: textoDias(g.dias) }));
  });

  // Enlace de búsqueda en Google Maps (no necesita coordenadas).
  eleventyConfig.addFilter("mapaUrl", (consulta) =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta)
  );

  // Datos mínimos para el JavaScript de «Próxima misa».
  eleventyConfig.addFilter("datosProxima", (misas, parroquias) =>
    JSON.stringify(
      misas.map((m) => ({
        d: DIAS[m.dia].num,
        h: m.hora,
        n: parroquias.find((p) => p.slug === m.parroquia)?.nombre ?? m.parroquia,
        l: m.lugar ?? "",
      }))
    )
  );
}

export const config = {
  dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  pathPrefix: process.env.PATH_PREFIX || "/",
  htmlTemplateEngine: "njk",
  markdownTemplateEngine: "njk",
};
