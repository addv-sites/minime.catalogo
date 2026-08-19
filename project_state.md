# Project State — MINI ME Catálogo Digital

> Última actualización: 2026-08-18 (catálogo libro publicado en GitHub Pages)
> Estado general: **En producción — catálogo libro page-flip + búsqueda + SEO + admin local + CI/CD operativos**

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
| `admin/source/products-private.json` | ✅ Datos privados (675 productos, 15 secciones) |
| `admin/source/media/` | ✅ 675 JPEG originales |
| `scripts/optimize-images.py` | ✅ Pipeline WebP (nativo / @2x / thumb) |
| `scripts/validate-products.mjs` | ✅ Validación de integridad de datos |
| `scripts/generate-products.mjs` | ✅ Generador de `public/data/products.json` (lee campo `disponible`) |
| `public/data/products.json` | ✅ JSON público (675 productos, 15 secciones) |
| `public/assets/images/products/` | ✅ 2022 WebP (674 productos × 3 variantes) |
| `public/robots.txt` | ✅ Robots |
| `public/sitemap.xml` | ✅ Sitemap |
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
     (675 productos, datos internos)         (JSON público mínimo, duplicados con sufijo -2/-3)
```

- Reglas del generador: expone solo `codigo`, `nombre`, `talla`, `precio`, `existencias`, `disponible`, `imagen`; preserva IDs originales (duplicados → sufijo `-2/-3`); agrupa por sección en orden estable; imagen como `<nombre>.webp`.
- Campo `precio` = valor real del campo privado `sugerido` (precio del catálogo); si `sugerido` está vacío se usa `precio` como fallback.
- Campo `existencias`: se deriva del campo privado `final` contando los caracteres `°` (ej. `°°°°` = 4). Caso texto `"60 bolsitas"` → se extrae el número (60). Total: 1542 existencias.
- Campo `disponible`: `disponible !== false` **y** `existencias > 0` (14 productos quedan AGOTADO, los SINCOD sin `final`).

### 3.2 Imágenes

```text
admin/source/media/imageN.jpeg  ──>  scripts/optimize-images.py  ──>  public/assets/images/products/
     (675 JPEG ~346×224 px)              WebP: nativa + @2x (692px) + -thumb (160px)
```

- Resultado: 674 productos × 3 variantes = **2022 WebP** (SC015 sin imagen).

### 3.3 Resultados de validación (`npm run products:validate`)

- 675 productos · 15 secciones · **VALIDACIÓN OK**.
- 12 códigos duplicados reales (sufijo): `RA0031`, `Z050` (x3), `APC017`, `APC019`, `APC020`, `APC021`, `APC022`, `APC024`, `APC025`, `APC026`, `APC027`, `APC028`.
- 11 productos sin código → `SINCOD-*` (image40, 167–173, 256, 360–364).
- `SC015`: sin imagen y precio vacío (placeholder).
- `APC020`: marcador `final` inesperado (warn, no bloquea).

## 4. Catálogo libro — implementado y publicado

### 4.1 Experiencia libro (react-pageflip)

- **Paginación**: `src/utils/paginacion.ts` (`paginarCatalogo`, `indiceSeccion`, `indiceProducto`, `PRODUCTOS_POR_PAGINA = 6`).
- **Estructura**: Portada → Introducción → Página de sección + páginas de productos (por sección) → Contraportada.
- **Portada**: imagen de fondo completa `portada.png` (1254×1254, transparencia) → optimizada a `src/assets/portada.webp` (~132 KB) con `object-fit: cover`, texto MINI ME/tagline y gradiente rosa de respaldo por encima (`z-index`). `logo.jpg`/`portada-logo.webp` retirados.
- **Tarjeta de producto**: imagen con srcset (`-thumb` lazy / nativa / `@2x` detalle), nombre, talla, precio real (`sugerido` del origen), badge **AGOTADO** (fondo gris, `aria-disabled`).
- **Detalle de producto (popup)**: al tocar/hacer clic en una tarjeta se abre un diálogo (`role="dialog"`, `aria-modal`, portado a `body`) con imagen `@2x`, talla completa (wrap), precio real, **existencias** ("X piezas en existencia") y sección. Cierre por botón, Escape, clic en fondo; foco devuelto a la tarjeta. El popup permite **zoom con dos dedos** (`touch-action: pan-x pan-y`, sin bloquear gestos).
- **Ajuste móvil (6 productos/página)**: márgenes compactos de página/cabecera/tarjeta y rejilla `repeat(3, minmax(0,1fr))` (2×3) en móvil, `repeat(2, …)` (3×2) en ≥640px, para que precios y detalles quepan sin cortarse.
- **Zona de volteo táctil (móvil)**: el tap simple ya no voltea por sorpresa (`disableFlipByClick=true`); hojear = arrastrar el dedo **desde cualquier parte de la página** (también sobre las tarjetas) o tocar los bordes. Las tarjetas se renderizan como `role="button"` (no `<button>` nativo, que la librería excluía del gesture con `clickEventForward`), con detección propia de tap táctil (umbral 10 px / 300 ms) para abrir el detalle en móvil; `swipeDistance=20`. Teclado Enter/Espacio abre el detalle (WCAG).
- **Navegación**: botones ‹ ›, teclado (flechas, Escape cierra índice; ignora inputs), índice de secciones (diálogo no modal), swipe/drag/tap (mobileScrollSupport=false, swipeDistance=20).
- **Motion**: solo `transform`/`opacity`; `prefers-reduced-motion` reduce `flippingTime` a 1 ms y elimina transiciones.

### 4.2 Búsqueda (`src/utils/busqueda.ts` + `Busqueda.tsx`)

- Normalización (minúsculas, sin acentos) sobre código/nombre/talla.
- Combobox accesible: resultados con teclado (flechas + Enter + Escape), lista `role="listbox"`.
- Al seleccionar → salto a la página del producto (`indiceProducto` + `FlipApi.turnToPage`).

### 4.3 SEO

- `index.html`: `lang="es"`, meta description, theme-color `#994158`, canonical `https://addv-sites.github.io/minime.catalogo/`, OG (title/description/image/url/type), Twitter Card (`summary_large_image`), JSON-LD WebSite. **Imagen de compartir**: `public/og-image.png` (1280×640, OG/Twitter).
- `robots.txt` y `sitemap.xml`.

