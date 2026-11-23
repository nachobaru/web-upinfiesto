import { HtmlBasePlugin } from "@11ty/eleventy";

// Orden de la semana empezando en lunes. El número es el de JavaScript (0 = domingo).
const DIAS = {
  lunes: { nombre: "Lunes", orden: 1, num: 1 },
  martes: { nombre: "Martes", orden: 2, num: 2 },
  miercoles: { nombre: "Miércoles", orden: 3, num: 3 },
  jueves: { nombre: "Jueves", orden: 4, num: 4 },
  viernes: { nombre: "Viernes", orden: 5, num: 5 },
  sabado: { nombre: "Sábado", orden: 6, num: 6 },
  domingo: { nombre: "Domingo", orden: 7, num: 0 },
};

const porDiaYHora = (a, b) =>
  DIAS[a.dia].orden - DIAS[b.dia].orden || a.hora.localeCompare(b.hora);

export default function (eleventyConfig) {
  // Añade el prefijo de GitHub Pages (/web-upinfiesto/) a todos los enlaces.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("diaNombre", (dia) => DIAS[dia]?.nombre ?? dia);
  eleventyConfig.addFilter("diaNum", (dia) => DIAS[dia]?.num);
  eleventyConfig.addFilter("ordenSemana", (misas) => [...misas].sort(porDiaYHora));
  eleventyConfig.addFilter("misasDia", (misas, dia) =>
    misas.filter((m) => m.dia === dia).sort(porDiaYHora)
  );
  eleventyConfig.addFilter("misasDe", (misas, slug) =>
    misas.filter((m) => m.parroquia === slug).sort(porDiaYHora)
  );
  eleventyConfig.addFilter("porSlug", (lista, slug) => lista.find((p) => p.slug === slug));
  eleventyConfig.addFilter("diasConMisa", (misas) =>
    Object.keys(DIAS).filter((d) => misas.some((m) => m.dia === d))
  );
}

export const config = {
  dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  pathPrefix: process.env.PATH_PREFIX || "/",
  htmlTemplateEngine: "njk",
  markdownTemplateEngine: "njk",
};
