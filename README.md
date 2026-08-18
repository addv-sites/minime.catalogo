# MINI ME — Catálogo Digital Premium de Ropa para Bebé

Catálogo online premium de ropa para bebé de la marca **MINI ME**, diseñado para sentirse como un **catálogo editorial físico convertido en experiencia digital interactiva** (page-flip, mobile-first).

El sitio es **100% estático** y desplegable en **GitHub Pages**, sin backend, base de datos, API ni CMS.

---

## Estado actual

> **Fase actual: Datos e imágenes migrados · Stack Vite+React operativo · Scaffold funcional · Catálogo libro pendiente.**

| Fase | Estado |
|---|---|
| Análisis de `Productos.docx` | ✅ Completado (675 productos, 15 secciones) |
| Extracción de datos a JSON | ✅ `admin/source/products-private.json` |
| Extracción de imágenes del .docx | ✅ Migradas al repo (`admin/source/media/`, 675 JPEG) |
| Recepción del diseño de Stitch | ✅ Recibido (HTML de referencia, paleta y tipografías) |
| Definición de stack | ✅ Vite 8 + React 19 + TypeScript 6 + Vitest + oxlint + react-pageflip |
| Pipeline de datos | ✅ `generate-products.mjs` → `public/data/products.json` (675, 15 secciones) |
| Pipeline de imágenes | ✅ `optimize-images.py` → 2022 WebP (nativa / @2x / thumb) |
| Scaffold del catálogo | ✅ Header + grid de secciones, tokens de Stitch, tests |
| Implementación del catálogo libro (page-flip) | ⏳ Pendiente |
| Búsqueda / filtros / estados AGOTADO | ⏳ Pendiente |
| Administrador local | ⏳ Pendiente |
| Build + GitHub Actions para GitHub Pages | ⏳ Pendiente |
| Auditoría final | ⏳ Pendiente |

---

## Comandos

| Comando | Descripción |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Desarrollo Vite |
| `npm run build` | Typecheck (`tsc -b`) + build estático en `dist/` |
| `npm run preview` | Preview del build |
| `npm run lint` | Lint (oxlint) |
| `npm test` | Pruebas unitarias (Vitest, 8 tests) |
| `npm run test:watch` | Tests en watch |
| `npm run products:validate` | Validar `admin/source/products-private.json` |
| `npm run products:generate` | Generar `public/data/products.json` |
| `npm run images:optimize` | Optimizar imágenes a WebP (requiere Pillow) |
| `npm run admin` | Dev en modo admin (pendiente de implementar) |

---

## Fuente de datos: `Productos.docx`

Archivo Word (~20 MB) en la raíz del proyecto, fuente única y verdadera de productos.

**Contenido analizado:**
- 15 tablas con 675 productos.
- 675 imágenes JPEG (~346×224 px, ~29 KB, baja resolución).
- Columnas por producto: `imagen | código+nombre | talla+colores | precio | precio sugerido | marcador ° (disponibilidad por variante)`.

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

### Anomalías documentadas del documento

- **`SC015`** (COBIJA POLAR): sin imagen y con precio vacío.
- **12 códigos duplicados reales**: `RA0031`, `Z050` (x3), `APC017/019/020/021/022/024/025/026/027/028`. Decisión conservadora: preservar el ID original añadiendo sufijo técnico interno (ej. `Z050-2`).
- **11 productos sin código**: reciben ID técnico `SINCOD-*`.
- **Talla + colores mezclados** en una sola celda.
- **Campo `final` (°)**: checkbox por variante, todos vacíos (nada marcado como disponible/agotado aún).
- **`APC020`**: marcador `final` inesperado (warn).

### Resultado de la validación

`npm run products:validate` → **VALIDACIÓN OK**: 675 productos, 15 secciones, 12 duplicados, 11 sin código, `SC015` sin imagen/precio.

---

## Identidad visual (diseño de Stitch)

Recibida como HTML de referencia y reflejada en `src/styles/tokens.css`:

- **Paleta**: rosa vino (primario `#994158`, contenedor `#f58aa3`, `blush-highlight #FADDE1`), verde menta (terciario `#71b6b3`, `#a9efec`), superficie cálida (`#fff8f3`), tinta `#4A3E3E`.
- **Tipografías**: Nunito Sans, Plus Jakarta Sans, Quicksand.
- **Iconos**: Material Symbols Outlined.
- **Estilo**: Mobile First, catálogo editorial premium.

> ⚠️ Queda pendiente confirmar si el HTML recibido reemplaza al "md de Stitch" prometido, o si aún llegará un archivo Markdown adicional.

---

## Estructura del repositorio

```text
minime_cat/
│
├── public/                        # Build público (lo único desplegado)
│   ├── assets/images/products/    # 2022 WebP (674×3: nativa, @2x, -thumb)
│   ├── data/products.json         # JSON público del catálogo (675, 15 secciones)
│   └── favicon.svg
│
├── src/                           # Frontend (Vite + React + TS)
│   ├── data/catalog.ts            # Tipos + loader del catálogo
│   ├── utils/format.ts            # normalizarPrecio, slugificar
│   ├── styles/tokens.css          # Tokens de identidad Stitch
│   ├── styles/global.css          # Reset, tipografía, focus-visible
│   ├── App.tsx / App.css          # Header + grid de secciones (scaffold)
│   └── test/                      # Setup de pruebas
│
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
├── .github/workflows/             # GitHub Actions (pendiente)
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

## Próximos pasos

1. **Implementar el catálogo libro/page-flip** (core del encargo): portada → secciones → cierre, navegación swipe/tap/teclado, profundidad/sombras con `react-pageflip`.
2. Búsqueda, filtros y estados de **AGOTADO** (definir disponibilidad con `final` vacío).
3. **Administrador local** (CRUD de disponibilidad/precio/imagen) + regeneración de JSON.
4. srcset responsivo (`-thumb`/`@2x`) + lazy loading en la UI.
5. **GitHub Actions** (`deploy.yml`) para GitHub Pages.
6. **SEO** (meta, OG, canonical, sitemap, robots.txt, structured data).
7. **Auditoría final** (funcionalidad, responsive, performance, seguridad, accesibilidad WCAG).

---

## Notas de trabajo

- El agente (modelo) **no admite entrada de imágenes**: la evaluación visual del tratamiento fotográfico requiere inspección técnica por CLI (`sips`) o revisión manual del usuario. Decisión acordada: estilización editorial, sin upscaling.
- Reglas del protocolo de trabajo (analizar → proponer → confirmar → implementar): ver `claude.md`.
