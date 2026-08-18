# MINI ME — Catálogo Digital Premium de Ropa para Bebé

Catálogo online premium de ropa para bebé de la marca **MINI ME**, diseñado para sentirse como un **catálogo editorial físico convertido en experiencia digital interactiva** (page-flip, mobile-first).

El sitio es **100% estático** y está publicado en **GitHub Pages**, sin backend, base de datos, API ni CMS.

**En producción:** https://addv-sites.github.io/minime.catalogo/

---

## Estado actual

> **Fase actual: En producción — catálogo libro page-flip + búsqueda + SEO + admin local + CI/CD operativos.**

| Fase | Estado |
|---|---|
| Análisis de `Productos.docx` | ✅ Completado (675 productos, 15 secciones) |
| Extracción de datos a JSON | ✅ `admin/source/products-private.json` |
| Extracción de imágenes del .docx | ✅ Migradas al repo (`admin/source/media/`, 675 JPEG) |
| Recepción del diseño de Stitch | ✅ Recibido (HTML de referencia, paleta y tipografías) |
| Definición de stack | ✅ Vite 8 + React 19 + TypeScript 6 + Vitest + oxlint + react-pageflip |
| Pipeline de datos | ✅ `generate-products.mjs` → `public/data/products.json` (675, 15 secciones) |
| Pipeline de imágenes | ✅ `optimize-images.py` → 2022 WebP (nativa / @2x / thumb) |
| Catálogo libro (page-flip) | ✅ Portada → introducción → secciones → contraportada |
| Búsqueda / estados AGOTADO | ✅ Búsqueda accesible + badge AGOTADO por producto |
| Administrador local | ✅ `admin.html` (solo dev, excluido del build) |
| SEO | ✅ Meta, OG, canonical, sitemap, robots.txt, structured data |
| GitHub Actions (CI/CD) | ✅ lint + test + build + deploy a GitHub Pages |
| Auditoría final | ✅ Responsive, a11y (WCAG AA), contraste, reduced-motion, sin admin en build |

---

## Comandos

| Comando | Descripción |
|---|---|
| `./inicia.sh` | Arrancar el entorno local (instala dependencias si faltan + `npm run dev`) |
| `npm install` | Instalar dependencias |
| `npm run dev` | Desarrollo Vite |
| `npm run build` | Typecheck (`tsc -b`) + build estático en `dist/` |
| `npm run preview` | Preview del build |
| `npm run lint` | Lint (oxlint) |
| `npm test` | Pruebas unitarias (Vitest, 41 tests) |
| `npm run test:watch` | Tests en watch |
| `npm run products:validate` | Validar `admin/source/products-private.json` |
| `npm run products:generate` | Generar `public/data/products.json` |
| `npm run images:optimize` | Optimizar imágenes a WebP (requiere Pillow) |
| `npm run admin` | Admin local → `http://localhost:5173/admin.html` |

---

## Fuente de datos: `Productos.docx`

Archivo Word (~20 MB) en la raíz del proyecto, fuente única y verdadera de productos.

**Contenido analizado:**
- 15 tablas con 675 productos.
- 675 imágenes JPEG (~346×224 px, ~29 KB, baja resolución).
- Columnas por producto: `imagen | código+nombre | talla+colores | precio | precio sugerido | marcador ° (existencias en almacén)`.

### Secciones reales (675 productos)

| Sección | Prefijo | Nº prod. |
|---|---|---|
| Calcetas y tines | C | 39 |
| Ropa Niña | RA | 133 |
| Estimulación psicomotriz | EP | 41 |
| Pañaleras y bolsas organizadoras | PB/PN | 42 |
| Ropa Niño | RO | 108 |
| Baberos | B | 11 |
| Kit | K | 27 |
| Zapatitos | Z | 74 |
| Peluches | P | 39 |
| Higiene | H | 24 |
| Detallitos | D | 33 |
| Todo para su chupón | TPC | 21 |
| Accesorios para su cabecita | APC | 52 |
| Sabanitas y cobijitas | SC | 18 |
| Fulares y cangureras | FC | 13 |

