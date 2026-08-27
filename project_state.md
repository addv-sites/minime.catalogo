# Project State — MINI ME Catálogo Digital

> Última actualización: 2026-08-26 (toggle Solo disponibles junto a MINI ME + portada responsive centrada sin cortes ni invasión)
> Estado general: **En producción — catálogo libro page-flip + búsqueda + filtro toggle + portada responsive + SEO + admin local + CI/CD operativos**

---

## 1. Qué existe hoy en el repo

| Elemento | Estado |
|---|---|
| `Productos.docx` | ✅ Fuente de datos original (20 MB, 675 productos) |
| `.gitignore` | ✅ macOS, IDE, node_modules, build, coverage |
| `README.md` | ✅ Documentación del proyecto |
| `project_state.md` | ✅ Este archivo |
| `claude.md` | ✅ Contexto operativo del repo |
| `cmem.md` | ✅ Memoria de conversación optimizada |
| `inicia.sh` | ✅ Script de arranque del entorno local (`./inicia.sh` → instala deps + `npm run dev`) |
| `admin/source/products-private.json` | ✅ Datos privados (689 productos, 15 secciones) |
| `admin/source/media/` | ✅ 675 JPEG originales |
| `scripts/optimize-images.py` | ✅ Pipeline WebP (nativo / @2x / thumb) |
| `scripts/validate-products.mjs` | ✅ Validación de integridad de datos |
| `scripts/generate-products.mjs` | ✅ Generador de `public/data/products.json` (regla existencias: `°` sin número) |
| `scripts/update-costos.py` | ✅ Actualiza costos (`precio/sugerido/final`) desde `Productos.docx` |
| `public/data/products.json` | ✅ JSON público (689 productos, 15 secciones) |
| `public/assets/images/products/` | ✅ 2022 WebP (674 productos × 3 variantes) |
| `public/robots.txt` | ✅ Robots |
| `public/sitemap.xml` | ✅ Sitemap |
| `public/og-image-v2.jpg` | ✅ Imagen al compartir (1200×630, desde `ic.png`; v2 = cache-busting) |
| `src/utils/zoom.ts` + `src/hooks/usePinchZoom.ts` | ✅ Zoom pinch 1–3× (popup y libro) |
| `.github/workflows/deploy.yml` | ✅ CI/CD: lint + test + build + deploy GitHub Pages |
| `src/` | ✅ App catálogo libro completa (componentes, utils, admin, tests) |
| `admin.html` | ✅ Admin local (solo dev, excluido del build) |
| `package.json` | ✅ Stack: Vite 8 + React 19 + TypeScript 6 + Vitest + oxlint |

## 2. Stack y entorno (definidos y operativos)

| Herramienta | Estado |
|---|---|
| Node.js | ✅ v24.19.0 |
| npm | ✅ 11.17.0 |
| Vite | ✅ 8.2.x (config `base: './'` para GitHub Pages) |
| React | ✅ 19.2.x + react-dom |
| TypeScript | ✅ ~6.0 |
| react-pageflip | ✅ 2.0.3 (integrado: libro page-flip) |
| Vitest + Testing Library | ✅ 4.1.x (entorno jsdom) |
| oxlint | ✅ 1.75.x |
| Python 3.11 + Pillow | ✅ (script de imágenes) |

## 3. Pipeline de datos e imágenes (operativo)

### 3.1 Datos

```text
admin/source/products-private.json  ──>  scripts/generate-products.mjs  ──>  public/data/products.json
     (689 productos, datos internos)         (JSON público mínimo, duplicados con sufijo -2/-3)
```

- **Actualización de costos (2026-08-20)**: `scripts/update-costos.py` lee `Productos.docx` y actualiza por código `precio`, `sugerido` y `final` (conserva `nombre`/`talla`/`imagen`/`disponible`); agrega productos nuevos con placeholder; sección por prefijo de código (fallback).
- Reglas del generador: expone solo `codigo`, `nombre`, `talla`, `precio`, `existencias`, `disponible`, `imagen`; preserva IDs originales (duplicados → sufijo `-2/-3`); agrupa por sección en orden estable; imagen como `<nombre>.webp`.
- Campo `precio` = valor real del campo privado `sugerido` (precio del catálogo); si `sugerido` está vacío se usa `precio` como fallback.
- **Regla de existencias (nueva)**: se cuentan **SOLO los `°` que no van seguidos de un número** del campo privado `final` (columna "Precio final"). Los `°` pegados a un número (`°50`, `°65`, `°°47.5`) son PRECIOS y se ignoran. Ej.: `1pz°` = 1 · `2pz°°` = 2 · `1pz°95` = 0 · `2pz°30°` = 1. Total: **842 existencias**.
- Campo `disponible`: `disponible !== false` **y** `existencias > 0` (**278 productos AGOTADO** ≈ 40%).

