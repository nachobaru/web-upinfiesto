# Web de la Unidad Pastoral de Infiesto

Web estática de la Unidad Pastoral de Infiesto (concejo de Piloña, Asturias), hecha con [Eleventy](https://www.11ty.dev/) y publicada en GitHub Pages.

> **Estado:** propuesta en construcción. Mientras el «Modo propuesta» esté activado (`borrador` en `src/_data/site.json`), la web muestra una franja de «Propuesta de web — no oficial» y pide a los buscadores que no la indexen.

## Panel de edición

La forma normal de cambiar el contenido es el **panel de edición** de [Pages CMS](https://pagescms.org). Funciona en el navegador, también desde el móvil, y no hace falta saber programar. Cada vez que alguien guarda un cambio, la web se republica sola en uno o dos minutos.

Desde el panel se puede editar:

- **Horarios de misa:** misas de cada semana y horarios especiales.
- **Parroquias:** una ficha por parroquia con su iglesia, fiestas, texto sobre el pueblo, historia, mapa y foto. Al crear una nueva, su página aparece sola.
- **Actividades:** catequesis, Cáritas, grupos y fiestas.
- **Avisos de la portada:** solo para algo que deba destacar; los avisos normales van al grupo de WhatsApp.
- **Contacto y datos generales:** despacho, sacerdotes, enlace de WhatsApp, modo propuesta y datos legales.

La configuración del panel está en `.pages.yml`.

### Primera puesta en marcha (una sola vez)

1. Entra en https://app.pagescms.org y pulsa **Sign in with GitHub**.
2. Cuando lo pida, instala la aplicación de Pages CMS en GitHub y dale acceso **solo** al repositorio `web-upinfiesto`.
3. Abre el repositorio `web-upinfiesto` (rama `main`) dentro del panel.

### Dar acceso a otras personas

En el panel, en el apartado **Collaborators**, se puede invitar a otras personas (el párroco, un catequista…) por correo electrónico. No necesitan cuenta de GitHub: reciben un enlace para entrar.

## Cómo está organizado el contenido

Si prefieres editar los ficheros a mano, todo está en ficheros de datos. No hace falta tocar el diseño.

| Qué quiero cambiar | Fichero |
|---|---|
| Horarios de misa | `src/_data/misas.json` |
| Parroquias (una ficha por parroquia) | `contenido/parroquias/<identificador>.json` |
| Avisos extra en la portada | `src/_data/avisos.json` |
| Actividades | `src/_data/actividades.json` |
| Despacho, sacerdotes, WhatsApp, modo propuesta y titular (aviso legal) | `src/_data/site.json` |
| Fotos | `src/assets/img/fotos/` |

### Misas

Cada misa de `misas.json`, dentro de `semanal`:

```json
{ "dias": ["lunes", "martes", "miercoles", "jueves", "viernes"], "hora": "19:30", "parroquia": "infiesto", "lugar": "Capilla de la Obra Pía" }
```

- `dias`: uno o varios de `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` (sin tildes).
- `hora`: siempre con dos cifras, `09:30`, `17:00`.
- `parroquia`: el identificador (`slug`) de la parroquia.
- `lugar` (opcional): si la misa no es en la iglesia parroquial.

La web junta sola las misas que coinciden a la misma hora y escribe «De lunes a viernes».

### Parroquias

Cada parroquia es un fichero en `contenido/parroquias/`, cuyo nombre es su identificador (`slug`): minúsculas, sin tildes ni espacios. Su página se crea sola en `/parroquias/<slug>/`.

Campos: `nombre`, `slug`, `templo`, `advocacion`, `fiestas`, `pueblo`, `historia`, `direccion`, `mapa`, `foto` y `fotoCredito`.

El botón «Ver la iglesia en Google Maps» busca «Iglesia <nombre>, Piloña, Asturias». Si no acierta con la iglesia, pega en `mapa` el enlace exacto: en Google Maps, abre la iglesia y pulsa **Compartir → Copiar enlace**.

Las fotos deben ser propias o tener permiso del autor; si no son tuyas, rellena `fotoCredito` con el autor y la licencia.

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
