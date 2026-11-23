// Lee las fichas de contenido/parroquias/*.json (una por parroquia) y las ordena por nombre.
// Cada fichero se puede editar desde el panel (Pages CMS) o a mano.
import { readdirSync, readFileSync } from "node:fs";

const carpeta = new URL("../../contenido/parroquias/", import.meta.url);

export default function () {
  return readdirSync(carpeta)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(new URL(f, carpeta), "utf8")))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