### Modelo de datos extraído (campos por producto)

```json
{
  "seccion": "ZAPATITOS",
  "tabla": 7,
  "codigo": "Z050",
  "nombre": "CROCS",
  "talla": "14CM AZUL DINO ROSA DINO VERDE COCO AMARILLO DINO",
  "precio": "$35.00 C/U",
  "sugerido": "$95.00",
  "final": "°°°°°",
  "imagen": "image452.jpeg"
}
```

> **Mapeo al catálogo público** (`public/data/products.json`): el precio del catálogo es el **precio sugerido** (`sugerido`); las **existencias** se cuentan del campo `final` (nº de `°`). El JSON público expone solo `codigo | nombre | talla | precio | existencias | disponible | imagen`.

### Anomalías documentadas del documento

- **`SC015`** (COBIJA POLAR): sin imagen y con precio vacío.
- **12 códigos duplicados reales**: `RA0031`, `Z050` (x3), `APC017/019/020/021/022/024/025/026/027/028`. Decisión conservadora: preservar el ID original añadiendo sufijo técnico interno (ej. `Z050-2`).
- **11 productos sin código**: reciben ID técnico `SINCOD-*`.
- **Talla + colores mezclados** en una sola celda.
- **Campo `final` (°)**: cantidad de existencias en almacén. El generador las cuenta (`°°°°` = 4); el texto `"60 bolsitas"` se lee como número (60). Total: 1542 existencias.
- **`APC020`**: marcador `final` inesperado (warn).

### Resultado de la validación

`npm run products:validate` → **VALIDACIÓN OK**: 675 productos, 15 secciones, 12 duplicados, 11 sin código, `SC015` sin imagen/precio.

---

## El catálogo (funcionalidades implementadas)

- **Libro page-flip** con `react-pageflip`: portada (con imagen `portada.png` de fondo, WebP ~132 KB) → introducción → páginas de sección + productos (6 por página) → contraportada.
- **Imagen al compartir**: `public/og-image.png` (1280×640) en metas OG y Twitter Card para previsualización del link en GitHub Pages.
- **Navegación**: botones ‹ ›, teclado (flechas; Escape cierra el índice; no interfiere al escribir), swipe/drag/tap, índice de secciones.
- **Búsqueda**: por código, nombre o talla; con salto directo a la página del producto.
- **AGOTADO**: badge claro cuando `existencias = 0` o no disponible; el producto no se elimina.
- **Detalle de producto (popup)**: al tocar/hacer clic en una tarjeta se abre un diálogo accesible con imagen `@2x`, talla completa, precio real, **existencias** y sección; permite **zoom con dos dedos**. Cierra por botón, Escape o clic en el fondo.
- **Móvil**: 6 productos por página con márgenes compactos para que precios y detalles no se corten.
- **Imágenes**: WebP con srcset (`-thumb` lazy / nativa / `@2x` detalle).
- **Accesibilidad (WCAG AA)**: foco visible, contraste corregido, ARIA (`aria-live`, `role="dialog"`, `role="listbox"`), alt text, touch targets ≥ 44px, `prefers-reduced-motion`.

---

## Administrador local (solo desarrollo)

El admin **nunca se publica**: `vite.config.ts` limita el build a `index.html`, así que `admin.html` y `src/admin/` quedan fuera de `dist/`.

- Comando: `npm run admin` → `http://localhost:5173/admin.html`.
- Carga `admin/source/products-private.json` y permite editar nombre, talla, precio, sugerido y **disponibilidad** (AGOTADO) por producto, filtrar por sección y exportar el JSON actualizado.
- Para reflejar cambios: reemplazar `admin/source/products-private.json` y ejecutar `npm run products:generate`.

---

## Identidad visual (diseño de Stitch)

Recibida como HTML de referencia y reflejada en `src/styles/tokens.css`:

- **Paleta**: rosa vino (primario `#994158`, contenedor `#f58aa3`, `blush-highlight #FADDE1`), verde menta (terciario `#71b6b3`, `#a9efec`, texto accesible `#3d7d79`), superficie cálida (`#fff8f3`), tinta `#4A3E3E`.
- **Tipografías**: Nunito Sans, Plus Jakarta Sans, Quicksand.
- **Iconos**: Material Symbols Outlined.
- **Estilo**: Mobile First, catálogo editorial premium.

