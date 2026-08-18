# CMEM — Memoria de Conversación MINI ME

> **Propósito**: memoria comprimida de todo lo platicado con el usuario sobre el catálogo MINI ME, para que cualquier agente (Claude, opencode) retome el trabajo con contexto completo sin volver a preguntar.
> **Última actualización**: 2026-08-17

---

## Resumen ejecutivo (una línea)

El usuario quiere un **catálogo digital premium de ropa de bebé (MINI ME) con experiencia de libro físico (page-flip), mobile-first, estático, en GitHub Pages**, construido SOLO con los datos reales de `Productos.docx`, respetando el diseño de Stitch, bajo el protocolo `addv-web-app`.

---

## Historial de la conversación

### 1. Instalación de herramientas
- El usuario pidió instalar `add-web-app` (GitHub: `antonioprado-sketch/add-web-app`) → se instaló la **skill addv-web-app**.
- El usuario pidió instalar `ruflo` → se instaló la skill **ruflo**.
- El usuario pidió "solo la skill, si se requiere el resto sugierelo para instalar bajo demanda".
- El usuario pidió que **siempre hable en español** → regla global (persistida en `~/.config/opencode/AGENTS.md`).

### 2. Prompt maestro (el encargo principal)
El usuario entregó un **PROMPT MAESTRO** extenso (45 reglas) que define el proyecto MINI ME. Puntos clave:

- **Rol**: equipo senior multidisciplinario (frontend, UX/UI, CX, motion, a11y, performance, arquitectura, seguridad, SEO).
- **Objetivo**: catálogo editorial premium tipo libro físico, NO un grid genérico.
- **Contexto**: marca MINI ME, ropa para bebé (niña/niño), explorar categorías, navegar productos, fotos, precios, agotados, buscar, filtrar, navegar como libro.
- **Estático**: GitHub Pages, sin backend/BD/API/CMS/PHP/Node en producción.
- **Analizar primero**: leer `Productos.docx` y el md de Stitch antes de programar.
- **Identidad visual**: respetar estrictamente Stitch (colores, tipografías, espaciados, tratamiento fotográfico); NO reemplazarla por plantilla genérica.
- **Mobile First** (320→1920px), touch/mouse/teclado.
- **Experiencia libro físico**: page-flip con profundidad/sombras/perspectiva; swipe/drag/tap en mobile.
- **Estructura**: portada → introducción/brand → secciones → cierre, ADAPTADA a los datos reales.
- **JSON** como fuente de datos; modelo adaptado a columnas reales.
- **Administrador local**: editar productos, disponibilidad, precio, imágenes; generar JSON; NO publicar en `/admin`.
- **Seguridad realista**: no prometer cifrado que no puede existir; JSON público mínimo; admin separado.
- **Imágenes**: extraer, optimizar, WebP/AVIF, thumbnails, lazy loading, sin destruir calidad.
- **Performance**: lazy loading, responsive images, evitar JS pesado; page-flip no debe ser lento.
- **UX/CX**: confianza, ternura, calidad, exclusividad, cuidado, deseabilidad; reducir carga cognitiva.
- **Agotados**: se muestran con señal clara (AGOTADO), no se eliminan.
- **Accesibilidad WCAG**: keyboard, focus, contraste, ARIA, alt, touch targets, `prefers-reduced-motion`.
- **SEO**: semantic HTML, meta, OG, canonical, sitemap, robots, structured data (sin inventar).
- **Validaciones** (IDs duplicados, precios, etc.) y **manejo de errores** elegante.
- **Microinteracciones** sutiles y rápidas, no sobreanimar.
- **Calidad de código**: limpio, modular, mantenible.
- **README completo** (instalación, dev, admin, build, deploy).
- **Scripts**: `products:validate`, `products:generate`, `images:optimize`, `admin`, `build`, `preview`.
- **Auditoría final**: checklist de funcionalidad, responsive, performance, seguridad, accesibilidad.
- **Regla 45**: LEE Productos.docx y Stitch antes de crear cualquier componente. Comprende → diseña → implementa → prueba → optimiza.
- **Cierre del prompt**: "y espera por el md de stitch".

### 3. Análisis de Productos.docx (completado)
- Documento Word ~20 MB con **15 tablas / 675 productos / 675 imágenes JPEG (~346×224 px, ~29 KB, baja resolución)**.
- Columnas por producto: `imagen | código+nombre | talla+colores | precio | precio sugerido | marcador ° (disponibilidad por variante)`.
- 15 secciones reales (C, RA, EP, PB/PN, RO, B, K, Z, P, H, D, TPC, APC, SC, FC) — ver tabla en `claude.md`.
- **Anomalías**: `SC015` sin imagen y sin precio; duplicados reales (`RA0031`, `Z050`, `APC017–028`); talla+colores mezclados en una celda; campo `final` (°) todo vacío.
- **Decisiones**: conservar ID original con sufijo técnico para duplicados (`Z050-2`); sin upscaling (estilización editorial por baja resolución).
- Datos extraídos a `products_extracted.json` (675 productos).