### 3.2 Imágenes

```text
admin/source/media/imageN.jpeg  ──>  scripts/optimize-images.py  ──>  public/assets/images/products/
     (675 JPEG ~346×224 px)              WebP: nativa + @2x (692px) + -thumb (160px)
```

- Resultado: 674 productos × 3 variantes = **2022 WebP** (SC015 sin imagen).

### 3.3 Resultados de validación (`npm run products:validate`)

- 689 productos · 15 secciones · **VALIDACIÓN OK**.
- 12 códigos duplicados reales (sufijo): `RA0031`, `Z050` (x3), `APC017`–`APC028` (varios).
- 11 productos sin código → `SINCOD-*` (image40, 167–173, 256, 360–364).
- 15 productos sin imagen (placeholder): `SC015` + 14 nuevos del docx (`C0039`, `RA0125-131`, `PN042`, `RO092-096`).
- `RA0110`: conservado (no aparece en el docx nuevo).

## 4. Catálogo libro — implementado y publicado

### 4.1 Experiencia libro (react-pageflip)

- **Paginación**: `src/utils/paginacion.ts` (`paginarCatalogo`, `indiceSeccion`, `indiceProducto`, `PRODUCTOS_POR_PAGINA = 6`).
- **Estructura**: Portada → Introducción → Página de sección + páginas de productos (por sección) → Contraportada.
- **Portada**: imagen de fondo completa `portada.png` (1254×1254, transparencia) → optimizada a `src/assets/portada.webp` (~132 KB) con `object-fit: cover`, texto MINI ME/tagline y gradiente rosa de respaldo por encima (`z-index`). `logo.jpg`/`portada-logo.webp` retirados.
- **Tarjeta de producto**: imagen con srcset (`-thumb` lazy / nativa / `@2x` detalle), nombre, talla, precio real (`sugerido` del origen), badge **AGOTADO** (fondo gris, `aria-disabled`).
- **Detalle de producto (popup)**: al tocar/hacer clic en una tarjeta se abre un diálogo (`role="dialog"`, `aria-modal`, portado a `body`) con imagen `@2x`, talla completa (wrap), precio real, **existencias** ("X piezas en existencia") y sección. Cierre por botón, Escape, clic en fondo; foco devuelto a la tarjeta.
- **Zoom pinch (2 dedos)** — `src/utils/zoom.ts` (funciones puras) + `src/hooks/usePinchZoom.ts`: pinch 1×–3× centrado en el gesto, pan con 1 dedo al estar ampliado, doble toque/clic alterna 1×↔2.5×, Ctrl+rueda en desktop, regreso suave a 1× bajo 1.05× (respeta `prefers-reduced-motion`). Integrado en el popup (área de imagen) y en el libro (`.libro__zoom` dentro de `.libro__escena`); los gestos de 2 dedos se interceptan en fase captura para no disparar el volteo de páginas; 1 dedo sin zoom sigue hojeando. Solo se anima `transform`.
- **Ajuste móvil (6 productos/página)**: márgenes compactos de página/cabecera/tarjeta y rejilla `repeat(3, minmax(0,1fr))` (2×3) en móvil, `repeat(2, …)` (3×2) en ≥640px, para que precios y detalles quepan sin cortarse.
- **Zona de volteo táctil (móvil)**: el tap simple ya no voltea por sorpresa (`disableFlipByClick=true`); hojear = arrastrar el dedo **desde cualquier parte de la página** (también sobre las tarjetas) o tocar los bordes. Las tarjetas se renderizan como `role="button"` (no `<button>` nativo, que la librería excluía del gesture con `clickEventForward`), con detección propia de tap táctil (umbral 10 px / 300 ms) para abrir el detalle en móvil; `swipeDistance=20`. Teclado Enter/Espacio abre el detalle (WCAG).
- **Navegación**: botones ‹ ›, teclado (flechas, Escape cierra índice; ignora inputs), índice de secciones (diálogo no modal), swipe/drag/tap (mobileScrollSupport=false, swipeDistance=20).
- **Motion**: solo `transform`/`opacity`; `prefers-reduced-motion` reduce `flippingTime` a 1 ms y elimina transiciones.

### 4.2 Búsqueda (`src/utils/busqueda.ts` + `Busqueda.tsx`)

