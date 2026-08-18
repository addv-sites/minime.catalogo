# CMEM — Memoria de Conversación MINI ME

> **Propósito**: memoria comprimida de todo lo platicado con el usuario sobre el catálogo MINI ME, para que cualquier agente (Claude, opencode) retome el trabajo con contexto completo sin volver a preguntar.
> **Última actualización**: 2026-08-17 (scaffold Vite+React + pipeline datos/imágenes operativos)

---

## Resumen ejecutivo (una línea)

El usuario quiere un **catálogo digital premium de ropa de bebé (MINI ME) con experiencia de libro físico (page-flip), mobile-first, estático, en GitHub Pages**, construido SOLO con los datos reales de `Productos.docx`, respetando el diseño de Stitch, bajo el protocolo `addv-web-app`.

---

## Historial de la conversación

### 1. Instalación de herramientas
- Se instaló la skill **addv-web-app** (protocolo corporativo).
- Se instaló la skill **ruflo** (solo la skill; el resto bajo demanda).
- Regla global: **responder siempre en español** (persistida en `~/.config/opencode/AGENTS.md`).

### 2. Prompt maestro (el encargo principal)
45 reglas. Puntos clave: catálogo editorial premium tipo libro físico (NO grid genérico); estático en GitHub Pages (sin backend/BD/API/CMS/PHP/Node en producción); analizar `Productos.docx` y Stitch antes de programar; respetar estrictamente la identidad Stitch; Mobile First (320→1920px); page-flip con profundidad/sombras; animaciones solo `transform`/`opacity`; portada → introducción → secciones → cierre; JSON como fuente de datos; admin local fuera del build; seguridad realista; imágenes WebP/AVIF + thumbnails + lazy; agotados con señal clara (no se eliminan); WCAG; SEO; validaciones; microinteracciones sutiles; scripts `products:validate/generate`, `images:optimize`, `admin`, `build`, `preview`; auditoría final; **"y espera por el md de stitch"**.

### 3. Análisis de Productos.docx (completado)
- Word ~20 MB, **15 tablas / 675 productos / 675 imágenes JPEG (~346×224 px, baja resolución)**.
- Columnas: `imagen | código+nombre | talla+colores | precio | sugerido | ° (disponibilidad por variante)`.
- 15 secciones reales (ver tabla en `claude.md`).
- **Anomalías**: `SC015` sin imagen/precio; 12 códigos duplicados reales (`RA0031`, `Z050` x3, `APC017/019/020/021/022/024/025/026/027/028`); 11 sin código (`SINCOD-*`); talla+colores mezclados; `final (°)` todo vacío; `APC020` marcador inesperado.
- Datos extraídos a `admin/source/products-private.json` (675 productos, 158 KB).

### 4. Diseño de Stitch (recibido como HTML)
- Paleta: rosa vino `#994158`, `#f58aa3`, `#FADDE1`; menta `#71b6b3`, `#a9efec`; superficie `#fff8f3`; tinta `#4A3E3E`.
- Tipografías: Nunito Sans, Plus Jakarta Sans, Quicksand; iconos Material Symbols Outlined.
- Estética editorial premium Mobile First.
- **Pendiente**: el prompt maestro prometía un "md de Stitch"; llegó HTML. ¿Es suficiente o llega el `.md`?

### 5. Retoma tras crash del Mac
- Se documentó y migró datos al repo; primer commit+push del repo (`790f714`).

### 6. Segmento siguiente: scaffold + pipeline (completado)
- **Entorno**: se instaló Node 24.19 / npm 11.17 (antes no había).
- **Stack elegido**: Vite 8 + React 19 + TypeScript 6 + Vitest 4 + oxlint + **react-pageflip** (instalado, aún sin integrar).
- **Imágenes migradas al repo**: `admin/source/media/` (675 JPEG originales).
- **Pipeline de datos**: `scripts/generate-products.mjs` → `public/data/products.json` (675 productos, 15 secciones, duplicados con sufijo `-2/-3`, base `./`).
- **Pipeline de imágenes**: `scripts/optimize-images.py` ejecutado → 2022 WebP en `public/assets/images/products/` (674×3: nativa + `@2x` 692px + `-thumb` 160px).
- **Scaffold UI**: `src/App.tsx` (header + grid de secciones), `catalog.ts` (loader + tipos), `tokens.css` (paleta Stitch), `global.css`, `format.ts`.
- **Validación**: 675 productos / 15 secciones / VALIDACIÓN OK. Duplicados 12, SINCOD 11, SC015 sin imagen/precio, APC020 warn.
- **Calidad**: 8 tests OK · lint OK · build OK.
- ⚠️ **Cambios staged pero SIN commitear** hasta esta actualización de docs.

