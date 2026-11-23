// Convierte misas.json en una lista con una entrada por día.
// Así en misas.json se puede escribir "dias": ["lunes", ..., "viernes"] en una sola línea.
import { readFileSync } from "node:fs";

export default function () {
  const misas = JSON.parse(readFileSync(new URL("./misas.json", import.meta.url), "utf8"));
  return misas.semanal.flatMap(({ dia, dias, ...resto }) =>
    (dias ?? [dia]).map((d) => ({ dia: d, ...resto }))
  );
}
