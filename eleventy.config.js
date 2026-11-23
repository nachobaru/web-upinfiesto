import { HtmlBasePlugin } from "@11ty/eleventy";
import { DIAS, LABORABLES, porDiaYHora, resumenDias } from "./lib/horario.js";
import { enlaceGoogle } from "./lib/calendario.js";


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

  // La misma misa repetida varios días, en una sola línea (ver lib/horario.js).
  eleventyConfig.addFilter("resumenDias", resumenDias);

  // Enlace para añadir una misa a Google Calendar (ver lib/calendario.js).
  eleventyConfig.addFilter("enlaceGoogle", enlaceGoogle);

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
