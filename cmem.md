# CMEM — Memoria de Conversación MINI ME

> **Propósito**: memoria comprimida de todo lo platicado con el usuario sobre el catálogo MINI ME, para que cualquier agente (Claude, opencode) retome el trabajo con contexto completo sin volver a preguntar.
> **Última actualización**: 2026-08-18 (precios = sugerido, existencias desde `final`, docs + push)

---

## Resumen ejecutivo (una línea)

El usuario quiere un **catálogo digital premium de ropa de bebé (MINI ME) con experiencia de libro físico (page-flip), mobile-first, estático, en GitHub Pages**, construido SOLO con los datos reales de `Productos.docx`, respetando el diseño de Stitch, bajo el protocolo `addv-web-app`. **Estado: en producción.**

---

## Historial de la conversación

### 1–4. Fase inicial (completada)
- Skills: **addv-web-app** (protocolo) y **ruflo** (bajo demanda). Regla global: **siempre en español**.
- Prompt maestro (45 reglas): catálogo editorial tipo libro físico (NO grid genérico); estático GitHub Pages; respetar identidad Stitch; Mobile First (320→1920px); page-flip con profundidad/sombras; animaciones solo `transform`/`opacity`; portada → introducción → secciones → cierre; JSON como fuente; admin local fuera del build; WebP + thumbs + lazy; AGOTADO con señal clara; WCAG; SEO; scripts `products:validate/generate`, `images:optimize`, `admin`; auditoría final.
- **Productos.docx**: 15 tablas / 675 productos / 675 JPEG (~346×224 px). Anomalías: `SC015` sin imagen/precio; 12 duplicados reales; 11 `SINCOD-*`; talla+colores mezclados; `final (°)` vacío.
- **Stitch** recibido como HTML: rosa vino `#994158` / `#f58aa3` / `#FADDE1`; menta `#71b6b3` / `#a9efec`; superficie `#fff8f3`; tinta `#4A3E3E`; Nunito Sans, Plus Jakarta Sans, Quicksand; Material Symbols Outlined. ⚠️ El "md de Stitch" prometido no llegó; se usa el HTML.

### 5–6. Setup + pipeline (completado)
- Entorno: Node 24.19 / npm 11.17. Stack: Vite 8 + React 19 + TS 6 + Vitest 4 + oxlint + react-pageflip 2.0.3.
- Datos → `admin/source/products-private.json`; imágenes → `admin/source/media/` (675 JPEG).
- Pipeline: `generate-products.mjs` → `public/data/products.json`; `optimize-images.py` → 2022 WebP (nativa + `@2x` 692px + `-thumb` 160px).
- Validación OK (675/15). Commit `b8599be` pusheado con scaffold + docs.

### 7. Segmento A — Catálogo libro (completado)
- `src/utils/paginacion.ts`: `paginarCatalogo`, `indiceSeccion`, `indiceProducto`, `PRODUCTOS_POR_PAGINA = 6`.
- `src/data/catalog.ts`: `rutaImagen` (variantes `nativa|thumb|detalle`), `srcsetImagen`.
- Componentes: `Portada`, `Introduccion`, `PaginaSeccion`, `PaginaProductos`, `TarjetaProducto` (badge AGOTADO), `Contraportada`, `Libro` (react-pageflip, `showCover`, `usePortrait`, teclado, índice overlay, `prefers-reduced-motion`).
- Fix test: el `<h1>` del estado de carga vs. marca → esperar texto de cargando/totales.

### 8. Segmento B — Búsqueda (completado)
- `src/utils/busqueda.ts` (`buscarProductos`, `normalizarTexto` — sin acentos) + tests.
- `Busqueda.tsx`: combobox accesible (listbox, teclado Enter/Arrow/Escape), `fireEvent` en tests (user-event no instalado).
- `Libro` expone `FlipApi` vía prop `apiRef` (`flipNext/flipPrev/turnToPage`); `App` salta a la página del producto con `indiceProducto`.
- Fix test: `indiceProducto` de `A6` (no `A12`).

### 9. Segmento C — SEO (completado)
- `index.html`: `lang="es"`, description, theme-color `#994158`, canonical `https://addv-sites.github.io/minime.catalogo/`, OG, Twitter Card, JSON-LD WebSite.
- `public/robots.txt`, `public/sitemap.xml`.

### 10. Segmento D — CI/CD (completado)
- `.github/workflows/deploy.yml`: lint + test + build + upload/deploy-pages (Actions Pages ya activadas por el usuario).
- Verificado: build estático con base `./`; preview local en 4173 carga 675 productos / 15 secciones.