### 4.4 Accesibilidad (WCAG AA)

- Foco visible (`:focus-visible`, outlines 3px).
- Contraste: menta texto `#3d7d79` (4.76:1), primario `#994158` (6.46:1), tinta sobre superficie (9.74:1).
- ARIA: `aria-live` en indicador de página, `role="dialog"` en índice, `role="listbox"` en búsqueda, `aria-label` en botones.
- Touch targets ≥ 44px; alt text descriptivo en imágenes; teclado completo.

### 4.5 Rendimiento

- Lazy loading (`loading="lazy"` + `decoding="async"`) en tarjetas; `preload` de las primeras imágenes.
- srcset `-thumb` para móvil, nativa, `@2x` para detalle.
- Bundle JS ~246 kB (74 kB gzip) → verde en Lighthouse para CWV.

### 4.6 Pie de página (`App.tsx` + `App.css`)

- Franja compacta fija al pie del layout 100svh (el libro se ajusta con `flex:1`).
- Texto: **"Catálogo hecho por ADDV"** + enlace de contacto `mailto:info@addv.mx`.
- Pendiente: reemplazar el texto por el logo de la empresa cuando esté disponible.

## 5. Admin local (`admin.html`, SOLO dev)

- Entrada `admin.html` + `src/admin/` (main, AdminApp, admin.css).
- **No entra al build**: `vite.config.ts` limita `rollupOptions.input` a `index.html`.
- Carga `admin/source/products-private.json` vía dev server; edita nombre/talla/precio/sugerido/disponible por producto; filtro por sección/búsqueda; exporta JSON actualizado (download `products-private.json`) para regenerar con `npm run products:generate`.
- Comando: `npm run admin` → `http://localhost:5173/admin.html`.
- El JSON privado NO se publica (fuera de `public/`).

## 6. CI/CD — GitHub Actions (`deploy.yml`)

- Dispara en push a `main`. Pasos: checkout, setup Node, install, **lint**, **test** (34 tests), **build**, upload artifact, deploy GitHub Pages (`actions/deploy-pages`).
- Verificado: primer deploy exitoso (2026-08-18).

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
- Tests de componente para `Libro`/`PaginaProductos` con render real (hoy los tests cubren utils + tarjetas + detalle + búsqueda + App).

## 9. Riesgos actuales

- **Peso del repo**: 675 JPEG + 2022 WebP + `Productos.docx` (~20 MB).
- **Calidad de imágenes**: baja resolución; premium depende de la estilización, no del upscaling.
- **Ambigüedad género y disponibilidad**: disponibles solo en admin/por revisión manual.
- **Agente sin visión**: limita evaluación visual de imágenes/diseño (CLI `sips`/Python o revisión del usuario).