- Normalización (minúsculas, sin acentos) sobre código/nombre/talla.
- Combobox accesible: resultados con teclado (flechas + Enter + Escape), lista `role="listbox"`.
- Al seleccionar → salto a la página del producto (`indiceProducto` + `FlipApi.turnToPage`).

### 4.3 Filtro "Ver solo disponibles" (`src/utils/filtros.ts` + `App.tsx` + `App.css`)

- **Toggle switch premium** en la cabecera (reemplaza checkbox nativo): `role="switch"` + `aria-checked`, track `44×26px` (`blush #FADDE1` → activo `primary #994158`), thumb 20px, transición solo `transform` 160ms. Target 44px, `focus-visible` 3px menta `#3d7d79`, respeta `prefers-reduced-motion`.
- **Responsive:** móvil `≤639px` — `MINI ME` a la izquierda y toggle a la derecha en la misma fila (`cabecera{justify-content:space-between; flex-wrap:nowrap}`), `marca` en columna con totales `0.6rem`; copy `Solo disponibles` → `Solo disp.` a 320px. Desktop `≥640px` — cabecera `flex:1` con `marca{flex:1}` y toggle a la derecha, búsqueda a la derecha en fila única (`barra{gap:.75rem; flex-wrap:wrap}` → `nowrap` en anchos grandes). Ahorra ~52px verticales en móvil.
- Filtra secciones/productos con `disponible = true` (descarta secciones vacías) y re-pagina el libro (remount con `key` `disponibles`/`catalogo`). `meta.totalProductos`/`totalSecciones` se recalculan; la búsqueda opera sobre el catálogo visible.
- Motivo: ~40% AGOTADO (278/689); el filtro permite recorrer sin agotados. Commit `6cd02c4`.

### 4.4 Portada responsive sin cortes ni invasión (`src/components/libro.css` + `src/components/Libro.tsx` + `src/App.css`)

- **Problema corregido (evidencias 2026-08-26):** portada recortada arriba/abajo e invasión del toggle (`7.12.50.png` toggle cortado por borde rosa; `7.17.58.png` portada pequeña a la derecha; `7.23.28.png` bottom `COMPRA` cortado).
- **Fix:** `app__barra{z-index:5; background:var(--color-surface); flex-shrink:0; isolation:isolate}` siempre por encima de `libro{z-index:1}`. `libro__escena` responsive con `clamp` + `calc(100dvh - ...)` por breakpoint: `≤639px 50svh/max calc(100dvh-210px)`, `640-1023px clamp(380,58dvh,520)/max 190px`, `1024-1439px clamp(440,62dvh,640)/max 175px`, `≥1440px 560/max 165px`; `overflow:hidden; isolation:isolate; padding .35-.45rem`. `libro__flip{height:100%}` y `HTMLFlipBook maxHeight 900→720` escalan proporcional centrados vía `libro__zoom{flex; center}`. `libro__controles{justify-content:center; z-index:2; background}` centrados debajo sin ocultarse.
- **Resultado:** portada completa (borde inferior `COMPRA/ENVÍOS/PROMOCIONES` visible), centrada, debajo del header en 320/375/390/430/768/1024/1280/1440/1920; controles y footer siempre visibles, sin scroll forzado.
- **Tests:** `src/components/Libro.layout.test.tsx` (5 casos) verifica escena/controles visibles, orden vertical, y flip centrado. Total **67 tests** (antes 63).

### 4.5 SEO

- `index.html`: `lang="es"`, meta description, theme-color `#994158`, canonical `https://addv-sites.github.io/minime.catalogo/`, OG (title/description/image/url/type), Twitter Card (`summary_large_image`), JSON-LD WebSite. **Imagen de compartir**: `public/og-image-v2.jpg` (1200×630, desde `ic.png`; v2 por cache-busting de plataformas sociales).
- `robots.txt` y `sitemap.xml`.

### 4.6 Accesibilidad (WCAG AA)

- Foco visible (`:focus-visible`, outlines 3px).
- Contraste: menta texto `#3d7d79` (4.76:1), primario `#994158` (6.46:1), tinta sobre superficie (9.74:1).
- ARIA: `aria-live` en indicador de página, `role="dialog"` en índice, `role="listbox"` en búsqueda, `aria-label` en botones.
- Touch targets ≥ 44px; alt text descriptivo en imágenes; teclado completo.

### 4.7 Rendimiento

- Lazy loading (`loading="lazy"` + `decoding="async"`) en tarjetas; `preload` de las primeras imágenes.
- srcset `-thumb` para móvil, nativa, `@2x` para detalle.
- Bundle JS ~253 kB (75 kB gzip) → verde en Lighthouse para CWV.