### 11. Segmento E — Admin local (completado)
- `admin.html` (raíz) + `src/admin/{main,AdminApp,admin.css}`. Edita nombre/talla/precio/sugerido/disponible por producto; filtros; exporta JSON actualizado.
- `vite.config.ts`: `rollupOptions.input = { main: index.html }` → **admin excluido del build** (verificado en `dist/`).
- `generate-products.mjs` ahora lee `p.disponible !== false`.
- `package.json` script `"admin"` (dev, sin coma final en la línea).

### 12. Publicación (completado)
- Commit `6b7afcc` (29 archivos) → push `main` → workflow Deploy a GitHub Pages **exitoso**.
- **Producción**: https://addv-sites.github.io/minime.catalogo/ (index/data/robots 200).

### 13. Segmento F — Auditoría final (completado)
- Responsive: grid productos 2 col (móvil) / 3 col (≥640px).
- A11y: guard teclado ignora inputs (no flip al escribir); contraste corregido → menta texto `#3d7d79` (4.76:1); outlines de foco a `--color-tertiary-text` (≥3:1). Primario `#994158` (6.46:1), tinta (9.74:1).
- Verificación: 34 tests OK · lint OK · build OK · admin fuera del build.

### 14. Segmento G — Precios reales + existencias (completado)
- **El precio del catálogo ahora es el `precio sugerido`** (campo privado `sugerido` = el real); se eliminó el "Sugerido:" de la UI. Fallback a `precio` si `sugerido` está vacío (ej. D026).
- **Existencias** derivadas del campo privado `final`: se cuentan los `°` (`°°°°` = 4). Caso `"60 bolsitas"` → se extrae el número (60).
- `disponible` = `!false && existencias > 0` → **14 productos quedan AGOTADO** (los SINCOD sin `final`). Total existencias: **1542**.
- `generate-products.mjs`: exporta `precio | existencias | disponible | ...` (ya NO `sugerido`).
- UI: popup de detalle muestra "X piezas en existencia" (`detalle__existencias`, menta); tarjeta badge AGOTADO según `disponible`.
- Tests actualizados (43 OK) · lint OK · build OK. JSON público verificado sin `sugerido`.

## Decisiones tomadas (acordadas)

| # | Decisión |
|---|---|
| 1 | IDs duplicados → sufijo interno (`Z050-2`) |
| 2 | Baja resolución → estilización editorial, NO upscaling mágico |
| 3 | Mobile First obligatorio |
| 4 | 100% estático / GitHub Pages / sin backend |
| 5 | Admin local fuera del build público |
| 6 | JSON público mínimo |
| 7 | Disponibilidad default **disponible**; AGOTADO se marca por producto en el admin |
| 8 | Hablar siempre en español |
| 9 | Protocolo addv-web-app: Analizar → Proponer → Confirmar → Implementar |
| 10 | Stack: Vite + React + TS + react-pageflip |
| 11 | Vite `base: './'` |
| 12 | **Precio del catálogo = `precio sugerido`** (el real) |
| 13 | **Existencias** = nº de `°` en `final` (texto numérico → número) |
| 14 | **AGOTADO si `existencias = 0`** (además de `disponible=false`) |

## Pendientes / bloqueos

- [ ] **Tratamiento fotográfico definitivo** (estilización editorial): bloqueado — agente sin visión; evaluar con `sips`/Python o revisión manual del usuario.
- [ ] **Confirmar identidad visual**: ¿el HTML de Stitch es definitivo o llega el `.md`?
- [ ] **Derivar género (Niña/Niño)** para secciones ambiguas.
- [ ] **Parsear tallas/colores** o conservarlos como texto.
- [ ] Tests de componente para `Libro`/`PaginaProductos` con render real (hoy: utils + tarjetas + búsqueda + App).

## Comandos y rutas clave

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo Vite |
| `npm run build` | Typecheck (`tsc -b`) + build estático |
| `npm run preview` | Preview del build |
| `npm run lint` | oxlint |
| `npm test` / `npm run test:watch` | Vitest (43 tests) |
| `npm run products:validate` | Validar `products-private.json` |
| `npm run products:generate` | Generar `public/data/products.json` |
| `npm run images:optimize` | Optimizar imágenes (requiere Pillow) |
| `npm run admin` | Admin local → `http://localhost:5173/admin.html` |

- Repo: `/Users/prolan/repos/minime_cat/`
- Datos internos: `admin/source/products-private.json` (675)
- Imágenes originales: `admin/source/media/` (675 JPEG)
- WebP generados: `public/assets/images/products/` (2022)
- JSON público: `public/data/products.json`
- Fuente original: `Productos.docx`
- Remote git: `https://github.com/addv-sites/minime.catalogo.git` (branch `main`)
- **Producción**: https://addv-sites.github.io/minime.catalogo/

## Próximo paso recomendado

1. Verificar visualmente el popup de detalle (formato "X piezas en existencia") y el badge AGOTADO en los 14 SINCOD.
2. Abrir con el usuario los pendientes: tratamiento fotográfico, identidad Stitch definitiva, género y tallas.
