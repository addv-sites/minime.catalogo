# CLAUDE.md — Contexto Operativo del Repo MINI ME

Este archivo es el contexto persistente para cualquier agente (Claude, opencode, etc.) que trabaje en este proyecto. Léelo siempre antes de modificar el repo.

---

## 1. Qué es el proyecto

**MINI ME** — catálogo digital premium de ropa para bebé, experiencia tipo **libro/catálogo físico** con page-flip, mobile-first, 100% estático, desplegable en **GitHub Pages**.

Fuente de datos única: `Productos.docx` (675 productos, 15 secciones).

## 2. Protocolo de trabajo obligatorio

Este proyecto opera bajo el protocolo **addv-web-app** (skill instalada). Reglas no negociables:

1. **Analizar → Proponer → Confirmar → Implementar.** Nunca escribir código/archivos sin aprobación explícita del segmento. Presentar plan, esperar "procede/implementa".
2. **No asumir requisitos.** Ante ambigüedad, preguntar. No inventar productos/precios/categorías/datos: usar SOLO lo que existe en `Productos.docx`.
3. **Responder en español** (regla global de usuario).
4. **Piso de calidad** en toda entrega: UX/UI, accesibilidad (WCAG), rendimiento (Core Web Vitals), seguridad anti-hackeo, calidad nivel SonarQube, **pruebas unitarias ejecutables en local**.
5. **Documentar** en `project_state.md`, `claude.md`, `README.md` al cerrar cada segmento.
6. **Cero regresiones**: verificar que los cambios no rompen lo existente.

## 3. Reglas del prompt maestro (resumen ejecutivo)

- Leer/analizar `Productos.docx` y el diseño de Stitch **antes** de implementar.
- **Mobile First** obligatorio (320px → 1920px).
- Experiencia **libro físico**: page-flip con profundidad/sombras/perspectiva en desktop; swipe/drag/tap en mobile. Animaciones solo `transform`/`opacity`.
- **NO** publicar el administrador (nunca `/admin` en producción).
- **JSON público mínimo**: solo datos para mostrar el catálogo.
- **NO inventar** productos, precios, categorías ni fotografías.
- Productos agotados: se muestran con señal clara (AGOTADO), no se eliminan.
- SEO: semantic HTML, meta, OG, canonical, sitemap, robots.txt, structured data (sin inventar).
- Accesibilidad: keyboard, focus visible, contraste, ARIA, alt text, touch targets, `prefers-reduced-motion`.
- Documentar decisiones ambiguas y elegir la opción más conservadora.
- No prometer seguridad criptográfica inexistente en un sitio estático.

## 4. Datos conocidos

### 4.1 Modelo de datos extraído (de `Productos.docx`)

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

### 4.2 Secciones (prefijo de código → nombre)

| Prefijo | Sección | Nº |
|---|---|---|
| C | Calcetas y tines | 39 |
| RA | Ropa Niña | 133 |
| EP | Estimulación psicomotriz | 41 |
| PB/PN | Pañaleras y bolsas organizadoras | 42 |
| RO | Ropa Niño | 108 |
| B | Baberos | 11 |
| K | Kit | 27 |
| Z | Zapatitos | 74 |
| P | Peluches | 39 |
| H | Higiene | 24 |
| D | Detallitos | 33 |
| TPC | Todo para su chupón | 21 |
| APC | Accesorios para su cabecita | 52 |
| SC | Sabanitas y cobijitas | 18 |
| FC | Fulares y cangureras | 13 |

### 4.3 Anomalías conocidas

- `SC015`: sin imagen, precio vacío.
- Duplicados reales: `RA0031`, `Z050`, `APC017–028` → sufijo interno sin alterar ID original (`Z050-2`).
- Talla+colores mezclados en una celda.
- Campo `final` (°) = disponibilidad por variante, todo vacío.

### 4.4 Identidad visual (Stitch, HTML recibido)

- Primario: `#994158` (rosa vino); contenedor `#f58aa3`; `blush-highlight #FADDE1`.
- Terciario (menta): `#71b6b3`, `#a9efec`; texto menta accesible: `#3d7d79`.
- Superficie cálida: `#fff8f3`; tinta: `#4A3E3E`.
- Tipografías: **Nunito Sans**, **Plus Jakarta Sans**, **Quicksand**.
- Iconos: Material Symbols Outlined.
- Estética: catálogo editorial premium, Mobile First.

## 5. Arquitectura implementada (en producción)

