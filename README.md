# Web de la Unidad Pastoral de Infiesto

Web estática de la Unidad Pastoral de Infiesto (concejo de Piloña, Asturias), hecha con [Eleventy](https://www.11ty.dev/) y publicada en GitHub Pages.

> **Estado:** propuesta en construcción. Mientras `borrador` sea `true` en `src/_data/site.json`, la web muestra una franja de «Propuesta de web — no oficial» y pide a los buscadores que no la indexen.

## Cómo cambiar el contenido

Casi todo el contenido está en ficheros de datos dentro de `src/_data/`. No hace falta tocar el diseño.

| Qué quiero cambiar | Fichero |
|---|---|
| Horarios de misa | `src/_data/misas.json` |
| Parroquias (nombre, templo, fiestas, historia, foto…) | `src/_data/parroquias.json` |
| Avisos extra en la portada (los avisos normales van al grupo de WhatsApp) | `src/_data/avisos.json` |
| Actividades (catequesis, Cáritas…) | `src/_data/actividades.json` |
| Despacho, sacerdotes, enlace de WhatsApp y datos del titular (aviso legal) | `src/_data/site.json` |

### Añadir una misa

En `misas.json`, dentro de `semanal`, añade una línea:

```json
{ "dia": "domingo", "hora": "12:30", "parroquia": "infiesto" }
```

- `dia`: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado` o `domingo` (sin tildes).
- `hora`: siempre con dos cifras, `09:30`, `17:00`.
- `parroquia`: el `slug` de la parroquia tal y como aparece en `parroquias.json`.
- `lugar` (opcional): si la misa no es en la iglesia parroquial, por ejemplo `"Capilla de la Obra Pía"`.

Si una misa se repite varios días a la misma hora, se puede escribir una sola vez con `dias`:

```json
{ "dias": ["lunes", "martes", "miercoles", "jueves", "viernes"], "hora": "19:30", "parroquia": "infiesto", "lugar": "Capilla de la Obra Pía" }
```

La web junta sola las misas que coinciden a la misma hora y escribe «De lunes a viernes».

### Añadir una parroquia

Copia un bloque de `parroquias.json` y cambia `slug` (en minúsculas, sin tildes ni espacios) y `nombre`. Su página se crea sola en `/parroquias/<slug>/`.

Campos de cada parroquia: `templo`, `advocacion`, `fiestas`, `pueblo` (unas líneas sobre el pueblo), `historia`, `direccion`, `mapa`, `foto` y `fotoCredito`.

El botón «Ver la iglesia en Google Maps» busca «Iglesia <nombre>, Piloña, Asturias». Si no acierta con la iglesia, pega en `mapa` el enlace exacto: en Google Maps, abre la iglesia, pulsa **Compartir → Copiar enlace**.

Si añades una foto, guárdala en `src/assets/img/` y pon en `foto` la ruta `/assets/img/nombre.jpg`. Si la foto no es propia, rellena `fotoCredito` con el autor y la licencia.

Todo lo que se deje vacío aparece en la web como **Pendiente**.

## Trabajar en local

Necesitas [Node.js](https://nodejs.org/) 20 o superior.

```bash
npm install
npm start
```

La web se abre en http://localhost:8080 y se recarga sola al guardar.

## Publicación

Cada cambio en la rama `main` se publica solo mediante GitHub Actions (`.github/workflows/desplegar.yml`).

La primera vez hay que activarlo en GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