## Decisiones tomadas (acordadas)

| # | Decisión |
|---|---|
| 1 | IDs duplicados → sufijo interno (`Z050-2`) sin alterar ID original |
| 2 | Imágenes baja resolución → estilización editorial, NO upscaling (solo @2x suave para detalle) |
| 3 | Mobile First obligatorio |
| 4 | 100% estático / GitHub Pages / sin backend |
| 5 | Admin local fuera del build público |
| 6 | JSON público mínimo (solo catálogo) |
| 7 | `final (°)` vacío → disponibilidad aún sin definir |
| 8 | Hablar siempre en español |
| 9 | Protocolo addv-web-app: Analizar → Proponer → Confirmar → Implementar |
| 10 | Stack: Vite + React + TS + react-pageflip |
| 11 | Vite `base: './'` (rutas relativas para GitHub Pages) |

## Pendientes / bloqueos

- [ ] **Catálogo libro/page-flip** (core): portada → secciones → cierre, navegación swipe/tap/teclado, profundidad/sombras con `react-pageflip`. La UI actual es solo un listado de secciones.
- [ ] Búsqueda, filtros, estados AGOTADO (falta definir disponibilidad con `final` vacío).
- [ ] Admin local CRUD + regeneración de JSON.
- [ ] srcset responsivo (`-thumb`/`@2x`) + lazy loading en la UI.
- [ ] GitHub Actions `deploy.yml` para GitHub Pages.
- [ ] SEO (meta, OG, canonical, sitemap, robots, structured data).
- [ ] Auditoría final (funcionalidad, responsive, performance, seguridad, accesibilidad).
- [ ] **Tratamiento fotográfico definitivo**: bloqueado — agente sin visión; evaluar con `sips`/Python o revisión manual del usuario.
- [ ] **Confirmar identidad visual**: ¿el HTML de Stitch es definitivo o llega el `.md`?
- [ ] **Derivar género (Niña/Niño)** para secciones ambiguas.
- [ ] **Parsear tallas/colores** o conservarlos como texto.

## Comandos y rutas clave

| Comando | Descripción |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Desarrollo Vite |
| `npm run build` | Typecheck (`tsc -b`) + build estático |
| `npm run preview` | Preview del build |
| `npm run lint` | oxlint |
| `npm test` / `npm run test:watch` | Vitest (8 tests) |
| `npm run products:validate` | Validar `products-private.json` |
| `npm run products:generate` | Generar `public/data/products.json` |
| `npm run images:optimize` | Optimizar imágenes (requiere Pillow) |
| `npm run admin` | Dev en modo admin (a implementar) |

- Repo: `/Users/prolan/repos/minime_cat/`
- Datos internos: `admin/source/products-private.json` (675)
- Imágenes originales: `admin/source/media/` (675 JPEG)
- WebP generados: `public/assets/images/products/` (2022)
- JSON público: `public/data/products.json`
- Fuente original: `Productos.docx` (raíz del repo)
- Remote git: `https://github.com/addv-sites/minime.catalogo.git` (branch `main`)

## Próximo paso recomendado

1. **Commit y push** de los cambios staged + docs actualizadas.
2. **Proponer la arquitectura del catálogo libro** (segmento 1 del protocolo): estructura de páginas, integración `react-pageflip`, navegación y estados (AGOTADO), para aprobación del usuario.
3. Resolver el tratamiento fotográfico (CLI `sips`/Python o revisión manual del usuario).
