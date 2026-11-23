# Web de la Unidad Pastoral de Infiesto

Web estática de la Unidad Pastoral de Infiesto (concejo de Piloña, Asturias), hecha con [Eleventy](https://www.11ty.dev/) y publicada en GitHub Pages.

> **Estado:** propuesta en construcción. Mientras `borrador` sea `true` en `src/_data/site.json`, la web muestra una franja de «Propuesta de web — no oficial» y pide a los buscadores que no la indexen.

## Cómo cambiar el contenido

Casi todo el contenido está en ficheros de datos dentro de `src/_data/`. No hace falta tocar el diseño.

| Qué quiero cambiar | Fichero |
|---|---|
| Horarios de misa | `src/_data/misas.json` |
| Parroquias (nombre, templo, fiestas, historia, foto…) | `src/_data/parroquias.json` |
| Avisos de la portada | `src/_data/avisos.json` |
| Actividades (catequesis, Cáritas…) | `src/_data/actividades.json` |
| Despacho, sacerdotes, enlace de WhatsApp | `src/_data/site.json` |

### Añadir una misa

En `misas.json`, dentro de `semanal`, añade una línea:

```json
{ "dia": "domingo", "hora": "12:30", "parroquia": "infiesto" }
```

- `dia`: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado` o `domingo` (sin tildes).
- `hora`: siempre con dos cifras, `09:30`, `17:00`.
- `parroquia`: el `slug` de la parroquia tal y como aparece en `parroquias.json`.

### Añadir una parroquia

Copia un bloque de `parroquias.json` y cambia `slug` (en minúsculas, sin tildes ni espacios) y `nombre`. Su página se crea sola en `/parroquias/<slug>/`.

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