### 4.8 Pie de página (`App.tsx` + `App.css`)

- Franja compacta fija al pie del layout 100svh (el libro se ajusta con `flex:1`).
- Texto: **"Catálogo hecho por ADDV"** + enlace de contacto `mailto:info@addv.mx`.
- Pendiente: reemplazar el texto por el logo de la empresa cuando esté disponible.

### 4.9 Zoom pinch (popup y libro) — `src/utils/zoom.ts` + `src/hooks/usePinchZoom.ts`

- Gestos: pinch a 2 dedos 1×–3× centrado en el punto medio del gesto; pan con 1 dedo mientras está ampliado (limitado a bordes); doble toque/clic alterna 1×↔2.5×; `Ctrl`+rueda en desktop (pinch de trackpad incluido); regreso suave a 1× al soltar bajo 1.05×.
- **Popup**: el hook va sobre `.detalle__imagen-wrap` (`touch-action: none` solo en el área de imagen; el texto del panel sigue scrolleable).
- **Libro**: hook sobre `.libro__zoom` (div interno de `.libro__escena`, que recorta con `overflow: hidden`). Los gestos de 2 dedos y el pan ampliado se interceptan en **fase captura** con `preventDefault`+`stopPropagation` → react-pageflip no los ve; con 1 dedo y escala 1× el volteo funciona intacto.
- Detalles técnicos: listeners nativos `{ passive: false }` (los sintéticos de React son pasivos), escritura directa de `transform` sin re-renders, coordenadas de caja corregidas por la traslación actual, `prefers-reduced-motion` sin transición de regreso. Solo se anima `transform`.
- Tests: `src/utils/zoom.test.ts` (15 casos sobre las funciones puras). Mock de `matchMedia` añadido a `src/test/setup.ts` para jsdom.

## 5. Admin local (`admin.html`, SOLO dev)

- Entrada `admin.html` + `src/admin/` (main, AdminApp, admin.css).
- **No entra al build**: `vite.config.ts` limita `rollupOptions.input` a `index.html`.
- Carga `admin/source/products-private.json` vía dev server; edita nombre/talla/precio/sugerido/disponible por producto; filtro por sección/búsqueda; exporta JSON actualizado (download `products-private.json`) para regenerar con `npm run products:generate`.
- Comando: `npm run admin` → `http://localhost:5173/admin.html`.
- El JSON privado NO se publica (fuera de `public/`).

## 6. CI/CD — GitHub Actions (`deploy.yml`)

- Dispara en push a `main`. Pasos: checkout, setup Node, install, **lint**, **test** (67 tests), **build**, upload artifact, deploy GitHub Pages (`actions/deploy-pages`).
- Verificado: primer deploy exitoso (2026-08-18). Último push `6cd02c4` (2026-08-26) con toggle + portada responsive.

## 7. Decisiones ya tomadas

1. **Códigos duplicados reales**: ID original + sufijo técnico (`Z050-2`).
2. **Tratamiento fotográfico**: baja resolución → estilización editorial, sin upscaling mágico (el @2x es variante de detalle).
3. **Mobile First** obligatorio (320→1920px).
4. **Sitio 100% estático** en GitHub Pages, sin backend/BD/API/CMS.
5. **Admin local fuera del build** (nunca en producción).
6. **JSON público mínimo**.
7. **Disponibilidad**: default disponible; se marca AGOTADO por producto en el admin.
8. **Stack**: Vite + React + TypeScript + react-pageflip.
9. **Base relativa `./`** para GitHub Pages.

## 8. Pendiente (mejoras futuras)

- Tratamiento fotográfico definitivo (estilización editorial) — bloqueado por modelo sin visión; revisión manual del usuario.
- Confirmación del "md de Stitch" (la identidad usada es el HTML de referencia recibido).
- Derivación de género para filtros (Niña/Niño) en secciones ambiguas.
- Parsing de tallas/colores (hoy se conservan como texto; el popup de detalle muestra la talla completa).
- Tests de componente para `PaginaProductos` con render real (hoy los tests cubren utils + tarjetas + detalle + búsqueda + App + Libro.layout).

## 9. Riesgos actuales

- **Peso del repo**: 675 JPEG + 2022 WebP + `Productos.docx` (~20 MB).
- **Calidad de imágenes**: baja resolución; premium depende de la estilización, no del upscaling.
- **Ambigüedad género y disponibilidad**: disponibles solo en admin/por revisión manual.
- **Agente sin visión**: limita evaluación visual de imágenes/diseño (CLI `sips`/Python o revisión del usuario).