### 4. Diseño de Stitch (recibido como HTML)
- El usuario pegó el **HTML del diseño Stitch** (Catálogo Mini Me Mobile): config Tailwind con paleta completa, tipografías Nunito Sans / Plus Jakarta Sans / Quicksand, Material Symbols Outlined, estética editorial premium, "Mini Me - Catálogo Físico".
- Se analizó la paleta: rosa vino (`#994158`, `#f58aa3`, `#FADDE1`), menta (`#71b6b3`, `#a9efec`), superficie cálida (`#fff8f3`), tinta (`#4A3E3E`).
- **Pendiente**: el prompt maestro prometía un "md de Stitch"; llegó HTML. ¿Es suficiente o llegará el `.md`?
### 5. Estado al momento del crash (Mac) y retoma

- Última acción: **evaluar la calidad de una imagen real** (`sample/C0001.png`) para decidir el tratamiento fotográfico.
- Tras el crash se documentaron `README.md`, `project_state.md`, `claude.md`, `cmem.md`.
- **Retoma**: se migraron los datos extraídos al repo (`admin/source/products-private.json`, 158 KB, 675 productos), se creó `scripts/optimize-images.py` (WebP nativo/@2x/thumb), la estructura base `public/` (`assets/images/`, `data/`), y `.gitignore`.
- ⚠️ **Nuevo hallazgo**: el agente actual (modelo sin visión) **no puede inspeccionar imágenes**. La evaluación visual de `sample/C0001` quedó bloqueada → tratamiento fotográfico pendiente (CLI `sips`/Python o revisión manual del usuario).
- Las **imágenes (675 JPEG)** siguen en el .docx / temporal; migrar antes de limpiar el temporal.
- Se realizó el primer commit y push del repo al remote `addv-sites/minime.catalogo.git`.

## Decisiones tomadas (acordadas)

| # | Decisión |
|---|---|
| 1 | IDs duplicados → sufijo interno (`Z050-2`) sin alterar ID original |
| 2 | Imágenes baja resolución → estilización editorial, NO upscaling |
| 3 | Mobile First obligatorio |
| 4 | 100% estático / GitHub Pages / sin backend |
| 5 | Admin local fuera del build público |
| 6 | JSON público mínimo (solo catálogo) |
| 7 | `final (°)` vacío → disponibilidad aún sin definir |
| 8 | Hablar siempre en español |
| 9 | Protocolo addv-web-app: Analizar → Proponer → Confirmar → Implementar |

## Pendientes / bloqueos

- [ ] **Tratamiento fotográfico definitivo**: bloqueado — agente sin visión (ver §5). Evaluar con `sips`/Python o revisión manual del usuario.
- [ ] **Migrar imágenes (675 JPEG)** del temporal/`.docx` al repo o al pipeline de optimización.
- [ ] **Confirmar identidad visual**: ¿el HTML de Stitch es definitivo o llega el `.md`?
- [ ] **Definir stack** frontend + librería page-flip (sin Node disponible → evaluar Python/sips/brew o instalar Node).
- [ ] **Derivar género (Niña/Niño)** para secciones ambiguas.
- [ ] **Parsear tallas/colores** o conservarlos como texto.
- [ ] Implementación completa del catálogo + admin + build + deploy.

## Comandos y rutas clave

- Repo: `/Users/prolan/repos/minime_cat/`
- Datos en repo: `admin/source/products-private.json` (675 productos)
- Fuente original: `Productos.docx` (raíz del repo)
- Pipeline de imágenes: `scripts/optimize-images.py` (requiere Pillow)
- Datos/imágenes temporales: `/var/folders/vy/gdlc5dlj6_d_rp8vjpx2f3rr0000gn/T/opencode/minime/`
- Remote git: `https://github.com/addv-sites/minime.catalogo.git` (branch `main`)
- Protocolo: skill `addv-web-app`

## Próximo paso recomendado

1. **Decidir cómo evaluar las imágenes** (CLI `sips`/Python por el agente, o revisión manual del usuario) para cerrar el tratamiento fotográfico.
2. **Migrar/optimizar imágenes** al repo con `scripts/optimize-images.py`.
3. Proponer la **arquitectura técnica** (stack + page-flip) para aprobación del usuario (segmento 1 del protocolo).