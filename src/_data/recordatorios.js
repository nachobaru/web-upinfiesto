// Una entrada por cada misa de cada parroquia, para generar su fichero .ics de recordatorio.
import parroquias from "./parroquias.js";
import misasLista from "./misasLista.js";
import { resumenDias } from "../../lib/horario.js";

export default function () {
  const lista = parroquias();
  return resumenDias(misasLista())
    .map((misa) => ({ misa, parroquia: lista.find((p) => p.slug === misa.parroquia) }))
    .filter((r) => r.parroquia);
}