> ⚠️ Queda pendiente confirmar si el HTML recibido reemplaza al "md de Stitch" prometido, o si aún llegará un archivo Markdown adicional.

---

## Estructura del repositorio

```text
minime_cat/
│
├── .github/workflows/deploy.yml   # CI/CD: lint + test + build + GitHub Pages
│
├── public/                        # Build público (lo único desplegado)
│   ├── assets/images/products/    # 2022 WebP (674×3: nativa, @2x, -thumb)
│   ├── data/products.json         # JSON público del catálogo (675, 15 secciones)
│   ├── robots.txt                 # SEO
│   ├── sitemap.xml                # SEO
│   └── favicon.svg
│
├── src/                           # Frontend (Vite + React + TS)
│   ├── data/catalog.ts            # Tipos + loader + rutaImagen/srcsetImagen
│   ├── utils/format.ts            # normalizarPrecio, slugificar
│   ├── utils/paginacion.ts        # paginarCatalogo, indiceSeccion, indiceProducto
│   ├── utils/busqueda.ts          # buscarProductos, normalizarTexto
│   ├── components/                # Libro, Portada, Sección, Productos, Tarjeta, Detalle, Búsqueda, Contraportada
│   ├── admin/                     # Admin local (dev) — NO entra al build
│   ├── styles/tokens.css          # Tokens de identidad Stitch
│   ├── styles/global.css          # Reset, tipografía, focus-visible
│   ├── App.tsx / App.css          # Búsqueda + Libro + estados carga/error
│   └── test/                      # Setup de pruebas
│
├── admin.html                     # Entrada del admin local (solo dev)
├── admin/                         # Administrador local (NO se publica)
│   └── source/
│       ├── products-private.json  # Datos extraídos (675 productos)
│       └── media/                 # 675 JPEG originales
│
├── scripts/
│   ├── validate-products.mjs      # Valida integridad de datos
│   ├── generate-products.mjs      # Genera public/data/products.json
│   └── optimize-images.py         # WebP: nativa / @2x / thumb
│
├── Productos.docx                 # Fuente de datos original
├── package.json
└── README.md
```

Reglas de arquitectura fijadas por el prompt maestro:

- El **administrador NO forma parte del build público** (nunca accesible vía `/admin` en GitHub Pages).
- El **JSON público contiene únicamente la información necesaria** para el catálogo.
- Datos administrativos separados (`admin/source/`) → generador → `public/data/products.json`.
- Vite usa `base: './'` (rutas relativas) para servir correctamente en GitHub Pages.
- Sin falsa sensación de seguridad: los datos que el navegador necesita son accesibles al cliente; lo que se protege es el admin y los datos internos.

---

## Entorno de desarrollo

- **Node.js 24.19** / **npm 11.17** (requeridos para dev/build/tests).
- **Python 3.11 + Pillow** (solo para el pipeline de imágenes).
- macOS (darwin), shell zsh.

---

## Próximos pasos (mejoras futuras)

1. **Tratamiento fotográfico definitivo** (estilización editorial): pendiente de revisión visual (el agente no tiene visión; usar `sips` o revisión manual).
2. Confirmar identidad visual definitiva (¿llega el "md de Stitch"?).
3. Derivación de género (Niña/Niño) para secciones ambiguas.
4. Parsing de tallas/colores (hoy se conservan como texto; el popup de detalle muestra la talla completa).
5. Tests de componente para `Libro`/`PaginaProductos` con render real (los tests actuales cubren utils, tarjetas, detalle, búsqueda y App).

---

## Notas de trabajo

- El agente (modelo) **no admite entrada de imágenes**: la evaluación visual del tratamiento fotográfico requiere inspección técnica por CLI (`sips`) o revisión manual del usuario. Decisión acordada: estilización editorial, sin upscaling.
- Reglas del protocolo de trabajo (analizar → proponer → confirmar → implementar): ver `claude.md`.
