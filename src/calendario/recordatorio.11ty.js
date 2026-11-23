// Genera /calendario/<misa>.ics para cada misa (ver lib/calendario.js).
import { ics } from "../../lib/calendario.js";

export const data = {
  pagination: { data: "recordatorios", size: 1, alias: "r" },
  permalink: (datos) => `/calendario/${datos.r.misa.id}.ics`,
  eleventyExcludeFromCollections: true,
};

export function render({ r }) {
  return ics(r.misa, r.parroquia);
}
