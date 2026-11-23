// Convierte misas.json en una lista con una entrada por día:
// { "dias": ["lunes", "martes"], ... } pasa a ser dos misas, una el lunes y otra el martes.
import { readFileSync } from "node:fs";

export default function () {
  const misas = JSON.parse(readFileSync(new URL("./misas.json", import.meta.url), "utf8"));
  return misas.semanal.flatMap(({ dia, dias, ...resto }) =>
    (dias?.length ? dias : [dia]).filter(Boolean).map((d) => ({ dia: d, ...resto }))
  );
}