```text
minime_cat/
├── .github/workflows/deploy.yml   # CI/CD: lint + test + build + GitHub Pages
├── public/                        # Solo esto se despliega
│   ├── assets/images/products/    # 2022 WebP (674×3: nativa, @2x, -thumb)
│   ├── data/products.json         # JSON público del catálogo (675, 15 secciones)
│   ├── robots.txt                 # SEO
│   ├── sitemap.xml                # SEO
│   └── favicon.svg
├── src/                           # Frontend (Vite + React + TS)
│   ├── data/catalog.ts            # Tipos + loader + rutaImagen/srcsetImagen
│   ├── utils/
│   │   ├── format.ts              # normalizarPrecio, slugificar
│   │   ├── paginacion.ts          # paginarCatalogo, indiceSeccion, indiceProducto (6/pág)
│   │   └── busqueda.ts            # buscarProductos, normalizarTexto
│   ├── components/
│   │   ├── Libro.tsx              # Libro page-flip (react-pageflip, FlipApi, teclado, índice)
│   │   ├── Portada/Introduccion/Contraportada.tsx
│   │   ├── PaginaSeccion.tsx / PaginaProductos.tsx / TarjetaProducto.tsx
│   │   ├── DetalleProducto.tsx    # Popup de detalle (diálogo, zoom 2 dedos, portado a body)
│   │   ├── Busqueda.tsx           # Combobox accesible
│   │   └── libro.css
│   ├── admin/                     # Admin local (dev) — NO entra al build
│   │   ├── main.tsx / AdminApp.tsx / admin.css
│   ├── styles/tokens.css          # Tokens de identidad Stitch
│   ├── styles/global.css          # Reset, tipografía, focus-visible
│   ├── App.tsx / App.css          # Búsqueda + Libro + estados carga/error
│   └── test/                      # Setup de pruebas
├── admin.html                     # Entrada del admin local (dev, excluida del build)
├── admin/                         # Local, NO se publica
│   └── source/
│       ├── products-private.json  # Datos extraídos (675 productos)
│       └── media/                 # 675 JPEG originales
├── scripts/
│   ├── validate-products.mjs      # Valida integridad de datos
│   ├── generate-products.mjs      # Genera public/data/products.json (lee `disponible`)
│   └── optimize-images.py         # WebP: nativa / @2x / thumb
├── Productos.docx
└── package.json
```

- **Producción**: https://addv-sites.github.io/minime.catalogo/
- Admin → generador → `products.json` (separación datos públicos/privados).
- El build genera únicamente `index.html` (`vite.config.ts` limita `rollupOptions.input`), excluyendo admin.
- Vite `base: './'` (rutas relativas) para GitHub Pages.

## 5.1 Scripts existentes

### `scripts/optimize-images.py`
Pipeline de imágenes (WebP): resolución nativa + variante `@2x` (692px, detalle) + `-thumb` (160px, lazy/preload).
Uso: `python3 scripts/optimize-images.py <media_dir> [--dry-run]`. Requiere Pillow (`python3 -m pip install Pillow`). Ejecutado: 2022 WebP en `public/assets/images/products/`.

### `scripts/generate-products.mjs`
Genera `public/data/products.json` desde `admin/source/products-private.json`. Expone solo campos del catálogo; preserva IDs (duplicados → sufijo `-2/-3`); agrupa por sección en orden estable; imagen como `<nombre>.webp`. Campo `disponible`: usa `p.disponible !== false` (default disponible; el admin lo puede marcar).

### `scripts/validate-products.mjs`
Valida integridad de datos: duplicados reales, sin imagen, precios vacíos, códigos/nombres ausentes, consistencia de secciones. Salida no-cero si hay errores graves. Estado actual: VALIDACIÓN OK (12 duplicados, 11 SINCOD, SC015 sin imagen/precio, APC020 warn).

## 6. Comandos frecuentes

| Comando | Descripción | Estado |
|---|---|---|
| `./inicia.sh` | Arrancar el entorno local (instala deps si faltan + `npm run dev`) | ✅ |
| `npm install` | Instalar dependencias | ✅ |
| `npm run dev` | Desarrollo Vite | ✅ |
| `npm run build` | Typecheck + build estático (`tsc -b && vite build`) | ✅ |
| `npm run preview` | Preview del build | ✅ |
| `npm run lint` | Lint (oxlint) | ✅ |
| `npm test` / `npm run test:watch` | Pruebas unitarias (Vitest, 41 tests) | ✅ |
| `npm run products:validate` | Validar productos | ✅ |
| `npm run products:generate` | Generar JSON | ✅ |
| `npm run images:optimize` | Optimizar imágenes (Pillow) | ✅ (2022 WebP generados) |
| `npm run admin` | Administrador local → `http://localhost:5173/admin.html` | ✅ |

**Stack definido:** Vite 8 + React 19 + TypeScript 6 + Vitest 4 + oxlint + **react-pageflip 2.0.3** (integrado). Entorno: Node 24.19, npm 11.17, Python 3.11 + Pillow. ⚠️ El agente actual no tiene visión: la evaluación visual de imágenes/diseño requiere CLI (`sips`) o revisión manual del usuario.

## 7. Entorno de trabajo

- Repo: `/Users/prolan/repos/minime_cat/`
- IDE: IntelliJ (`.idea/`)
- Git: remote `origin` → `https://github.com/addv-sites/minime.catalogo.git` (branch `main`).
- Datos en repo: `admin/source/products-private.json` (675 productos) + `admin/source/media/` (675 JPEG).
- Imágenes generadas: `public/assets/images/products/` (2022 WebP).
- JSON público: `public/data/products.json` (675, 15 secciones).
- Temporal `/var/folders/.../opencode/minime/`: ya no es crítico (datos e imágenes están en el repo); puede limpiarse.
- Regla global del usuario: **responder siempre en español**.
- ⚠️ **Modelo del agente sin visión**: no puede inspeccionar imágenes directamente; usar `sips`/Python para análisis técnico o pedir revisión al usuario.

## 8. Checklist de cierre por entrega

- [x] Pruebas unitarias ejecutables en local (un comando documentado).
- [x] Lint/typecheck sin errores.
- [x] Responsive (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920).
- [x] Performance: imágenes optimizadas, lazy loading, sin animaciones costosas.
- [x] Accesibilidad: keyboard, focus, contrast, alt, reduced-motion.
- [x] Seguridad: sin admin en build, sin credenciales/secretos, JSON mínimo.
- [x] `project_state.md`, `claude.md`, `README.md` actualizados.
- [x] Sin regresiones.